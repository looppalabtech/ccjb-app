export interface Note {
  id: string
  tipo: "Alerta Crítico" | "Alerta Normal" | "Aviso" | "Pendência" | "Reenvio de Documentos"
  content: string
  created_at: string
  created_by: string
  company_id: string | null
  representante_legal_id?: string | null
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

export interface Flow {
  id: string
  nome_fluxo: "contrato social" | "cnpj" | "representante legal" | "capital social" | "comprovante endereço"
  check_fluxo: "válido" | "inválido" | "compatível" | "inconsistente" | "positivo" | "negativo"
  observacao: string
  created_at: string
  created_by: string
  company_id: string | null
  representante_legal_id?: string | null
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

export interface ParecerFinal {
  id: string
  risco: "Baixo" | "Médio" | "Alto"
  orientacao: "Aprovar" | "Rejeitar"
  parecer: string
  created_at: string
  created_by: string
  company_id: string | null
  representante_legal_id?: string | null
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

export interface RepresentanteLegal {
  id: string
  nome: string
  cpf: string
  telefone: string
  endereco: string
  company_id: string
  created_by: string
  created_at: string
  updated_at: string
  flows?: Flow[]
  notes?: Note[]
  parecer_final?: ParecerFinal
}

export interface Company {
  id: string
  cnpj: string
  nome_empresa: string
  porte: "MEI" | "ME" | "EPP" | "Grande"
  estado: string
  cidade: string
  endereco: string
  cnae: string
  telefone: string
  email: string
  abertura: string
  risco: "Baixo" | "Médio" | "Alto" | "Crítico"
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date: string
  archived: boolean
  created_by: string
  created_at: string
  updated_at: string
  flows?: Flow[]
  notes?: Note[]
  parecer_final?: ParecerFinal
  representante_legal?: RepresentanteLegal
  created_by_user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

// Tipos para compatibilidade com componentes existentes
export interface Task extends Company {}
