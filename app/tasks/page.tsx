"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, ArrowLeft, Edit, Trash2, Clock, AlertCircle, Check, Archive } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getTasks, createTask, updateTask, deleteTask, getUsers } from "@/lib/supabase"
import TaskCreateModal from "@/components/task-create-modal"
import ArchivedTasksModal from "@/components/archived-tasks-modal"
import TrashTasksModal from "@/components/trash-tasks-modal"

interface UserType {
  id: string
  name: string
  email: string
  avatar_url?: string
}

interface Task {
  id: string
  titulo: string
  descricao?: string
  status: "nova" | "em_andamento" | "concluida" | "arquivada" | "lixeira"
  priority: "low" | "medium" | "high"
  due_date: string
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  assigned_user?: UserType | null
  created_by_user?: UserType | null
}

interface CreateTaskData {
  titulo: string
  descricao?: string
  priority: "low" | "medium" | "high"
  due_date: string
  assigned_to?: string
}

export default function TasksPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false)
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  useEffect(() => {
    loadTasks()
    loadUsers()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await getTasks()

      if (error) {
        console.error("Erro ao carregar tarefas:", error)
        return
      }

      setTasks(data || [])
    } catch (error) {
      console.error("Erro inesperado ao carregar tarefas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await getUsers()

      if (error) {
        console.error("Erro ao carregar usuários:", error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Erro inesperado ao carregar usuários:", error)
    }
  }

  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      const { data, error } = await createTask(taskData)

      if (error) {
        console.error("Erro ao criar tarefa:", error)
        alert("Erro ao criar tarefa. Tente novamente.")
        return
      }

      await loadTasks()
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Erro inesperado ao criar tarefa:", error)
      alert("Erro inesperado ao criar tarefa.")
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const { error } = await updateTask(taskId, { status: newStatus })

      if (error) {
        console.error("Erro ao atualizar status:", error)
        return
      }

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    } catch (error) {
      console.error("Erro inesperado ao atualizar status:", error)
    }
  }

  const handleDeleteTask = async (task: Task) => {
    setTaskToDelete(task)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      // Mover para lixeira em vez de deletar
      const { error } = await updateTask(taskToDelete.id, { status: "lixeira" })

      if (error) {
        console.error("Erro ao mover tarefa para lixeira:", error)
        return
      }

      setTasks(tasks.map((task) => (task.id === taskToDelete.id ? { ...task, status: "lixeira" } : task)))
      setTaskToDelete(null)
    } catch (error) {
      console.error("Erro inesperado ao mover tarefa para lixeira:", error)
    }
  }

  // Filtrar tarefas por status (excluindo arquivadas e lixeira)
  const activeTasks = tasks.filter((task) => !["arquivada", "lixeira"].includes(task.status))
  const newTasks = activeTasks.filter((task) => task.status === "nova")
  const inProgressTasks = activeTasks.filter((task) => task.status === "em_andamento")
  const completedTasks = activeTasks.filter((task) => task.status === "concluida")

  // Funções auxiliares para UI
  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "concluida":
        return <Check className="h-4 w-4" />
      case "em_andamento":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "concluida":
        return "bg-green-100 text-green-800"
      case "em_andamento":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "concluida":
        return "Concluída"
      case "em_andamento":
        return "Em Andamento"
      default:
        return "Nova"
    }
  }

  const getPriorityText = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      default:
        return "Baixa"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const currentUser = profile
    ? {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar_url || "/placeholder.svg?height=32&width=32",
      }
    : {
        id: user?.id || "",
        name: user?.email?.split("@")[0] || "Usuário",
        email: user?.email || "",
        avatar: "/placeholder.svg?height=32&width=32",
      }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando tarefas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestor de Tarefas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
              <Button onClick={() => setIsArchivedModalOpen(true)} variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Arquivadas
              </Button>
              <Button onClick={() => setIsTrashModalOpen(true)} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Lixeira
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Tasks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Novas ({newTasks.length})</h2>
            <div className="space-y-4">
              {newTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`hover:shadow-md transition-shadow ${isOverdue(task.due_date) ? "border-red-300 bg-red-50" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{task.titulo}</CardTitle>
                        {task.descricao && <CardDescription className="text-sm">{task.descricao}</CardDescription>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{getStatusText(task.status)}</span>
                      </Badge>
                    </div>
                    <div
                      className={`text-sm mt-2 ${isOverdue(task.due_date) ? "text-red-600 font-medium" : "text-gray-500"}`}
                    >
                      Prazo: {new Date(task.due_date).toLocaleDateString("pt-BR")}
                      {isOverdue(task.due_date) && <span className="ml-1">(Atrasada)</span>}
                    </div>
                    {task.assigned_user && (
                      <div className="flex items-center mt-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage
                            src={task.assigned_user.avatar_url || "/placeholder.svg"}
                            alt={task.assigned_user.name}
                          />
                          <AvatarFallback>
                            {task.assigned_user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">{task.assigned_user.name}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button size="sm" onClick={() => handleStatusChange(task.id, "em_andamento")} className="w-full">
                      Iniciar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress Tasks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Em Andamento ({inProgressTasks.length})</h2>
            <div className="space-y-4">
              {inProgressTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`hover:shadow-md transition-shadow ${isOverdue(task.due_date) ? "border-red-300 bg-red-50" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{task.titulo}</CardTitle>
                        {task.descricao && <CardDescription className="text-sm">{task.descricao}</CardDescription>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{getStatusText(task.status)}</span>
                      </Badge>
                    </div>
                    <div
                      className={`text-sm mt-2 ${isOverdue(task.due_date) ? "text-red-600 font-medium" : "text-gray-500"}`}
                    >
                      Prazo: {new Date(task.due_date).toLocaleDateString("pt-BR")}
                      {isOverdue(task.due_date) && <span className="ml-1">(Atrasada)</span>}
                    </div>
                    {task.assigned_user && (
                      <div className="flex items-center mt-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage
                            src={task.assigned_user.avatar_url || "/placeholder.svg"}
                            alt={task.assigned_user.name}
                          />
                          <AvatarFallback>
                            {task.assigned_user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">{task.assigned_user.name}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button size="sm" onClick={() => handleStatusChange(task.id, "concluida")} className="w-full">
                      Concluir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Completed Tasks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Concluídas ({completedTasks.length})</h2>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{task.titulo}</CardTitle>
                        {task.descricao && <CardDescription className="text-sm">{task.descricao}</CardDescription>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{getStatusText(task.status)}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Prazo: {new Date(task.due_date).toLocaleDateString("pt-BR")}
                    </div>
                    {task.assigned_user && (
                      <div className="flex items-center mt-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage
                            src={task.assigned_user.avatar_url || "/placeholder.svg"}
                            alt={task.assigned_user.name}
                          />
                          <AvatarFallback>
                            {task.assigned_user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">{task.assigned_user.name}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(task.id, "nova")}
                      className="flex-1"
                    >
                      Reabrir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "arquivada")}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Arquivar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
      />

      {/* Archived Tasks Modal */}
      <ArchivedTasksModal
        isOpen={isArchivedModalOpen}
        onClose={() => setIsArchivedModalOpen(false)}
        tasks={tasks}
        onRestoreTask={(taskId) => handleStatusChange(taskId, "nova")}
      />

      {/* Trash Tasks Modal */}
      <TrashTasksModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        tasks={tasks}
        onRestoreTask={(taskId) => handleStatusChange(taskId, "nova")}
        onDeletePermanently={async (taskId) => {
          await deleteTask(taskId)
          await loadTasks()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover esta tarefa para a lixeira? Você poderá restaurá-la posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-600 hover:bg-red-700">
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
