"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Archive, RotateCcw, Building2, MessageSquare } from "lucide-react"
import type { Company } from "@/types/task"

interface ArchivedCompaniesProps {
  isOpen: boolean
  onClose: () => void
  companies: Company[]
  onRestoreCompany: (companyId: string) => void
  onViewCompany: (company: Company) => void
}

export default function ArchivedCompanies({
  isOpen,
  onClose,
  companies,
  onRestoreCompany,
  onViewCompany,
}: ArchivedCompaniesProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const archivedCompanies = companies.filter((company) => company.archived)

  const filteredCompanies = archivedCompanies.filter(
    (company) =>
      company.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm) ||
      company.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.estado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Archive className="h-5 w-5 mr-2" />
              Empresas Arquivadas
            </DialogTitle>
            <DialogDescription>
              Gerencie empresas que foram arquivadas. Você pode restaurar ou excluir permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, CNPJ, cidade ou estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total de empresas arquivadas: {archivedCompanies.length}</span>
              {searchTerm && <span>Mostrando: {filteredCompanies.length} resultados</span>}
            </div>

            {/* Companies List */}
            <ScrollArea className="h-[500px]">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {archivedCompanies.length === 0 ? (
                    <>
                      <Archive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma empresa arquivada.</p>
                      <p className="text-sm">Empresas arquivadas aparecerão aqui.</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma empresa encontrada.</p>
                      <p className="text-sm">Tente ajustar os termos de busca.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCompanies.map((company) => (
                    <Card key={company.id} className="hover:shadow-md transition-shadow opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{company.nomeEmpresa}</CardTitle>
                            <p className="text-sm text-gray-600">{company.cnpj}</p>
                          </div>
                          <Badge variant="outline" className="bg-gray-100">
                            Arquivada
                          </Badge>
                        </div>
                        <CardDescription>
                          {company.cidade} - {company.estado}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getPriorityColor(company.priority)}>
                            {getPriorityText(company.priority)}
                          </Badge>
                          <Badge className={getRiskColor(company.risco)}>Risco: {company.risco}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{company.porte}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Arquivada em: {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                        {(company.flows.length > 0 || company.notes.length > 0) && (
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            {company.flows.length > 0 && (
                              <div className="flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {company.flows.length} {company.flows.length === 1 ? "fluxo" : "fluxos"}
                              </div>
                            )}
                            {company.notes.length > 0 && (
                              <div className="flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {company.notes.length} {company.notes.length === 1 ? "nota" : "notas"}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewCompany(company)} className="flex-1">
                          Ver Detalhes
                        </Button>
                        <Button size="sm" onClick={() => onRestoreCompany(company.id)} className="flex-1">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restaurar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
