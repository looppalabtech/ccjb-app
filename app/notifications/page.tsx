"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getNotifications, deleteNotification } from "@/lib/supabase"

interface Notification {
  id: string
  titulo: string
  descricao: string | null
  created_at: string
  read: boolean
  created_by_user: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  } | null
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
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

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await deleteNotification(notificationId)

      if (error) {
        console.error("Erro ao deletar notificação:", error)
        alert("Erro ao deletar notificação. Tente novamente.")
        return
      }

      // Remover da lista local
      setNotifications(notifications.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("Erro inesperado ao deletar notificação:", error)
      alert("Erro inesperado ao deletar notificação.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
            <Badge variant="secondary" className="ml-4">
              {notifications.length} {notifications.length === 1 ? "tarefa" : "tarefas"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
              <p className="text-gray-500 text-center">Você não tem tarefas atribuídas no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{notification.titulo}</CardTitle>
                      <CardDescription className="mt-1">{notification.descricao || "Sem descrição"}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={notification.created_by_user?.avatar_url || "/placeholder.svg"}
                          alt={notification.created_by_user?.name || "Usuário"}
                        />
                        <AvatarFallback>
                          {notification.created_by_user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Atribuída por {notification.created_by_user?.name || "Usuário desconhecido"}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
