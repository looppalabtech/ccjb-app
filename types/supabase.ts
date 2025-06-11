export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          avatar_url?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          cnpj: string
          nome_empresa: string
          porte: string
          estado: string
          cidade: string
          endereco: string
          cnae: string
          telefone: string
          email: string
          abertura: string
          risco: string
          status: string
          priority: string
          due_date: string
          archived: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          cnpj: string
          nome_empresa: string
          porte: string
          estado: string
          cidade: string
          endereco: string
          cnae: string
          telefone: string
          email: string
          abertura: string
          risco?: string
          status?: string
          priority?: string
          due_date: string
          archived?: boolean
          created_by: string
        }
        Update: {
          cnpj?: string
          nome_empresa?: string
          porte?: string
          estado?: string
          cidade?: string
          endereco?: string
          cnae?: string
          telefone?: string
          email?: string
          abertura?: string
          risco?: string
          status?: string
          priority?: string
          due_date?: string
          archived?: boolean
        }
      }
      flows: {
        Row: {
          id: string
          company_id: string
          representante_legal_id: string | null
          nome_fluxo: string
          check_fluxo: string
          observacao: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          representante_legal_id?: string | null
          nome_fluxo: string
          check_fluxo: string
          observacao: string
          created_by: string
        }
        Update: {
          nome_fluxo?: string
          check_fluxo?: string
          observacao?: string
        }
      }
      notes: {
        Row: {
          id: string
          company_id: string
          representante_legal_id: string | null
          tipo: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          representante_legal_id?: string | null
          tipo: string
          content: string
          created_by: string
        }
        Update: {
          tipo?: string
          content?: string
        }
      }
      representantes_legais: {
        Row: {
          id: string
          company_id: string
          nome: string
          cpf: string
          telefone: string
          endereco: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          nome: string
          cpf: string
          telefone: string
          endereco: string
          created_by: string
        }
        Update: {
          nome?: string
          cpf?: string
          telefone?: string
          endereco?: string
        }
      }
      parecer_final: {
        Row: {
          id: string
          company_id: string
          representante_legal_id: string | null
          risco: string
          orientacao: string
          parecer: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          representante_legal_id?: string | null
          risco: string
          orientacao: string
          parecer: string
          created_by: string
        }
        Update: {
          risco?: string
          orientacao?: string
          parecer?: string
        }
      }
      tasks: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          status: "nova" | "em_andamento" | "concluida" | "lixeira"
          priority: "low" | "medium" | "high"
          due_date: string
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          status?: "nova" | "em_andamento" | "concluida" | "lixeira"
          priority?: "low" | "medium" | "high"
          due_date: string
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          status?: "nova" | "em_andamento" | "concluida" | "lixeira"
          priority?: "low" | "medium" | "high"
          due_date?: string
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
