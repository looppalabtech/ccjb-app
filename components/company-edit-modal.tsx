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
import type { Company } from "@/types/task"

interface CompanyEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (companyData: Partial<Company>) => void
  company: Company
}

export default function CompanyEditModal({ isOpen, onClose, onSubmit, company }: CompanyEditModalProps) {
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

  useEffect(() => {
    if (company && isOpen) {
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
    }
  }, [company, isOpen])

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
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>Atualize os dados da empresa abaixo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
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
                <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ex: SP" />
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
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Atualizar Empresa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
