"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, AlertCircle, Check, Save, X } from "lucide-react"
import { format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskUser {
  id: string
  name: string
  email: string
  avatar_url?: string
}

interface TaskNote {
  id: string
  content: string
  created_at: string
  user?: TaskUser
}

interface TaskDetailViewProps {
  isOpen: boolean
  onClose: () => void
  task: {
    id: string
    titulo: string
    descricao?: string
    status: "nova" | "em_andamento" | "concluida" | "arquivada" | "lixeira"
    priority: "low" | "medium" | "high"
    due_date: string
    created_at: string
    assigned_user?: TaskUser | null
    created_by_user?: TaskUser | null
    notes?: TaskNote[]
  }
  onUpdateTask: (taskId: string, updates: any) => void
}

export default function TaskDetailView({ isOpen, onClose, task, onUpdateTask }: TaskDetailViewProps) {
  const [notes, setNotes] = useState<TaskNote[]>(task.notes || [])
  const [newNote, setNewNote] = useState("")
  const [editingNote, setEditingNote] = useState<TaskNote | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<TaskNote | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (!isValid(date)) {
      return "Data inválida"
    }
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatSimpleDate = (dateString: string) => {
    const date = new Date(dateString)
    if (!isValid(date)) {
      return "Data inválida"
    }
    return format(date, "dd/MM/yyyy")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluida":
        return <Check className="h-4 w-4" />
      case "em_andamento":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "bg-green-100 text-green-800"
      case "em_andamento":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluida":
        return "Concluída"
      case "em_andamento":
        return "Em Andamento"
      default:
        return "Nova"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      default:
        return "Baixa"
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: TaskNote = {
        id: `n${Date.now()}`,
        content: newNote.trim(),
        created_at: new Date().toISOString(),
        user: {
          id: "current-user",
          name: "Usuário Atual",
          email: "user@example.com",
        },
      }
      const updatedNotes = [...notes, note]
      setNotes(updatedNotes)
      setNewNote("")
      setIsAddingNote(false)

      // Atualizar a tarefa
      onUpdateTask(task.id, { notes: updatedNotes })
    }
  }

  const handleEditNote = (note: TaskNote) => {
    setEditingNote(note)
    setEditingContent(note.content)
  }

  const handleSaveEdit = () => {
    if (editingNote && editingContent.trim()) {
      const updatedNotes = notes.map((note) =>
        note.id === editingNote.id ? { ...note, content: editingContent.trim() } : note,
      )
      setNotes(updatedNotes)
      setEditingNote(null)
      setEditingContent("")

      // Atualizar a tarefa
      onUpdateTask(task.id, { notes: updatedNotes })
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditingContent("")
  }

  const handleDeleteNote = (note: TaskNote) => {
    setNoteToDelete(note)
  }

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      const updatedNotes = notes.filter((note) => note.id !== noteToDelete.id)
      setNotes(updatedNotes)
      setNoteToDelete(null)

      // Atualizar a tarefa
      onUpdateTask(task.id, { notes: updatedNotes })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onClose} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Detalhes da Tarefa</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{task.titulo}</CardTitle>
                    {task.descricao && <CardDescription className="text-base">{task.descricao}</CardDescription>}
                  </div>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <Badge className={getPriorityColor(task.priority)}>
                    Prioridade: {getPriorityText(task.priority)}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{getStatusText(task.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Prazo: {formatSimpleDate(task.due_date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Criada em: {formatSimpleDate(task.created_at)}</span>
                  </div>
                </div>
                {task.assigned_user && (
                  <div className="mt-4">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
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
                      <div>
                        <p className="text-sm font-medium">{task.assigned_user.name}</p>
                        <p className="text-xs text-gray-500">{task.assigned_user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de notas:</span>
                  <span className="font-semibold">{notes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(task.status)} variant="secondary">
                    {getStatusText(task.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prioridade:</span>
                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                    {getPriorityText(task.priority)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Notas da Tarefa</CardTitle>
                <Button onClick={() => setIsAddingNote(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Nota
                </Button>
              </div>
              <CardDescription>
                Acompanhe o progresso e registre informações importantes sobre esta tarefa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma nota adicionada ainda.</p>
                  <p className="text-sm">Clique em "Nova Nota" para começar a documentar o progresso.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <Card key={note.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          {editingNote?.id === note.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="min-h-[80px]"
                                placeholder="Digite o conteúdo da nota..."
                              />
                              <div className="flex items-center space-x-2">
                                <Button size="sm" onClick={handleSaveEdit}>
                                  <Save className="h-3 w-3 mr-1" />
                                  Salvar
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                  <X className="h-3 w-3 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center mb-2">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage
                                    src={note.user?.avatar_url || "/placeholder.svg"}
                                    alt={note.user?.name}
                                  />
                                  <AvatarFallback>
                                    {note.user?.name
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{note.user?.name || "Usuário"}</span>
                              </div>
                              <p className="text-sm mb-3 whitespace-pre-wrap">{note.content}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">{formatDate(note.created_at)}</p>
                                <div className="flex items-center space-x-1">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditNote(note)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteNote(note)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Nota</DialogTitle>
            <DialogDescription>Registre informações importantes sobre o progresso desta tarefa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Digite o conteúdo da nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNote(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Adicionar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNote} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
