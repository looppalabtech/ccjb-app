"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  FileText,
  ThumbsUp,
  ThumbsDown,
  User,
} from "lucide-react"
import type { RepresentanteLegal, Flow, Note, ParecerFinal } from "@/types/task"

// Importar as funções do Supabase
import {
  createFlowRepresentante,
  updateFlowRepresentante,
  deleteFlowRepresentante,
  createNoteRepresentante,
  updateNoteRepresentante,
  deleteNoteRepresentante,
  createParecerFinalRepresentante,
  updateParecerFinalRepresentante,
} from "@/lib/supabase"

interface RepresentanteLegalDetailViewProps {
  representante: RepresentanteLegal
  onClose: () => void
  onUpdateRepresentante: (representante: RepresentanteLegal) => void
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
}

export default function RepresentanteLegalDetailView({
  representante,
  onClose,
  onUpdateRepresentante,
  currentUser,
}: RepresentanteLegalDetailViewProps) {
  const [flows, setFlows] = useState<Flow[]>(representante.flows || [])
  const [notes, setNotes] = useState<Note[]>(representante.notes || [])
  const [parecerFinal, setParecerFinal] = useState<ParecerFinal | undefined>(representante.parecer_final)

  // Estados para fluxos
  const [isAddingFlow, setIsAddingFlow] = useState(false)
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null)
  const [nomeFluxo, setNomeFluxo] = useState<Flow["nome_fluxo"]>("contrato social")
  const [checkFluxo, setCheckFluxo] = useState<Flow["check_fluxo"]>("válido")
  const [observacao, setObservacao] = useState("")

  // Estados para notas
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState("")
  const [newNoteTipo, setNewNoteTipo] = useState<Note["tipo"]>("Alerta Normal")
  const [editingContent, setEditingContent] = useState("")
  const [editingNoteTipo, setEditingNoteTipo] = useState<Note["tipo"]>("Alerta Normal")

  // Estados para parecer final
  const [isAddingParecer, setIsAddingParecer] = useState(false)
  const [isEditingParecer, setIsEditingParecer] = useState(false)
  const [newParecerRisco, setNewParecerRisco] = useState<ParecerFinal["risco"]>("Baixo")
  const [newParecerOrientacao, setNewParecerOrientacao] = useState<ParecerFinal["orientacao"]>("Aprovar")
  const [newParecerTexto, setNewParecerTexto] = useState("")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getCheckFluxoIcon = (check: Flow["check_fluxo"]) => {
    switch (check) {
      case "válido":
      case "compatível":
      case "positivo":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inválido":
      case "inconsistente":
      case "negativo":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getCheckFluxoColor = (check: Flow["check_fluxo"]) => {
    switch (check) {
      case "válido":
      case "compatível":
      case "positivo":
        return "bg-green-100 text-green-800"
      case "inválido":
      case "inconsistente":
      case "negativo":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNoteTipoIcon = (tipo: Note["tipo"]) => {
    switch (tipo) {
      case "Alerta Crítico":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "Alerta Normal":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "Aviso":
        return <Info className="h-4 w-4 text-blue-600" />
      case "Pendência":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "Reenvio de Documentos":
        return <Mail className="h-4 w-4 text-purple-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getNoteTipoColor = (tipo: Note["tipo"]) => {
    switch (tipo) {
      case "Alerta Crítico":
        return "bg-red-100 text-red-800"
      case "Alerta Normal":
        return "bg-yellow-100 text-yellow-800"
      case "Aviso":
        return "bg-blue-100 text-blue-800"
      case "Pendência":
        return "bg-orange-100 text-orange-800"
      case "Reenvio de Documentos":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (risco: ParecerFinal["risco"]) => {
    switch (risco) {
      case "Alto":
        return "bg-red-100 text-red-800"
      case "Médio":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getOrientacaoColor = (orientacao: ParecerFinal["orientacao"]) => {
    switch (orientacao) {
      case "Aprovar":
        return "bg-green-100 text-green-800"
      case "Rejeitar":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrientacaoIcon = (orientacao: ParecerFinal["orientacao"]) => {
    switch (orientacao) {
      case "Aprovar":
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case "Rejeitar":
        return <ThumbsDown className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // ===== FUNÇÕES PARA FLUXOS =====

  const handleAddFlow = async () => {
    if (observacao.trim()) {
      try {
        const { data, error } = await createFlowRepresentante({
          representante_legal_id: representante.id,
          nome_fluxo: nomeFluxo,
          check_fluxo: checkFluxo,
          observacao: observacao.trim(),
        })

        if (error) {
          console.error("Erro ao criar fluxo:", error)
          alert("Erro ao criar fluxo. Tente novamente.")
          return
        }

        if (data) {
          const newFlow: Flow = {
            id: data.id,
            nome_fluxo: data.nome_fluxo,
            check_fluxo: data.check_fluxo,
            observacao: data.observacao,
            created_at: data.created_at,
            created_by: data.created_by,
            company_id: data.company_id,
            representante_legal_id: data.representante_legal_id,
            user: data.user,
          }

          const updatedFlows = [...flows, newFlow]
          setFlows(updatedFlows)
          setObservacao("")
          setNomeFluxo("contrato social")
          setCheckFluxo("válido")
          setIsAddingFlow(false)

          // Atualizar o representante
          const updatedRepresentante = { ...representante, flows: updatedFlows }
          onUpdateRepresentante(updatedRepresentante)
        }
      } catch (error) {
        console.error("Erro inesperado ao criar fluxo:", error)
        alert("Erro inesperado ao criar fluxo.")
      }
    }
  }

  const handleEditFlow = (flow: Flow) => {
    setEditingFlow(flow)
    setNomeFluxo(flow.nome_fluxo)
    setCheckFluxo(flow.check_fluxo)
    setObservacao(flow.observacao)
  }

  const handleSaveEditFlow = async () => {
    if (editingFlow && observacao.trim()) {
      try {
        const { data, error } = await updateFlowRepresentante(editingFlow.id, {
          nome_fluxo: nomeFluxo,
          check_fluxo: checkFluxo,
          observacao: observacao.trim(),
        })

        if (error) {
          console.error("Erro ao atualizar fluxo:", error)
          alert("Erro ao atualizar fluxo. Tente novamente.")
          return
        }

        if (data) {
          const updatedFlows = flows.map((flow) =>
            flow.id === editingFlow.id
              ? {
                  ...flow,
                  nome_fluxo: data.nome_fluxo,
                  check_fluxo: data.check_fluxo,
                  observacao: data.observacao,
                }
              : flow,
          )

          setFlows(updatedFlows)
          setEditingFlow(null)
          setObservacao("")
          setNomeFluxo("contrato social")
          setCheckFluxo("válido")

          // Atualizar o representante
          const updatedRepresentante = { ...representante, flows: updatedFlows }
          onUpdateRepresentante(updatedRepresentante)
        }
      } catch (error) {
        console.error("Erro inesperado ao atualizar fluxo:", error)
        alert("Erro inesperado ao atualizar fluxo.")
      }
    }
  }

  const handleCancelEditFlow = () => {
    setEditingFlow(null)
    setObservacao("")
    setNomeFluxo("contrato social")
    setCheckFluxo("válido")
  }

  const handleDeleteFlow = (flow: Flow) => {
    setFlowToDelete(flow)
  }

  const confirmDeleteFlow = async () => {
    if (flowToDelete) {
      try {
        const { error } = await deleteFlowRepresentante(flowToDelete.id)

        if (error) {
          console.error("Erro ao deletar fluxo:", error)
          alert("Erro ao deletar fluxo. Tente novamente.")
          return
        }

        const updatedFlows = flows.filter((flow) => flow.id !== flowToDelete.id)
        setFlows(updatedFlows)
        setFlowToDelete(null)

        // Atualizar o representante
        const updatedRepresentante = { ...representante, flows: updatedFlows }
        onUpdateRepresentante(updatedRepresentante)
      } catch (error) {
        console.error("Erro inesperado ao deletar fluxo:", error)
        alert("Erro inesperado ao deletar fluxo.")
      }
    }
  }

  // ===== FUNÇÕES PARA NOTAS =====

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const { data, error } = await createNoteRepresentante({
          representante_legal_id: representante.id,
          tipo: newNoteTipo,
          content: newNote.trim(),
        })

        if (error) {
          console.error("Erro ao criar nota:", error)
          alert("Erro ao criar nota. Tente novamente.")
          return
        }

        if (data) {
          const newNoteObj: Note = {
            id: data.id,
            tipo: data.tipo,
            content: data.content,
            created_at: data.created_at,
            created_by: data.created_by,
            company_id: data.company_id,
            representante_legal_id: data.representante_legal_id,
            user: data.user,
          }

          const updatedNotes = [...notes, newNoteObj]
          setNotes(updatedNotes)
          setNewNote("")
          setNewNoteTipo("Alerta Normal")
          setIsAddingNote(false)

          // Atualizar o representante
          const updatedRepresentante = { ...representante, notes: updatedNotes }
          onUpdateRepresentante(updatedRepresentante)
        }
      } catch (error) {
        console.error("Erro inesperado ao criar nota:", error)
        alert("Erro inesperado ao criar nota.")
      }
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setEditingContent(note.content)
    setEditingNoteTipo(note.tipo)
  }

  const handleSaveEditNote = async () => {
    if (editingNote && editingContent.trim()) {
      try {
        const { data, error } = await updateNoteRepresentante(editingNote.id, {
          tipo: editingNoteTipo,
          content: editingContent.trim(),
        })

        if (error) {
          console.error("Erro ao atualizar nota:", error)
          alert("Erro ao atualizar nota. Tente novamente.")
          return
        }

        if (data) {
          const updatedNotes = notes.map((note) =>
            note.id === editingNote.id ? { ...note, content: data.content, tipo: data.tipo } : note,
          )

          setNotes(updatedNotes)
          setEditingNote(null)
          setEditingContent("")
          setEditingNoteTipo("Alerta Normal")

          // Atualizar o representante
          const updatedRepresentante = { ...representante, notes: updatedNotes }
          onUpdateRepresentante(updatedRepresentante)
        }
      } catch (error) {
        console.error("Erro inesperado ao atualizar nota:", error)
        alert("Erro inesperado ao atualizar nota.")
      }
    }
  }

  const handleCancelEditNote = () => {
    setEditingNote(null)
    setEditingContent("")
    setEditingNoteTipo("Alerta Normal")
  }

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note)
  }

  const confirmDeleteNote = async () => {
    if (noteToDelete) {
      try {
        const { error } = await deleteNoteRepresentante(noteToDelete.id)

        if (error) {
          console.error("Erro ao deletar nota:", error)
          alert("Erro ao deletar nota. Tente novamente.")
          return
        }

        const updatedNotes = notes.filter((note) => note.id !== noteToDelete.id)
        setNotes(updatedNotes)
        setNoteToDelete(null)

        // Atualizar o representante
        const updatedRepresentante = { ...representante, notes: updatedNotes }
        onUpdateRepresentante(updatedRepresentante)
      } catch (error) {
        console.error("Erro inesperado ao deletar nota:", error)
        alert("Erro inesperado ao deletar nota.")
      }
    }
  }

  // ===== FUNÇÕES PARA PARECER FINAL =====

  const handleAddParecer = async () => {
    if (newParecerTexto.trim()) {
      try {
        const { data, error } = await createParecerFinalRepresentante({
          representante_legal_id: representante.id,
          risco: newParecerRisco,
          orientacao: newParecerOrientacao,
          parecer: newParecerTexto.trim(),
        })

        if (error) {
          console.error("Erro ao criar parecer:", error)
          alert("Erro ao criar parecer. Tente novamente.")
          return
        }

        if (data) {
          const newParecer: ParecerFinal = {
            id: data.id,
            risco: data.risco,
            orientacao: data.orientacao,
            parecer: data.parecer,
            created_at: data.created_at,
            created_by: data.created_by,
            company_id: data.company_id,
            representante_legal_id: data.representante_legal_id,
            user: data.user,
          }

          setParecerFinal(newParecer)
          setNewParecerTexto("")
          setNewParecerRisco("Baixo")
          setNewParecerOrientacao("Aprovar")
          setIsAddingParecer(false)

          // Atualizar o representante
          const updatedRepresentante = { ...representante, parecer_final: newParecer }
          onUpdateRepresentante(updatedRepresentante)
        }
      } catch (error) {
        console.error("Erro inesperado ao criar parecer:", error)
        alert("Erro inesperado ao criar parecer.")
      }
    }
  }

  const handleEditParecer = () => {
    if (parecerFinal) {
      setNewParecerRisco(parecerFinal.risco)
      setNewParecerOrientacao(parecerFinal.orientacao)
      setNewParecerTexto(parecerFinal.parecer)
      setIsEditingParecer(true)
    }
  }

  const handleSaveEditParecer = async () => {
    if (parecerFinal && newParecerTexto.trim()) {
      try {
        const { data, error } = await updateParecerFinalRepresentante(parecerFinal.id, {
          risco: newParecerRisco,
          orientacao: newParecerOrientacao,
          parecer: newParecerTexto.trim(),
        })

        if (error) {
          console.error("Erro ao atualizar parecer:", error)
          alert("Erro ao atualizar parecer. Tente novamente.")
          return
        }

        if (data) {
          const updatedParecer: ParecerFinal = {
            ...parecerFinal,
            risco: data.risco,
            orientacao: data.orientacao,
            parecer: data.parecer,
          }

          setParecerFinal(updatedParecer)
          setIsEditingParecer(false)
          setNewParecerTexto("")
          setNewParecerRisco("Baixo")
          setNewParecerOrientacao("Aprovar")

          // Atualizar o representante
          const updatedRepresentante = { ...representante, parecer_final: updatedParecer }
          onUpdateRepresentante(updatedRepresentante)
        }
      } catch (error) {
        console.error("Erro inesperado ao atualizar parecer:", error)
        alert("Erro inesperado ao atualizar parecer.")
      }
    }
  }

  const handleCancelEditParecer = () => {
    setIsEditingParecer(false)
    setNewParecerTexto("")
    setNewParecerRisco("Baixo")
    setNewParecerOrientacao("Aprovar")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onClose} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <User className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Detalhes do Representante Legal</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 overflow-y-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Representante Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{representante.nome}</CardTitle>
                      <CardDescription className="text-base">CPF: {representante.cpf}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>Telefone: {representante.telefone || "Não informado"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Cadastrado em: {formatDate(representante.created_at)}</span>
                    </div>
                  </div>
                  {representante.endereco && (
                    <div className="flex items-start space-x-2 mt-4">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Endereço</p>
                        <p className="text-sm">{representante.endereco}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de fluxos:</span>
                    <span className="font-semibold">{flows.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de notas:</span>
                    <span className="font-semibold">{notes.length}</span>
                  </div>
                  {parecerFinal && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Risco:</span>
                        <Badge className={getRiskColor(parecerFinal.risco)} variant="secondary">
                          {parecerFinal.risco}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Parecer:</span>
                        <Badge className={getOrientacaoColor(parecerFinal.orientacao)} variant="secondary">
                          {parecerFinal.orientacao}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Flows Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Fluxos do Representante Legal</CardTitle>
                  <Button onClick={() => setIsAddingFlow(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fluxo
                  </Button>
                </div>
                <CardDescription>
                  Registre e acompanhe os fluxos de documentação deste representante legal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flows.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum fluxo adicionado ainda.</p>
                    <p className="text-sm">Clique em "Novo Fluxo" para começar a documentar os processos.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {flows.map((flow) => (
                        <Card key={flow.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            {editingFlow?.id === flow.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-nomeFluxo">Nome do Fluxo</Label>
                                    <Select
                                      value={nomeFluxo}
                                      onValueChange={(value: Flow["nome_fluxo"]) => setNomeFluxo(value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o fluxo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="contrato social">Contrato Social</SelectItem>
                                        <SelectItem value="cnpj">CNPJ</SelectItem>
                                        <SelectItem value="representante legal">Representante Legal</SelectItem>
                                        <SelectItem value="capital social">Capital Social</SelectItem>
                                        <SelectItem value="comprovante endereço">Comprovante de Endereço</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-checkFluxo">Check do Fluxo</Label>
                                    <Select
                                      value={checkFluxo}
                                      onValueChange={(value: Flow["check_fluxo"]) => setCheckFluxo(value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="válido">Válido</SelectItem>
                                        <SelectItem value="inválido">Inválido</SelectItem>
                                        <SelectItem value="compatível">Compatível</SelectItem>
                                        <SelectItem value="inconsistente">Inconsistente</SelectItem>
                                        <SelectItem value="positivo">Positivo</SelectItem>
                                        <SelectItem value="negativo">Negativo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="edit-observacao">Nota do Fluxo</Label>
                                  <Textarea
                                    id="edit-observacao"
                                    value={observacao}
                                    onChange={(e) => setObservacao(e.target.value)}
                                    className="min-h-[80px]"
                                    placeholder="Digite uma observação sobre este fluxo..."
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Button size="sm" onClick={handleSaveEditFlow}>
                                    <Save className="h-3 w-3 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditFlow}>
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
                                      src={flow.user?.avatar_url || "/placeholder.svg"}
                                      alt={flow.user?.name}
                                    />
                                    <AvatarFallback>
                                      {flow.user?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{flow.user?.name}</span>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                  <Badge variant="outline" className="capitalize">
                                    {flow.nome_fluxo}
                                  </Badge>
                                  <Badge className={getCheckFluxoColor(flow.check_fluxo)}>
                                    {getCheckFluxoIcon(flow.check_fluxo)}
                                    <span className="ml-1 capitalize">{flow.check_fluxo}</span>
                                  </Badge>
                                </div>

                                <p className="text-sm mb-3 whitespace-pre-wrap">{flow.observacao}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">{formatDate(flow.created_at)}</p>
                                  <div className="flex items-center space-x-1">
                                    {flow.user?.id === currentUser.id && (
                                      <>
                                        <Button size="sm" variant="ghost" onClick={() => handleEditFlow(flow)}>
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteFlow(flow)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
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

          {/* Notes Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Notas do Representante Legal</CardTitle>
                  <Button onClick={() => setIsAddingNote(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Nota
                  </Button>
                </div>
                <CardDescription>Registre informações importantes sobre este representante legal</CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma nota adicionada ainda.</p>
                    <p className="text-sm">Clique em "Nova Nota" para começar a documentar informações.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <Card key={note.id} className="border-l-4 border-l-green-500">
                          <CardContent className="pt-4">
                            {editingNote?.id === note.id ? (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-noteTipo">Tipo da Nota</Label>
                                  <Select
                                    value={editingNoteTipo}
                                    onValueChange={(value: Note["tipo"]) => setEditingNoteTipo(value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Alerta Crítico">Alerta Crítico</SelectItem>
                                      <SelectItem value="Alerta Normal">Alerta Normal</SelectItem>
                                      <SelectItem value="Aviso">Aviso</SelectItem>
                                      <SelectItem value="Pendência">Pendência</SelectItem>
                                      <SelectItem value="Reenvio de Documentos">Reenvio de Documentos</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="min-h-[80px]"
                                  placeholder="Digite o conteúdo da nota..."
                                />
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" onClick={handleSaveEditNote}>
                                    <Save className="h-3 w-3 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditNote}>
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
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{note.user?.name}</span>
                                </div>

                                <div className="mb-3">
                                  <Badge className={getNoteTipoColor(note.tipo)}>
                                    {getNoteTipoIcon(note.tipo)}
                                    <span className="ml-1">{note.tipo}</span>
                                  </Badge>
                                </div>

                                <p className="text-sm mb-3 whitespace-pre-wrap">{note.content}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">{formatDate(note.created_at)}</p>
                                  <div className="flex items-center space-x-1">
                                    {note.user?.id === currentUser.id && (
                                      <>
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
                                      </>
                                    )}
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

          {/* Parecer Final Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Parecer Final do Representante Legal</CardTitle>
                  {!parecerFinal && (
                    <Button onClick={() => setIsAddingParecer(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Parecer
                    </Button>
                  )}
                </div>
                <CardDescription>Registre o parecer final e orientação sobre este representante legal</CardDescription>
              </CardHeader>
              <CardContent>
                {!parecerFinal ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum parecer final registrado ainda.</p>
                    <p className="text-sm">
                      Clique em "Adicionar Parecer" para registrar o parecer final do representante legal.
                    </p>
                  </div>
                ) : (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      {isEditingParecer ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-parecerRisco">Risco</Label>
                              <Select
                                value={newParecerRisco}
                                onValueChange={(value: ParecerFinal["risco"]) => setNewParecerRisco(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o risco" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Baixo">Baixo</SelectItem>
                                  <SelectItem value="Médio">Médio</SelectItem>
                                  <SelectItem value="Alto">Alto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-parecerOrientacao">Orientação</Label>
                              <Select
                                value={newParecerOrientacao}
                                onValueChange={(value: ParecerFinal["orientacao"]) => setNewParecerOrientacao(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a orientação" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Aprovar">Aprovar</SelectItem>
                                  <SelectItem value="Rejeitar">Rejeitar</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-parecerTexto">Parecer Final</Label>
                            <Textarea
                              id="edit-parecerTexto"
                              value={newParecerTexto}
                              onChange={(e) => setNewParecerTexto(e.target.value)}
                              className="min-h-[120px]"
                              placeholder="Digite o parecer final resumido do representante legal..."
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button onClick={handleSaveEditParecer}>
                              <Save className="h-4 w-4 mr-1" />
                              Salvar Parecer
                            </Button>
                            <Button variant="outline" onClick={handleCancelEditParecer}>
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center mb-2">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={parecerFinal.user?.avatar_url || "/placeholder.svg"}
                                alt={parecerFinal.user?.name}
                              />
                              <AvatarFallback>
                                {parecerFinal.user?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{parecerFinal.user?.name}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <Badge className={getRiskColor(parecerFinal.risco)}>Risco: {parecerFinal.risco}</Badge>
                            <Badge className={getOrientacaoColor(parecerFinal.orientacao)}>
                              {getOrientacaoIcon(parecerFinal.orientacao)}
                              <span className="ml-1">{parecerFinal.orientacao}</span>
                            </Badge>
                          </div>

                          <p className="text-sm mb-3 whitespace-pre-wrap">{parecerFinal.parecer}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">{formatDate(parecerFinal.created_at)}</p>
                            <div className="flex items-center space-x-1">
                              {parecerFinal.user?.id === currentUser.id && (
                                <Button size="sm" variant="ghost" onClick={handleEditParecer}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dialogs */}

        {/* Add Flow Dialog */}
        <Dialog open={isAddingFlow} onOpenChange={setIsAddingFlow}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Fluxo</DialogTitle>
              <DialogDescription>
                Registre um novo fluxo de documentação para este representante legal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeFluxo">Nome do Fluxo</Label>
                  <Select value={nomeFluxo} onValueChange={(value: Flow["nome_fluxo"]) => setNomeFluxo(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fluxo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato social">Contrato Social</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="representante legal">Representante Legal</SelectItem>
                      <SelectItem value="capital social">Capital Social</SelectItem>
                      <SelectItem value="comprovante endereço">Comprovante de Endereço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkFluxo">Check do Fluxo</Label>
                  <Select value={checkFluxo} onValueChange={(value: Flow["check_fluxo"]) => setCheckFluxo(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="válido">Válido</SelectItem>
                      <SelectItem value="inválido">Inválido</SelectItem>
                      <SelectItem value="compatível">Compatível</SelectItem>
                      <SelectItem value="inconsistente">Inconsistente</SelectItem>
                      <SelectItem value="positivo">Positivo</SelectItem>
                      <SelectItem value="negativo">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Nota do Fluxo</Label>
                <Textarea
                  id="observacao"
                  placeholder="Digite uma observação sobre este fluxo..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingFlow(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddFlow} disabled={!observacao.trim()}>
                Adicionar Fluxo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Nota</DialogTitle>
              <DialogDescription>Registre informações importantes sobre este representante legal.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteTipo">Tipo da Nota</Label>
                <Select value={newNoteTipo} onValueChange={(value: Note["tipo"]) => setNewNoteTipo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alerta Crítico">Alerta Crítico</SelectItem>
                    <SelectItem value="Alerta Normal">Alerta Normal</SelectItem>
                    <SelectItem value="Aviso">Aviso</SelectItem>
                    <SelectItem value="Pendência">Pendência</SelectItem>
                    <SelectItem value="Reenvio de Documentos">Reenvio de Documentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteContent">Conteúdo da Nota</Label>
                <Textarea
                  id="noteContent"
                  placeholder="Digite o conteúdo da nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
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

        {/* Add Parecer Dialog */}
        <Dialog open={isAddingParecer} onOpenChange={setIsAddingParecer}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Parecer Final</DialogTitle>
              <DialogDescription>
                Registre o parecer final e orientação sobre este representante legal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parecerRisco">Risco</Label>
                  <Select
                    value={newParecerRisco}
                    onValueChange={(value: ParecerFinal["risco"]) => setNewParecerRisco(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o risco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parecerOrientacao">Orientação</Label>
                  <Select
                    value={newParecerOrientacao}
                    onValueChange={(value: ParecerFinal["orientacao"]) => setNewParecerOrientacao(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a orientação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aprovar">Aprovar</SelectItem>
                      <SelectItem value="Rejeitar">Rejeitar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parecerTexto">Parecer Final</Label>
                <Textarea
                  id="parecerTexto"
                  placeholder="Digite o parecer final resumido do representante legal..."
                  value={newParecerTexto}
                  onChange={(e) => setNewParecerTexto(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingParecer(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddParecer} disabled={!newParecerTexto.trim()}>
                Adicionar Parecer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Flow Confirmation */}
        <AlertDialog open={!!flowToDelete} onOpenChange={() => setFlowToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Fluxo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este fluxo? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteFlow} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
    </div>
  )
}
