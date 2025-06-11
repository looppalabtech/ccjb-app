"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, getCurrentUser, getUserProfile } from "@/lib/supabase"

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await getUserProfile(userId)
      if (!error && profileData) {
        setProfile(profileData)
      } else {
        console.log("⚠️ Perfil não encontrado na tabela users para:", userId)
        setProfile(null)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error)
      setProfile(null)
    }
  }

  useEffect(() => {
    let mounted = true

    // Função para inicializar a autenticação
    const initializeAuth = async () => {
      try {
        console.log("🔄 Inicializando autenticação...")

        // Verificar se há um usuário logado ao carregar a página
        const { user: currentUser, error } = await getCurrentUser()

        if (!mounted) return

        if (error) {
          console.error("❌ Erro ao verificar usuário atual:", error.message)
        }

        if (currentUser) {
          console.log("✅ Usuário encontrado:", currentUser.email)
          setUser(currentUser)
          await loadUserProfile(currentUser.id)
        } else {
          console.log("ℹ️ Nenhum usuário logado")
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("❌ Erro na inicialização da autenticação:", error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Inicializar autenticação
    initializeAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("🔄 Mudança de estado de autenticação:", event)

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ Usuário logado:", session.user.email)
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 Usuário deslogado")
        setUser(null)
        setProfile(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token renovado para:", session.user.email)
        setUser(session.user)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (data.user && !error) {
        console.log("✅ Login bem-sucedido, carregando perfil...")
        await loadUserProfile(data.user.id)
      }

      return { error }
    } catch (error) {
      console.error("❌ Erro inesperado no login:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setProfile(null)
    } catch (error) {
      console.error("❌ Erro no logout:", error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
