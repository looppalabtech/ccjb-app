"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import type { Flow } from "@/types/task"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CompanyFlowsProps {
  flows: Flow[]
  onAddFlow: (flowData: Omit<Flow, "id" | "created_at" | "user">) => void
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

export default function CompanyFlows({ flows, onAddFlow, currentUser }: CompanyFlowsProps) {
  const [nomeFluxo, setNomeFluxo] = useState<Flow["nome_fluxo"]>("contrato social")
  const [checkFluxo, setCheckFluxo] = useState<Flow["check_fluxo"]>("válido")
  const [observacao, setObservacao] = useState("")

  const handleAddFlow = () => {
    if (observacao.trim()) {
      onAddFlow({
        nome_fluxo: nomeFluxo,
        check_fluxo: checkFluxo,
        observacao: observacao.trim(),
      })
      setObservacao("")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
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

  return (
    <div className="space-y-6">
      <div className="space-y-4 border rounded-md p-4">
        <h3 className="text-sm font-medium">Adicionar novo fluxo</h3>

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
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={handleAddFlow} disabled={!observacao.trim()}>
          Adicionar Fluxo
        </Button>
      </div>

      {flows.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Histórico de fluxos</h3>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {flows.map((flow) => (
                <div key={flow.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={flow.user?.avatar || "/placeholder.svg"} alt={flow.user?.name} />
                        <AvatarFallback>
                          {flow.user?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{flow.user?.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(flow.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize">
                      {flow.nome_fluxo}
                    </Badge>
                    <Badge className={getCheckFluxoColor(flow.check_fluxo)}>
                      {getCheckFluxoIcon(flow.check_fluxo)}
                      <span className="ml-1 capitalize">{flow.check_fluxo}</span>
                    </Badge>
                  </div>

                  <p className="text-sm whitespace-pre-wrap">{flow.observacao}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
