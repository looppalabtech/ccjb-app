"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Note } from "@/types/task"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskNotesProps {
  notes: Note[]
  onAddNote: (content: string) => void
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

export default function TaskNotes({ notes, onAddNote, currentUser }: TaskNotesProps) {
  const [newNote, setNewNote] = useState("")

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote("")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Adicionar nota</h3>
        <Textarea
          placeholder="Digite uma nota sobre o progresso desta tarefa..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[80px]"
        />
        <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
          Adicionar Nota
        </Button>
      </div>

      {notes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Histórico de notas</h3>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="space-y-1">
                  <div className="flex items-center mb-1">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={note.user?.avatar || "/placeholder.svg"} alt={note.user?.name} />
                      <AvatarFallback>
                        {note.user?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{note.user?.name}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                  <div className="h-px bg-gray-200 my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
