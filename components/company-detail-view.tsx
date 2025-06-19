"use client"

import { useState, useRef } from "react"
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
  Calendar,
  Clock,
  AlertCircle,
  Check,
  Save,
  X,
  Building2,
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
  MessageSquare,
  Paperclip,
} from "lucide-react"
import type { Company, Flow, Note, ParecerFinal, RepresentanteLegal } from "@/types/task"

// Adicionar imports
import RepresentanteLegalModal from "@/components/representante-legal-modal"
import RepresentanteLegalDetailView from "@/components/representante-legal-detail-view"

// Importe a função createRepresentanteLegal
import {
  createRepresentanteLegal,
  updateRepresentanteLegal,
  createFlow,
  createNote,
  createParecerFinal,
} from "@/lib/supabase"

interface CompanyDetailViewProps {
  company: Company
  onClose: () => void
  onUpdateCompany: (company: Company) => void
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
}

export default function CompanyDetailView({ company, onClose, onUpdateCompany, currentUser }: CompanyDetailViewProps) {
  // Adicionar estados
  const [isRepresentanteModalOpen, setIsRepresentanteModalOpen] = useState(false)
  const [viewingRepresentante, setViewingRepresentante] = useState<RepresentanteLegal | null>(null)
  const [attachingDocumentFlow, setAttachingDocumentFlow] = useState<Flow | null>(null)

  const [notes, setNotes] = useState<Note[]>(company.notes || [])
  const [newNote, setNewNote] = useState("")
  const [newNoteTipo, setNewNoteTipo] = useState<Note["tipo"]>("Alerta Normal")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingNoteTipo, setEditingNoteTipo] = useState<Note["tipo"]>("Alerta Normal")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  const [flows, setFlows] = useState<Flow[]>(company.flows || [])
  const [isAddingFlow, setIsAddingFlow] = useState(false)
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null)

  const [nomeFluxo, setNomeFluxo] = useState<Flow["nomeFluxo"]>("contrato social")
  const [checkFluxo, setCheckFluxo] = useState<Flow["checkFluxo"]>("válido")
  const [observacao, setObservacao] = useState("")

  // Estados para parecer final
  const [parecerFinal, setParecerFinal] = useState<ParecerFinal | undefined>(company.parecerFinal)
  const [isAddingParecer, setIsAddingParecer] = useState(false)
  const [isEditingParecer, setIsEditingParecer] = useState(false)
  const [newParecerRisco, setNewParecerRisco] = useState<ParecerFinal["risco"]>("Baixo")
  const [newParecerOrientacao, setNewParecerOrientacao] = useState<ParecerFinal["orientacao"]>("Aprovar")
  const [newParecerTexto, setNewParecerTexto] = useState("")

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return "Data não informada"
    }

    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Data inválida"
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusIcon = (status: Company["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: Company["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getRiskColor = (risco: Company["risco"] | ParecerFinal["risco"]) => {
    switch (risco) {
      case "Crítico":
        return "bg-red-100 text-red-800"
      case "Alto":
        return "bg-orange-100 text-orange-800"
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

  const getStatusText = (status: Company["status"]) => {
    switch (status) {
      case "completed":
        return "Concluída"
      case "in-progress":
        return "Em Andamento"
      default:
        return "A Fazer"
    }
  }

  const getPriorityText = (priority: Company["priority"]) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      default:
        return "Baixa"
    }
  }

  const getCheckFluxoIcon = (check: Flow["checkFluxo"]) => {
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

  const getCheckFluxoColor = (check: Flow["checkFluxo"]) => {
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

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const { data: noteData, error } = await createNote({
          company_id: company.id,
          tipo: newNoteTipo,
          content: newNote.trim(),
        })

        if (error) {
          console.error("Erro ao criar nota:", error)
          alert("Erro ao criar nota. Por favor, tente novamente.")
          return
        }

        if (noteData) {
          const note: Note = {
            id: noteData.id,
            tipo: noteData.tipo as Note["tipo"],
            content: noteData.content,
            createdAt: noteData.created_at,
            user: noteData.user || currentUser,
          }

          const updatedNotes = [...notes, note]
          setNotes(updatedNotes)
          setNewNote("")
          setNewNoteTipo("Alerta Normal")
          setIsAddingNote(false)

          // Atualizar a empresa
          const updatedCompany = { ...company, notes: updatedNotes }
          onUpdateCompany(updatedCompany)
        }
      } catch (error) {
        console.error("Erro inesperado ao criar nota:", error)
        alert("Ocorreu um erro inesperado. Por favor, tente novamente.")
      }
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setEditingContent(note.content)
    setEditingNoteTipo(note.tipo)
  }

  const handleSaveEditNote = () => {
    if (editingNote && editingContent.trim()) {
      const updatedNotes = notes.map((note) =>
        note.id === editingNote.id ? { ...note, content: editingContent.trim(), tipo: editingNoteTipo } : note,
      )
      setNotes(updatedNotes)
      setEditingNote(null)
      setEditingContent("")
      setEditingNoteTipo("Alerta Normal")

      // Atualizar a empresa
      const updatedCompany = { ...company, notes: updatedNotes }
      onUpdateCompany(updatedCompany)
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

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      const updatedNotes = notes.filter((note) => note.id !== noteToDelete.id)
      setNotes(updatedNotes)
      setNoteToDelete(null)

      // Atualizar a empresa
      const updatedCompany = { ...company, notes: updatedNotes }
      onUpdateCompany(updatedCompany)
    }
  }

  const handleAddFlow = async () => {
    if (observacao.trim()) {
      try {
        const { data: flowData, error } = await createFlow({
          company_id: company.id,
          nome_fluxo: nomeFluxo,
          check_fluxo: checkFluxo,
          observacao: observacao.trim(),
        })

        if (error) {
          console.error("Erro ao criar fluxo:", error)
          alert("Erro ao criar fluxo. Por favor, tente novamente.")
          return
        }

        if (flowData) {
          const flow: Flow = {
            id: flowData.id,
            nomeFluxo: flowData.nome_fluxo as Flow["nomeFluxo"],
            checkFluxo: flowData.check_fluxo as Flow["checkFluxo"],
            observacao: flowData.observacao,
            createdAt: flowData.created_at,
            user: flowData.user || currentUser,
          }

          const updatedFlows = [...flows, flow]
          setFlows(updatedFlows)
          setObservacao("")
          setIsAddingFlow(false)

          // Atualizar a empresa
          const updatedCompany = { ...company, flows: updatedFlows }
          onUpdateCompany(updatedCompany)
        }
      } catch (error) {
        console.error("Erro inesperado ao criar fluxo:", error)
        alert("Ocorreu um erro inesperado. Por favor, tente novamente.")
      }
    }
  }

  const handleEditFlow = (flow: Flow) => {
    setEditingFlow(flow)
    setNomeFluxo(flow.nomeFluxo)
    setCheckFluxo(flow.checkFluxo)
    setObservacao(flow.observacao)
  }

  const handleSaveEditFlow = () => {
    if (editingFlow && observacao.trim()) {
      const updatedFlows = flows.map((flow) =>
        flow.id === editingFlow.id
          ? {
              ...flow,
              nomeFluxo,
              checkFluxo,
              observacao: observacao.trim(),
            }
          : flow,
      )
      setFlows(updatedFlows)
      setEditingFlow(null)
      setObservacao("")
      setNomeFluxo("contrato social")
      setCheckFluxo("válido")

      // Atualizar a empresa
      const updatedCompany = { ...company, flows: updatedFlows }
      onUpdateCompany(updatedCompany)
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

  const confirmDeleteFlow = () => {
    if (flowToDelete) {
      const updatedFlows = flows.filter((flow) => flow.id !== flowToDelete.id)
      setFlows(updatedFlows)
      setFlowToDelete(null)

      // Atualizar a empresa
      const updatedCompany = { ...company, flows: updatedFlows }
      onUpdateCompany(updatedCompany)
    }
  }

  // Funções para parecer final
  const handleAddParecer = async () => {
    if (newParecerTexto.trim()) {
      try {
        const { data: parecerData, error } = await createParecerFinal({
          company_id: company.id,
          risco: newParecerRisco,
          orientacao: newParecerOrientacao,
          parecer: newParecerTexto.trim(),
        })

        if (error) {
          console.error("Erro ao criar parecer:", error)
          alert("Erro ao criar parecer. Por favor, tente novamente.")
          return
        }

        if (parecerData) {
          const parecer: ParecerFinal = {
            id: parecerData.id,
            risco: parecerData.risco as ParecerFinal["risco"],
            orientacao: parecerData.orientacao as ParecerFinal["orientacao"],
            parecer: parecerData.parecer,
            createdAt: parecerData.created_at,
            user: parecerData.user || currentUser,
          }

          setParecerFinal(parecer)
          setNewParecerTexto("")
          setNewParecerRisco("Baixo")
          setNewParecerOrientacao("Aprovar")
          setIsAddingParecer(false)

          // Atualizar a empresa
          const updatedCompany = { ...company, parecerFinal: parecer }
          onUpdateCompany(updatedCompany)
        }
      } catch (error) {
        console.error("Erro inesperado ao criar parecer:", error)
        alert("Ocorreu um erro inesperado. Por favor, tente novamente.")
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

  const handleSaveEditParecer = () => {
    if (parecerFinal && newParecerTexto.trim()) {
      const updatedParecer: ParecerFinal = {
        ...parecerFinal,
        risco: newParecerRisco,
        orientacao: newParecerOrientacao,
        parecer: newParecerTexto.trim(),
      }
      setParecerFinal(updatedParecer)
      setIsEditingParecer(false)
      setNewParecerTexto("")
      setNewParecerRisco("Baixo")
      setNewParecerOrientacao("Aprovar")

      // Atualizar a empresa
      const updatedCompany = { ...company, parecerFinal: updatedParecer }
      onUpdateCompany(updatedCompany)
    }
  }

  const handleCancelEditParecer = () => {
    setIsEditingParecer(false)
    setNewParecerTexto("")
    setNewParecerRisco("Baixo")
    setNewParecerOrientacao("Aprovar")
  }

  // Adicionar funções
  const handleRepresentanteSubmit = async (
    data: Omit<RepresentanteLegal, "id" | "created_at" | "updated_at" | "flows" | "notes" | "parecer_final">,
  ) => {
    try {
      const { data: repData, error } = await createRepresentanteLegal({
        company_id: company.id,
        nome: data.nome,
        cpf: data.cpf,
        telefone: data.telefone || "",
        endereco: data.endereco || "",
      })

      if (error) {
        console.error("Erro ao cadastrar representante legal:", error)
        alert("Erro ao cadastrar representante legal. Por favor, tente novamente.")
        return
      }

      // Atualizar a empresa com o novo representante legal
      const updatedCompany = {
        ...company,
        representanteLegal: {
          ...repData,
          createdAt: repData.created_at,
          updatedAt: repData.updated_at,
          flows: [],
          notes: [],
        },
      }

      onUpdateCompany(updatedCompany)
      setIsRepresentanteModalOpen(false)
    } catch (error) {
      console.error("Erro inesperado ao cadastrar representante legal:", error)
      alert("Ocorreu um erro inesperado. Por favor, tente novamente.")
    }
  }

  const handleUpdateRepresentante = async (
    id: string,
    data: {
      nome: string
      cpf: string
      telefone: string
      endereco: string
    },
  ) => {
    try {
      const { data: repData, error } = await updateRepresentanteLegal(id, data)

      if (error) {
        console.error("Erro ao atualizar representante legal:", error)
        alert("Erro ao atualizar representante legal. Por favor, tente novamente.")
        return
      }

      // Atualizar a empresa com o representante legal atualizado
      if (company.representanteLegal) {
        const updatedRepresentante = {
          ...company.representanteLegal,
          nome: data.nome,
          cpf: data.cpf,
          telefone: data.telefone,
          endereco: data.endereco,
          updatedAt: new Date().toISOString(),
        }

        const updatedCompany = { ...company, representanteLegal: updatedRepresentante }
        onUpdateCompany(updatedCompany)
      }
    } catch (error) {
      console.error("Erro inesperado ao atualizar representante legal:", error)
      alert("Ocorreu um erro inesperado. Por favor, tente novamente.")
    }
  }

  const closeRepresentanteDetail = () => {
    setViewingRepresentante(null)
  }

  const flowsSectionRef = useRef<HTMLDivElement>(null)

  const handleViewRepresentanteDetails = () => {
    setViewingRepresentante(company.representanteLegal!)
    // Scroll suave para a seção de fluxos após um pequeno delay para garantir que o modal seja renderizado
    setTimeout(() => {
      flowsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  const handleAttachDocument = (flow: Flow) => {
    setAttachingDocumentFlow(flow)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onClose} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Building2 className="h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Detalhes da Empresa</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{company.nomeEmpresa}</CardTitle>
                    <CardDescription className="text-base">{company.cnpj}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <Badge className={getPriorityColor(company.priority)}>
                    Prioridade: {getPriorityText(company.priority)}
                  </Badge>
                  <Badge className={getStatusColor(company.status)}>
                    {getStatusIcon(company.status)}
                    <span className="ml-1">{getStatusText(company.status)}</span>
                  </Badge>
                  <Badge className={getRiskColor(company.risco)}>Risco: {company.risco}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Prazo: {formatDate(company.dueDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Cadastrada em: {formatDate(company.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Data */}
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Porte</p>
                    <p className="text-sm">{company.porte}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Abertura</p>
                    <p className="text-sm">{company.abertura ? formatDate(company.abertura) : "Não informado"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Endereço</p>
                    <p className="text-sm">{company.endereco || "Não informado"}</p>
                    <p className="text-sm">
                      {company.cidade} - {company.estado}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">CNAE</p>
                  <p className="text-sm">{company.cnae || "Não informado"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefone</p>
                      <p className="text-sm">{company.telefone || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm">{company.email || "Não informado"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Stats */}
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(company.status)} variant="secondary">
                    {getStatusText(company.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prioridade:</span>
                  <Badge className={getPriorityColor(company.priority)} variant="secondary">
                    {getPriorityText(company.priority)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risco:</span>
                  <Badge className={getRiskColor(company.risco)} variant="secondary">
                    {company.risco}
                  </Badge>
                </div>
                {parecerFinal && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Parecer:</span>
                    <Badge className={getOrientacaoColor(parecerFinal.orientacao)} variant="secondary">
                      {parecerFinal.orientacao}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Representante Legal */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Representante Legal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!company.representanteLegal ? (
                    <div className="text-center py-6 text-gray-500">
                      <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhum representante legal cadastrado.</p>
                      <p className="text-xs mb-4">Clique em "Cadastrar" para adicionar os dados.</p>
                      <Button onClick={() => setIsRepresentanteModalOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Cadastrar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome</p>
                          <p className="text-sm">{company.representanteLegal.nome}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">CPF</p>
                            <p className="text-sm">{company.representanteLegal.cpf}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Telefone</p>
                            <p className="text-sm">{company.representanteLegal.telefone || "Não informado"}</p>
                          </div>
                        </div>
                        {company.representanteLegal.endereco && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Endereço</p>
                            <p className="text-sm">{company.representanteLegal.endereco}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t">
                          {company.representanteLegal.flows?.length > 0 && (
                            <div className="flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {company.representanteLegal.flows.length}{" "}
                              {company.representanteLegal.flows.length === 1 ? "fluxo" : "fluxos"}
                            </div>
                          )}
                          {company.representanteLegal.notes?.length > 0 && (
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {company.representanteLegal.notes.length}{" "}
                              {company.representanteLegal.notes.length === 1 ? "nota" : "notas"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2 border-t">
                        <Button size="sm" variant="outline" onClick={() => setIsRepresentanteModalOpen(true)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Atualizar
                        </Button>
                        <Button size="sm" onClick={handleViewRepresentanteDetails}>
                          <FileText className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Flows Section */}
        <div className="mt-8" ref={flowsSectionRef}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Fluxos da Empresa</CardTitle>
                <Button onClick={() => setIsAddingFlow(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fluxo
                </Button>
              </div>
              <CardDescription>Registre e acompanhe os fluxos de documentação desta empresa</CardDescription>
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
                                    onValueChange={(value: Flow["nomeFluxo"]) => setNomeFluxo(value)}
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
                                    onValueChange={(value: Flow["checkFluxo"]) => setCheckFluxo(value)}
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
                                  <AvatarImage src={flow.user?.avatar || "/placeholder.svg"} alt={flow.user?.name} />
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
                                  {flow.nomeFluxo}
                                </Badge>
                                <Badge className={getCheckFluxoColor(flow.checkFluxo)}>
                                  {getCheckFluxoIcon(flow.checkFluxo)}
                                  <span className="ml-1 capitalize">{flow.checkFluxo}</span>
                                </Badge>
                              </div>

                              <p className="text-sm mb-3 whitespace-pre-wrap">{flow.observacao}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">{formatDate(flow.createdAt)}</p>
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
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAttachDocument(flow)}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Anexar Documento"
                                  >
                                    <Paperclip className="h-3 w-3" />
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

        {/* Notes Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Notas da Empresa</CardTitle>
                <Button onClick={() => setIsAddingNote(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Nota
                </Button>
              </div>
              <CardDescription>Registre informações importantes sobre esta empresa</CardDescription>
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

                              <div className="mb-3">
                                <Badge className={getNoteTipoColor(note.tipo)}>
                                  {getNoteTipoIcon(note.tipo)}
                                  <span className="ml-1">{note.tipo}</span>
                                </Badge>
                              </div>

                              <p className="text-sm mb-3 whitespace-pre-wrap">{note.content}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
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
                <CardTitle className="text-xl">Parecer Final da Empresa</CardTitle>
                {!parecerFinal && (
                  <Button onClick={() => setIsAddingParecer(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Parecer
                  </Button>
                )}
              </div>
              <CardDescription>Registre o parecer final e orientação sobre esta empresa</CardDescription>
            </CardHeader>
            <CardContent>
              {!parecerFinal ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum parecer final registrado ainda.</p>
                  <p className="text-sm">Clique em "Adicionar Parecer" para registrar o parecer final da empresa.</p>
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
                            placeholder="Digite o parecer final resumido da empresa..."
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
                              src={parecerFinal.user?.avatar || "/placeholder.svg"}
                              alt={parecerFinal.user?.name}
                            />
                            <AvatarFallback>
                              {parecerFinal.user?.name
                                .split(" ")
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
                          <p className="text-xs text-gray-500">{formatDate(parecerFinal.createdAt)}</p>
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

      {/* Attach Document Dialog */}
      <Dialog open={!!attachingDocumentFlow} onOpenChange={() => setAttachingDocumentFlow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar Documento</DialogTitle>
            <DialogDescription>Anexe um documento ao fluxo "{attachingDocumentFlow?.nomeFluxo}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">Clique para selecionar ou arraste arquivos aqui</p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  // Aqui você implementaria a lógica de upload
                  console.log("Arquivo selecionado:", e.target.files?.[0])
                }}
              />
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement
                  input?.click()
                }}
              >
                Selecionar Arquivo
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttachingDocumentFlow(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Implementar lógica de upload
                setAttachingDocumentFlow(null)
              }}
            >
              Anexar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Flow Dialog */}
      <Dialog open={isAddingFlow} onOpenChange={setIsAddingFlow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Fluxo</DialogTitle>
            <DialogDescription>Registre um novo fluxo de documentação para esta empresa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeFluxo">Nome do Fluxo</Label>
                <Select value={nomeFluxo} onValueChange={(value: Flow["nomeFluxo"]) => setNomeFluxo(value)}>
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
                <Select value={checkFluxo} onValueChange={(value: Flow["checkFluxo"]) => setCheckFluxo(value)}>
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
            <DialogDescription>Registre informações importantes sobre esta empresa.</DialogDescription>
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
            <DialogDescription>Registre o parecer final e orientação sobre esta empresa.</DialogDescription>
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
                placeholder="Digite o parecer final resumido da empresa..."
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

      {/* Representante Legal Modal */}
      <RepresentanteLegalModal
        isOpen={isRepresentanteModalOpen}
        onClose={() => setIsRepresentanteModalOpen(false)}
        onSubmit={handleRepresentanteSubmit}
        onUpdate={handleUpdateRepresentante}
        representante={company.representanteLegal}
        companyId={company.id}
      />

      {/* Representante Legal Detail View */}
      {viewingRepresentante && (
        <RepresentanteLegalDetailView
          representante={viewingRepresentante}
          onClose={closeRepresentanteDetail}
          onUpdateRepresentante={handleUpdateRepresentante}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
