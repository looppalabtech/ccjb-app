"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ParecerFinal, RepresentanteLegal } from "@/types/task"

interface ParecerFinalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (parecer: {
    risco: string
    orientacao: string
    parecer: string
    representante_legal_id?: string
  }) => void
  onUpdate?: (
    id: string,
    parecer: {
      risco: string
      orientacao: string
      parecer: string
    },
  ) => void
  parecer?: ParecerFinal | null
  representanteLegal?: RepresentanteLegal | null
}

export default function ParecerFinalModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  parecer,
  representanteLegal,
}: ParecerFinalModalProps) {
  const [risco, setRisco] = useState("")
  const [orientacao, setOrientacao] = useState("")
  const [parecerText, setParecerText] = useState("")
  const [useRepresentante, setUseRepresentante] = useState(false)

  useEffect(() => {
    if (parecer) {
      setRisco(parecer.risco)
      setOrientacao(parecer.orientacao)
      setParecerText(parecer.parecer)
      setUseRepresentante(!!parecer.representante_legal_id)
    } else {
      setRisco("")
      setOrientacao("")
      setParecerText("")
      setUseRepresentante(false)
    }
  }, [parecer, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (risco && orientacao && parecerText) {
      if (parecer && onUpdate) {
        onUpdate(parecer.id, {
          risco,
          orientacao,
          parecer: parecerText,
        })
      } else {
        onSubmit({
          risco,
          orientacao,
          parecer: parecerText,
          representante_legal_id: useRepresentante && representanteLegal ? representanteLegal.id : undefined,
        })
      }
      handleClose()
    }
  }

  const handleClose = () => {
    setRisco("")
    setOrientacao("")
    setParecerText("")
    setUseRepresentante(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{parecer ? "Editar Parecer Final" : "Criar Parecer Final"}</DialogTitle>
          <DialogDescription>
            {parecer
              ? "Atualize as informações do parecer final."
              : "Preencha as informações para criar o parecer final."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="risco">Risco *</Label>
              <Select value={risco} onValueChange={setRisco}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de risco" />
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
              <Label htmlFor="orientacao">Orientação *</Label>
              <Textarea
                id="orientacao"
                value={orientacao}
                onChange={(e) => setOrientacao(e.target.value)}
                placeholder="Descreva as orientações para a empresa..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parecer">Parecer *</Label>
              <Textarea
                id="parecer"
                value={parecerText}
                onChange={(e) => setParecerText(e.target.value)}
                placeholder="Descreva o parecer final..."
                rows={6}
                required
              />
            </div>

            {representanteLegal && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useRepresentante"
                  checked={useRepresentante}
                  onChange={(e) => setUseRepresentante(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useRepresentante">Associar ao representante legal ({representanteLegal.nome})</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">{parecer ? "Atualizar" : "Criar"} Parecer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
