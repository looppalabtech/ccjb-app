"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RepresentanteLegal } from "@/types/task"

interface RepresentanteLegalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    data: Omit<RepresentanteLegal, "id" | "created_at" | "updated_at" | "flows" | "notes" | "parecer_final">,
  ) => Promise<void>
  onUpdate?: (
    id: string,
    data: {
      nome: string
      cpf: string
      telefone: string
      endereco: string
    },
  ) => Promise<void>
  representante?: RepresentanteLegal | null
  companyId: string
}

export default function RepresentanteLegalModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  representante,
  companyId,
}: RepresentanteLegalModalProps) {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [endereco, setEndereco] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (representante) {
      setNome(representante.nome)
      setCpf(representante.cpf)
      setTelefone(representante.telefone || "")
      setEndereco(representante.endereco || "")
    } else {
      setNome("")
      setCpf("")
      setTelefone("")
      setEndereco("")
    }
    setError(null)
  }, [representante, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nome.trim() && cpf.trim()) {
      setIsSubmitting(true)
      setError(null)

      try {
        if (representante && onUpdate) {
          await onUpdate(representante.id, {
            nome: nome.trim(),
            cpf: cpf.trim(),
            telefone: telefone.trim(),
            endereco: endereco.trim(),
          })
        } else {
          await onSubmit({
            nome: nome.trim(),
            cpf: cpf.trim(),
            telefone: telefone.trim(),
            endereco: endereco.trim(),
            company_id: companyId,
          })
        }
        handleClose()
      } catch (err) {
        console.error("Erro ao salvar representante legal:", err)
        setError("Ocorreu um erro ao salvar os dados. Por favor, tente novamente.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setNome("")
      setCpf("")
      setTelefone("")
      setEndereco("")
      setError(null)
      onClose()
    }
  }

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Formata como CPF: 000.000.000-00
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    }
  }

  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Formata como telefone: (00) 00000-0000
    if (numbers.length <= 2) {
      return numbers.length ? `(${numbers}` : numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{representante ? "Editar Representante Legal" : "Cadastrar Representante Legal"}</DialogTitle>
          <DialogDescription>
            {representante
              ? "Atualize os dados do representante legal."
              : "Preencha os dados do representante legal da empresa."}
          </DialogDescription>
        </DialogHeader>

        <form id="representante-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome completo"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                required
                maxLength={14}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
                disabled={isSubmitting}
              />
            </div>

            {error && <div className="text-sm font-medium text-red-500 mt-2">{error}</div>}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="representante-form" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : representante ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
