"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  LogOut,
  Edit,
  Check,
  Clock,
  AlertCircle,
  MessageSquare,
  Building2,
  Archive,
  CheckSquare,
  Bell,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CompanyModal from "@/components/company-modal"
import ArchivedCompanies from "@/components/archived-companies"
import type { Company } from "@/types/task"
import CompanyDetailView from "@/components/company-detail-view"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  getCompanies,
  createCompany,
  updateCompany,
  archiveCompany,
  restoreCompany,
  createFlow,
  createNote,
  getUnreadNotifications,
} from "@/lib/supabase"
import CompanyEditModal from "@/components/company-edit-modal"

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCompanyData, setEditingCompanyData] = useState<Company | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const router = useRouter()

  // Carregar empresas do Supabase
  useEffect(() => {
    loadCompanies()
    loadUnreadNotifications()
  }, [user])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const { data, error } = await getCompanies()

      if (error) {
        console.error("Erro ao carregar empresas:", error)
        return
      }

      setCompanies(data || [])
    } catch (error) {
      console.error("Erro inesperado ao carregar empresas:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadNotifications = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await getUnreadNotifications(user.id)

      if (error) {
        console.error("Erro ao carregar notificações não lidas:", error)
        return
      }

      setUnreadCount(data?.length || 0)
    } catch (error) {
      console.error("Erro inesperado ao carregar notificações não lidas:", error)
    }
  }

  const activeCompanies = companies.filter((company) => !company.archived)

  const handleCreateCompany = async (companyData: Omit<Company, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      const { data, error } = await createCompany(companyData)

      if (error) {
        console.error("Erro ao criar empresa:", error)
        alert("Erro ao criar empresa. Tente novamente.")
        return
      }

      // Recarregar a lista de empresas
      await loadCompanies()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Erro inesperado ao criar empresa:", error)
      alert("Erro inesperado ao criar empresa.")
    }
  }

  const handleEditCompany = async (companyData: Omit<Company, "id" | "created_at" | "updated_at" | "created_by">) => {
    if (!editingCompany) return

    try {
      const { error } = await updateCompany(editingCompany.id, companyData)

      if (error) {
        console.error("Erro ao atualizar empresa:", error)
        alert("Erro ao atualizar empresa. Tente novamente.")
        return
      }

      // Recarregar a lista de empresas
      await loadCompanies()
      setEditingCompany(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Erro inesperado ao atualizar empresa:", error)
      alert("Erro inesperado ao atualizar empresa.")
    }
  }

  const handleStatusChange = async (companyId: string, newStatus: Company["status"]) => {
    try {
      const { error } = await updateCompany(companyId, { status: newStatus })

      if (error) {
        console.error("Erro ao atualizar status:", error)
        return
      }

      // Atualizar localmente
      setCompanies(companies.map((company) => (company.id === companyId ? { ...company, status: newStatus } : company)))
    } catch (error) {
      console.error("Erro inesperado ao atualizar status:", error)
    }
  }

  const handleArchiveCompany = async (companyId: string) => {
    try {
      const { error } = await archiveCompany(companyId)

      if (error) {
        console.error("Erro ao arquivar empresa:", error)
        return
      }

      // Atualizar localmente
      setCompanies(companies.map((company) => (company.id === companyId ? { ...company, archived: true } : company)))
    } catch (error) {
      console.error("Erro inesperado ao arquivar empresa:", error)
    }
  }

  const handleRestoreCompany = async (companyId: string) => {
    try {
      const { error } = await restoreCompany(companyId)

      if (error) {
        console.error("Erro ao restaurar empresa:", error)
        return
      }

      // Atualizar localmente
      setCompanies(companies.map((company) => (company.id === companyId ? { ...company, archived: false } : company)))
    } catch (error) {
      console.error("Erro inesperado ao restaurar empresa:", error)
    }
  }

  const handleAddFlow = async (
    companyId: string,
    flowData: { nome_fluxo: string; check_fluxo: string; observacao: string },
  ) => {
    try {
      const { data, error } = await createFlow({
        company_id: companyId,
        nome_fluxo: flowData.nome_fluxo,
        check_fluxo: flowData.check_fluxo,
        observacao: flowData.observacao,
      })

      if (error) {
        console.error("Erro ao adicionar fluxo:", error)
        return
      }

      // Recarregar empresas para obter os dados atualizados
      await loadCompanies()
    } catch (error) {
      console.error("Erro inesperado ao adicionar fluxo:", error)
    }
  }

  const handleAddNote = async (companyId: string, noteData: { tipo: string; content: string }) => {
    try {
      const { data, error } = await createNote({
        company_id: companyId,
        tipo: noteData.tipo,
        content: noteData.content,
      })

      if (error) {
        console.error("Erro ao adicionar nota:", error)
        return
      }

      // Recarregar empresas para obter os dados atualizados
      await loadCompanies()
    } catch (error) {
      console.error("Erro inesperado ao adicionar nota:", error)
    }
  }

  const openEditModal = (company: Company) => {
    setEditingCompany(company)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCompany(null)
  }

  const openCompanyDetail = (company: Company) => {
    setViewingCompany(company)
  }

  const closeCompanyDetail = () => {
    setViewingCompany(null)
  }

  const handleUpdateCompanyFromDetail = async (updatedCompany: Company) => {
    // Recarregar a lista de empresas
    await loadCompanies()
  }

  // Funções auxiliares para UI
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

  const getRiskColor = (risco: Company["risco"]) => {
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

  const getStatusText = (status: Company["status"]) => {
    switch (status) {
      case "completed":
        return "concluída"
      case "in-progress":
        return "em andamento"
      default:
        return "a fazer"
    }
  }

  const getPriorityText = (priority: Company["priority"]) => {
    switch (priority) {
      case "high":
        return "alta"
      case "medium":
        return "média"
      default:
        return "baixa"
    }
  }

  const todoCompanies = activeCompanies.filter((company) => company.status === "todo")
  const inProgressCompanies = activeCompanies.filter((company) => company.status === "in-progress")
  const completedCompanies = activeCompanies.filter((company) => company.status === "completed")

  const openEditModalSimple = (company: Company) => {
    setEditingCompanyData(company)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingCompanyData(null)
  }

  const handleEditCompanySimple = async (companyData: Partial<Company>) => {
    if (!editingCompanyData) return

    try {
      const { error } = await updateCompany(editingCompanyData.id, companyData)

      if (error) {
        console.error("Erro ao atualizar empresa:", error)
        alert("Erro ao atualizar empresa. Tente novamente.")
        return
      }

      // Recarregar a lista de empresas
      await loadCompanies()
      setIsEditModalOpen(false)
      setEditingCompanyData(null)
    } catch (error) {
      console.error("Erro inesperado ao atualizar empresa:", error)
      alert("Erro inesperado ao atualizar empresa.")
    }
  }

  // Usuário atual baseado no perfil do Supabase
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
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    )
  }

  if (viewingCompany) {
    return (
      <CompanyDetailView
        company={viewingCompany}
        onClose={closeCompanyDetail}
        onUpdateCompany={handleUpdateCompanyFromDetail}
        currentUser={currentUser}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CCJB Compliance</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
              <Button onClick={() => setIsArchivedModalOpen(true)}>
                <Archive className="h-4 w-4 mr-2" />
                Arquivadas
              </Button>
              <Button onClick={() => router.push("/tasks")} className="bg-green-600 hover:bg-green-700">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tarefas
              </Button>
              <Button onClick={() => router.push("/notifications")} variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                <Avatar className="h-8 w-8 mr-3 cursor-pointer" onClick={() => router.push("/profile")}>
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>
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
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCompanies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCompanies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCompanies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arquivadas</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.filter((c) => c.archived).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Company Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* To Do */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">A Fazer ({todoCompanies.length})</h2>
            <div className="space-y-4">
              {todoCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{company.nomeEmpresa}</CardTitle>
                        <p className="text-sm text-gray-600">{company.cnpj}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditModalSimple(company)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveCompany(company.id)}>Arquivar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {company.cidade} - {company.estado}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(company.priority)}>{getPriorityText(company.priority)}</Badge>
                      <Badge className={getRiskColor(company.risco)}>Risco: {company.risco}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{company.porte}</Badge>
                      <Badge className={getStatusColor(company.status)}>
                        {getStatusIcon(company.status)}
                        <span className="ml-1">{getStatusText(company.status)}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Prazo: {company.dueDate}</div>
                    {((company.flows && company.flows.length > 0) || (company.notes && company.notes.length > 0)) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {company.flows && company.flows.length > 0 && (
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {company.flows.length} {company.flows.length === 1 ? "fluxo" : "fluxos"}
                          </div>
                        )}
                        {company.notes && company.notes.length > 0 && (
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {company.notes.length} {company.notes.length === 1 ? "nota" : "notas"}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button size="sm" onClick={() => handleStatusChange(company.id, "in-progress")} className="w-full">
                      Iniciar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openCompanyDetail(company)} className="ml-2">
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Em Andamento ({inProgressCompanies.length})</h2>
            <div className="space-y-4">
              {inProgressCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{company.nomeEmpresa}</CardTitle>
                        <p className="text-sm text-gray-600">{company.cnpj}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditModalSimple(company)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveCompany(company.id)}>Arquivar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {company.cidade} - {company.estado}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(company.priority)}>{getPriorityText(company.priority)}</Badge>
                      <Badge className={getRiskColor(company.risco)}>Risco: {company.risco}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{company.porte}</Badge>
                      <Badge className={getStatusColor(company.status)}>
                        {getStatusIcon(company.status)}
                        <span className="ml-1">{getStatusText(company.status)}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Prazo: {company.dueDate}</div>
                    {((company.flows && company.flows.length > 0) || (company.notes && company.notes.length > 0)) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {company.flows && company.flows.length > 0 && (
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {company.flows.length} {company.flows.length === 1 ? "fluxo" : "fluxos"}
                          </div>
                        )}
                        {company.notes && company.notes.length > 0 && (
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {company.notes.length} {company.notes.length === 1 ? "nota" : "notas"}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button size="sm" onClick={() => handleStatusChange(company.id, "completed")} className="w-full">
                      Concluir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openCompanyDetail(company)} className="ml-2">
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Concluídas ({completedCompanies.length})</h2>
            <div className="space-y-4">
              {completedCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{company.nomeEmpresa}</CardTitle>
                        <p className="text-sm text-gray-600">{company.cnpj}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditModalSimple(company)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchiveCompany(company.id)}>Arquivar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {company.cidade} - {company.estado}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPriorityColor(company.priority)}>{getPriorityText(company.priority)}</Badge>
                      <Badge className={getRiskColor(company.risco)}>Risco: {company.risco}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{company.porte}</Badge>
                      <Badge className={getStatusColor(company.status)}>
                        {getStatusIcon(company.status)}
                        <span className="ml-1">{getStatusText(company.status)}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Prazo: {company.dueDate}</div>
                    {((company.flows && company.flows.length > 0) || (company.notes && company.notes.length > 0)) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {company.flows && company.flows.length > 0 && (
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {company.flows.length} {company.flows.length === 1 ? "fluxo" : "fluxos"}
                          </div>
                        )}
                        {company.notes && company.notes.length > 0 && (
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {company.notes.length} {company.notes.length === 1 ? "nota" : "notas"}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(company.id, "todo")}
                      className="w-full"
                    >
                      Reabrir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openCompanyDetail(company)} className="ml-2">
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 itens-center">
          <p>&copy; 2025 - Looppa Lab Tech. Todos os direitos reservados.</p>
        </div>
      </main>

      {/* Company Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingCompany ? handleEditCompany : handleCreateCompany}
        onAddFlow={handleAddFlow}
        company={editingCompany}
        currentUser={currentUser}
      />

      {/* Archived Companies Modal - CORREÇÃO AQUI */}
      <ArchivedCompanies
        isOpen={isArchivedModalOpen}
        onClose={() => setIsArchivedModalOpen(false)}
        companies={companies} // Passando o array companies corretamente
        onRestoreCompany={handleRestoreCompany}
        onViewCompany={openCompanyDetail}
      />

      {/* Company Edit Modal */}
      {editingCompanyData && (
        <CompanyEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditCompanySimple}
          company={editingCompanyData}
        />
      )}
    </div>
  )
}
