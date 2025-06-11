"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompanyFlows from "@/components/company-flows"
import CompanyNotes from "@/components/company-notes"
import RepresentanteLegalModal from "@/components/representante-legal-modal"
import ParecerFinalModal from "@/components/parecer-final-modal"
import type { Company } from "@/types/task"
import {
  createRepresentanteLegal,
  createParecerFinal,
  updateRepresentanteLegal,
  updateParecerFinal,
} from "@/lib/supabase"
import type { RepresentanteLegal } from "@/types/representante-legal"
import { Search } from "lucide-react"

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (company: Omit<Company, "id" | "created_at" | "updated_at" | "created_by">) => void
  onAddFlow?: (companyId: string, flowData: { nome_fluxo: string; check_fluxo: string; observacao: string }) => void
  company?: Company | null
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

export default function CompanyModal({
  isOpen,
  onClose,
  onSubmit,
  onAddFlow,
  company,
  currentUser,
}: CompanyModalProps) {
  const [cnpj, setCnpj] = useState("")
  const [nomeEmpresa, setNomeEmpresa] = useState("")
  const [porte, setPorte] = useState<Company["porte"]>("ME")
  const [estado, setEstado] = useState("")
  const [cidade, setCidade] = useState("")
  const [endereco, setEndereco] = useState("")
  const [cnae, setCnae] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [abertura, setAbertura] = useState("")
  const [risco, setRisco] = useState<Company["risco"]>("Baixo")
  const [status, setStatus] = useState<Company["status"]>("todo")
  const [priority, setPriority] = useState<Company["priority"]>("medium")
  const [dueDate, setDueDate] = useState("")
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false)

  // Estados para modais dos módulos
  const [isRepresentanteModalOpen, setIsRepresentanteModalOpen] = useState(false)
  const [isParecerModalOpen, setIsParecerModalOpen] = useState(false)

  useEffect(() => {
    if (company) {
      setCnpj(company.cnpj)
      setNomeEmpresa(company.nomeEmpresa)
      setPorte(company.porte)
      setEstado(company.estado)
      setCidade(company.cidade)
      setEndereco(company.endereco)
      setCnae(company.cnae)
      setTelefone(company.telefone)
      setEmail(company.email)
      setAbertura(company.abertura)
      setRisco(company.risco)
      setStatus(company.status)
      setPriority(company.priority)
      setDueDate(company.dueDate)
    } else {
      setCnpj("")
      setNomeEmpresa("")
      setPorte("ME")
      setEstado("")
      setCidade("")
      setEndereco("")
      setCnae("")
      setTelefone("")
      setEmail("")
      setAbertura("")
      setRisco("Baixo")
      setStatus("todo")
      setPriority("medium")
      setDueDate("")
    }
  }, [company, isOpen])

  const consultarCNPJ = async () => {
    if (!cnpj.trim()) {
      alert("Digite um CNPJ válido")
      return
    }

    // Remove formatação do CNPJ (pontos, barras, hífens)
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "")

    if (cnpjLimpo.length !== 14) {
      alert("CNPJ deve ter 14 dígitos")
      return
    }

    setIsLoadingCnpj(true)

    try {
      const response = await fetch(`https://open.cnpja.com/office/${cnpjLimpo}`)

      if (!response.ok) {
        throw new Error("Erro na consulta do CNPJ")
      }

      const data = await response.json()

      // Mapear os dados da API para os campos do formulário
      if (data.founded) {
        // Converter data de yyyy-mm-dd para dd/mm/yyyy se necessário
        const dataFounded = new Date(data.founded)
        const dataFormatada = dataFounded.toISOString().split("T")[0]
        setAbertura(dataFormatada)
      }

      if (data.company?.name) {
        setNomeEmpresa(data.company.name)
      }

      if (data.address?.state) {
        setEstado(data.address.state)
      }

      if (data.address?.city) {
        setCidade(data.address.city)
      }

      if (data.address?.street) {
        setEndereco(`${data.address.street}, ${data.address.number}, ${data.address.district}. CEP: ${data.address.zip}`)
      }

      if (data.mainActivity?.id && data.mainActivity?.text) {
        setCnae(`${data.mainActivity.id} - ${data.mainActivity.text}`)
      }

      if (data.emails && data.emails.length > 0 && data.emails[0].address) {
        setEmail(data.emails[0].address)
      }

      alert("Dados coletados. Confirme no formulário!")
    } catch (error) {
      console.error("Erro ao consultar CNPJ:", error)
      alert("Erro ao consultar CNPJ. Verifique o número e tente novamente.")
    } finally {
      setIsLoadingCnpj(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cnpj.trim() && nomeEmpresa.trim() && dueDate) {
      onSubmit({
        cnpj: cnpj.trim(),
        nomeEmpresa: nomeEmpresa.trim(),
        porte,
        estado: estado.trim(),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        cnae: cnae.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        abertura,
        risco,
        status,
        priority,
        dueDate,
        archived: false,
        flows: [],
        notes: [],
        representanteLegal: null,
        parecerFinal: null,
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setCnpj("")
    setNomeEmpresa("")
    setPorte("ME")
    setEstado("")
    setCidade("")
    setEndereco("")
    setCnae("")
    setTelefone("")
    setEmail("")
    setAbertura("")
    setRisco("Baixo")
    setStatus("todo")
    setPriority("medium")
    setDueDate("")
    onClose()
  }

  const handleAddFlow = (flowData: { nome_fluxo: string; check_fluxo: string; observacao: string }) => {
    if (company && onAddFlow) {
      onAddFlow(company.id, flowData)
    }
  }

  const handleCreateRepresentante = async (
    repData: Omit<RepresentanteLegal, "id" | "created_at" | "updated_at" | "flows" | "notes" | "parecer_final">,
  ) => {
    if (!company) return

    try {
      const { data, error } = await createRepresentanteLegal({
        company_id: company.id,
        nome: repData.nome,
        cpf: repData.cpf,
        telefone: repData.telefone || "",
        endereco: repData.endereco || "",
      })

      if (error) {
        console.error("Erro ao criar representante legal:", error)
        alert("Erro ao criar representante legal. Tente novamente.")
        return
      }

      setIsRepresentanteModalOpen(false)
      // Recarregar dados da empresa
      window.location.reload()
    } catch (error) {
      console.error("Erro inesperado ao criar representante legal:", error)
      alert("Erro inesperado ao criar representante legal.")
    }
  }

  const handleUpdateRepresentante = async (
    id: string,
    repData: {
      nome: string
      cpf: string
      telefone: string
      endereco: string
    },
  ) => {
    try {
      const { data, error } = await updateRepresentanteLegal(id, repData)

      if (error) {
        console.error("Erro ao atualizar representante legal:", error)
        alert("Erro ao atualizar representante legal. Tente novamente.")
        return
      }

      setIsRepresentanteModalOpen(false)
      // Recarregar dados da empresa
      window.location.reload()
    } catch (error) {
      console.error("Erro inesperado ao atualizar representante legal:", error)
      alert("Erro inesperado ao atualizar representante legal.")
    }
  }

  const handleCreateParecer = async (parecerData: {
    risco: string
    orientacao: string
    parecer: string
    representante_legal_id?: string
  }) => {
    if (!company) return

    try {
      const { data, error } = await createParecerFinal({
        company_id: company.id,
        representante_legal_id: parecerData.representante_legal_id || null,
        risco: parecerData.risco,
        orientacao: parecerData.orientacao,
        parecer: parecerData.parecer,
      })

      if (error) {
        console.error("Erro ao criar parecer final:", error)
        alert("Erro ao criar parecer final. Tente novamente.")
        return
      }

      setIsParecerModalOpen(false)
      // Recarregar dados da empresa
      window.location.reload()
    } catch (error) {
      console.error("Erro inesperado ao criar parecer final:", error)
      alert("Erro inesperado ao criar parecer final.")
    }
  }

  const handleUpdateParecer = async (
    id: string,
    parecerData: {
      risco: string
      orientacao: string
      parecer: string
    },
  ) => {
    try {
      const { data, error } = await updateParecerFinal(id, parecerData)

      if (error) {
        console.error("Erro ao atualizar parecer final:", error)
        alert("Erro ao atualizar parecer final. Tente novamente.")
        return
      }

      setIsParecerModalOpen(false)
      // Recarregar dados da empresa
      window.location.reload()
    } catch (error) {
      console.error("Erro inesperado ao criar parecer final:", error)
      alert("Erro inesperado ao criar parecer final.")
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{company ? "Editar Empresa" : "Cadastrar Nova Empresa"}</DialogTitle>
            <DialogDescription>
              {company ? "Atualize os dados da empresa abaixo." : "Preencha os dados para cadastrar uma nova empresa."}
            </DialogDescription>
          </DialogHeader>

          {company ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">Dados</TabsTrigger>
                <TabsTrigger value="flows">Fluxos</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
                <TabsTrigger value="representante">Rep. Legal</TabsTrigger>
                <TabsTrigger value="parecer">Parecer</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <form id="company-form" onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cnpj">CNPJ *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="cnpj"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="00.000.000/0000-00"
                            required
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={consultarCNPJ}
                            disabled={isLoadingCnpj}
                            title="Consultar CNPJ"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="porte">Porte *</Label>
                        <Select value={porte} onValueChange={(value: Company["porte"]) => setPorte(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o porte" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEI">MEI</SelectItem>
                            <SelectItem value="ME">ME - Microempresa</SelectItem>
                            <SelectItem value="EPP">EPP - Empresa de Pequeno Porte</SelectItem>
                            <SelectItem value="Grande">Grande Empresa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                      <Input
                        id="nomeEmpresa"
                        value={nomeEmpresa}
                        onChange={(e) => setNomeEmpresa(e.target.value)}
                        placeholder="Digite o nome da empresa"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                          placeholder="Ex: SP"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          placeholder="Digite a cidade"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Rua, número, bairro"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cnae">CNAE</Label>
                      <Input
                        id="cnae"
                        value={cnae}
                        onChange={(e) => setCnae(e.target.value)}
                        placeholder="Ex: 6201-5/00 - Desenvolvimento de programas"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contato@empresa.com.br"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="abertura">Data de Abertura</Label>
                        <Input
                          id="abertura"
                          type="date"
                          value={abertura}
                          onChange={(e) => setAbertura(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="risco">Risco</Label>
                        <Select value={risco} onValueChange={(value: Company["risco"]) => setRisco(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o risco" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baixo">Baixo</SelectItem>
                            <SelectItem value="Médio">Médio</SelectItem>
                            <SelectItem value="Alto">Alto</SelectItem>
                            <SelectItem value="Crítico">Crítico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={priority} onValueChange={(value: Company["priority"]) => setPriority(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(value: Company["status"]) => setStatus(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">A Fazer</SelectItem>
                            <SelectItem value="in-progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Data de Vencimento *</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="flows">
                {company && (
                  <CompanyFlows flows={company.flows || []} onAddFlow={handleAddFlow} currentUser={currentUser} />
                )}
              </TabsContent>

              <TabsContent value="notes">
                {company && <CompanyNotes notes={company.notes || []} currentUser={currentUser} />}
              </TabsContent>

              <TabsContent value="representante">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Representante Legal</h3>
                    <Button onClick={() => setIsRepresentanteModalOpen(true)}>
                      {company.representanteLegal ? "Editar" : "Cadastrar"}
                    </Button>
                  </div>
                  {company.representanteLegal ? (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">{company.representanteLegal.nome}</h4>
                      <p className="text-sm text-gray-600">CPF: {company.representanteLegal.cpf}</p>
                      <p className="text-sm text-gray-600">Telefone: {company.representanteLegal.telefone}</p>
                      <p className="text-sm text-gray-600">Endereço: {company.representanteLegal.endereco}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum representante legal cadastrado.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="parecer">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Parecer Final</h3>
                    <Button onClick={() => setIsParecerModalOpen(true)}>
                      {company.parecerFinal ? "Editar" : "Criar"}
                    </Button>
                  </div>
                  {company.parecerFinal ? (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Risco: {company.parecerFinal.risco}</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Orientação:</strong> {company.parecerFinal.orientacao}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Parecer:</strong> {company.parecerFinal.parecer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum parecer final criado.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <form id="company-form" onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnpj"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={consultarCNPJ}
                        disabled={isLoadingCnpj}
                        title="Consultar CNPJ"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="porte">Porte *</Label>
                    <Select value={porte} onValueChange={(value: Company["porte"]) => setPorte(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o porte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEI">MEI</SelectItem>
                        <SelectItem value="ME">ME - Microempresa</SelectItem>
                        <SelectItem value="EPP">EPP - Empresa de Pequeno Porte</SelectItem>
                        <SelectItem value="Grande">Grande Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                  <Input
                    id="nomeEmpresa"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    placeholder="Digite o nome da empresa"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      placeholder="Ex: SP"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Digite a cidade"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cnae">CNAE</Label>
                  <Input
                    id="cnae"
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    placeholder="Ex: 6201-5/00 - Desenvolvimento de programas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="abertura">Data de Abertura</Label>
                    <Input id="abertura" type="date" value={abertura} onChange={(e) => setAbertura(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="risco">Risco</Label>
                    <Select value={risco} onValueChange={(value: Company["risco"]) => setRisco(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o risco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Crítico">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={priority} onValueChange={(value: Company["priority"]) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: Company["status"]) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">A Fazer</SelectItem>
                        <SelectItem value="in-progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Data de Vencimento *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {company ? (
              <Button type="submit" form="company-form">
                Atualizar Empresa
              </Button>
            ) : (
              <Button type="submit" form="company-form">
                Cadastrar Empresa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal do Representante Legal */}
      <RepresentanteLegalModal
        isOpen={isRepresentanteModalOpen}
        onClose={() => setIsRepresentanteModalOpen(false)}
        onSubmit={handleCreateRepresentante}
        onUpdate={handleUpdateRepresentante}
        representante={company?.representanteLegal || null}
        companyId={company?.id || ""}
      />

      {/* Modal do Parecer Final */}
      <ParecerFinalModal
        isOpen={isParecerModalOpen}
        onClose={() => setIsParecerModalOpen(false)}
        onSubmit={handleCreateParecer}
        onUpdate={handleUpdateParecer}
        parecer={company?.parecerFinal || null}
        representanteLegal={company?.representanteLegal || null}
      />
    </>
  )
}
