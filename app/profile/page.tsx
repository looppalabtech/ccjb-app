"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, LogOut, User, Mail, Calendar, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const currentUser = profile
    ? {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar_url || "/placeholder.svg?height=128&width=128",
        role: profile.role || "user",
        createdAt: profile.created_at,
      }
    : {
        id: user?.id || "",
        name: user?.email?.split("@")[0] || "Usuário",
        email: user?.email || "",
        avatar: "/placeholder.svg?height=128&width=128",
        role: "user",
        createdAt: user?.created_at,
      }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "user":
        return "Usuário"
      default:
        return "Usuário"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Perfil do Usuário</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* 4. Botão Sair */}
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{currentUser.name}</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
                <Badge className={getRoleColor(currentUser.role)}>{getRoleText(currentUser.role)}</Badge>
              </CardHeader>
            </Card>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Detalhes da sua conta no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      Nome Completo
                    </div>
                    <p className="text-gray-900">{currentUser.name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </div>
                    <p className="text-gray-900">{currentUser.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Função
                    </div>
                    <Badge className={getRoleColor(currentUser.role)}>{getRoleText(currentUser.role)}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Membro desde
                    </div>
                    <p className="text-gray-900">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString("pt-BR")
                        : "Data não disponível"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ações da Conta</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair da Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
