"use client"

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
import { Trash2, RotateCcw } from "lucide-react"
import { useState } from "react"

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
  status: "nova" | "em_andamento" | "concluida" | "arquivada" | "trash"
  priority: "low" | "medium" | "high"
  due_date: string
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
  assigned_user?: User | null
  created_by_user?: User | null
}

interface TrashTasksModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  onRestoreTask: (taskId: string) => void
  onDeletePermanently: (taskId: string) => void
}

export default function TrashTasksModal({
  isOpen,
  onClose,
  tasks,
  onRestoreTask,
  onDeletePermanently,
}: TrashTasksModalProps) {
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const trashTasks = tasks.filter((task) => task.status === "trash")

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

  const handleDeletePermanently = (task: Task) => {
    setTaskToDelete(task)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeletePermanently(taskToDelete.id)
      setTaskToDelete(null)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Lixeira
            </DialogTitle>
            <DialogDescription>
              Visualize tarefas na lixeira. Você pode restaurá-las ou excluí-las permanentemente.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {trashTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>A lixeira está vazia.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trashTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow border-red-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base text-gray-600">{task.titulo}</CardTitle>
                          {task.descricao && <CardDescription className="text-sm">{task.descricao}</CardDescription>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => onRestoreTask(task.id)}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restaurar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeletePermanently(task)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
                        <Badge variant="destructive">Na Lixeira</Badge>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
