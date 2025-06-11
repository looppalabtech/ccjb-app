"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Bell, Check, Trash2, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/lib/supabase"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
  task_id: string
  tasks?: {
    titulo: string
    status: string
  }
}

export default function NotificationsPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await getNotifications(user.id)

      if (error) {
        console.error("Erro ao carregar notificações:", error)
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error("Erro inesperado ao carregar notificações:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await markNotificationAsRead(notificationId)

      if (error) {
        console.error("Erro ao marcar notificação como lida:", error)
        return
      }

      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Erro inesperado ao marcar notificação como lida:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const { error } = await deleteNotification(notificationId)

      if (error) {
        console.error("Erro ao deletar notificação:", error)
        return
      }

      setNotifications(notifications.filter((notification) => notification.id !== notificationId))
    } catch (error) {
      console.error("Erro inesperado ao deletar notificação:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
              {unreadCount > 0 && <Badge className="ml-3 bg-red-500 text-white">{unreadCount} não lidas</Badge>}
            </div>
            <div className="flex items-center space-x-4">
              {/* 5. Link para perfil do usuário */}
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage
                    src={profile?.avatar_url || "/placeholder.svg?height=32&width=32"}
                    alt={profile?.name || user?.email || ""}
                  />
                  <AvatarFallback>
                    {profile?.name
                      ? profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
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
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-500">Você não tem notificações no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.read ? "border-blue-200 bg-blue-50" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.read && <Badge className="bg-blue-500 text-white text-xs">Nova</Badge>}
                      </div>
                      <CardDescription className="text-sm">{notification.message}</CardDescription>
                      {notification.tasks && (
                        <p className="text-xs text-gray-500">
                          Tarefa: {notification.tasks.titulo} ({notification.tasks.status})
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(notification.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Marcar como lida
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
