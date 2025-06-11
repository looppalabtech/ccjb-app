"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { ArchiveX, Clock, AlertCircle, Check, Trash2 } from "lucide-react"

interface User {
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
  assigned_user?: User | null
  created_by_user?: User | null
}

interface ArchivedTasksModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  onRestoreTask: (taskId: string) => void
  onMoveToTrash: (taskId: string) => void
}

export default function ArchivedTasksModal({
  isOpen,
  onClose,
  tasks,
  onRestoreTask,
  onMoveToTrash,
}: ArchivedTasksModalProps) {
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const archivedTasks = tasks.filter((task) => task.status === "arquivada")

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

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      // 3. Mover para lixeira em vez de excluir permanentemente
      onMoveToTrash(taskToDelete.id)
      setTaskToDelete(null)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ArchiveX className="h-5 w-5 mr-2" />
              Tarefas Arquivadas
            </DialogTitle>
            <DialogDescription>Visualize e restaure tarefas que foram arquivadas.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {archivedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArchiveX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma tarefa arquivada encontrada.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {archivedTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base">{task.titulo}</CardTitle>
                          {task.descricao && <CardDescription className="text-sm">{task.descricao}</CardDescription>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => onRestoreTask(task.id)}>
                            <ArchiveX className="h-4 w-4 mr-1" />
                            Restaurar
                          </Button>
                          {/* 3. Botão vermelho para mover para lixeira */}
                          <Button
                            size="sm"
                            onClick={() => handleDeleteClick(task)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
                        <Badge variant="outline">Arquivada</Badge>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        Prazo: {new Date(task.due_date).toLocaleDateString("pt-BR")}
                      </div>
                      {task.assigned_user && (
                        <div className="flex items-center">
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
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Move to Trash */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover Tarefa para Lixeira</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover a tarefa "{taskToDelete?.titulo}" para a lixeira? Você poderá restaurá-la
              posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
