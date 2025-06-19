import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import type { Company } from "@/types/task"

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não está configurada")
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      return { user: null, error: sessionError }
    }

    if (!session) {
      return { user: null, error: null }
    }

    return { user: session.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  return { data, error }
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// ===== FUNÇÕES PARA EMPRESAS =====

export const getCompanies = async (): Promise<{ data: Company[] | null; error: any }> => {
  try {
    // Buscar empresas com dados básicos
    const { data: companiesData, error: companiesError } = await supabase
      .from("companies")
      .select(`
        *,
        created_by_user:users!companies_created_by_fkey(id, name, email, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (companiesError) {
      return { data: null, error: companiesError }
    }

    if (!companiesData) {
      return { data: [], error: null }
    }

    // Para cada empresa, buscar dados relacionados separadamente
    const companiesWithRelations = await Promise.all(
      companiesData.map(async (company) => {
        // Buscar fluxos da empresa
        const { data: flows } = await supabase
          .from("flows")
          .select(`
            *,
            user:users!flows_created_by_fkey(id, name, email, avatar_url)
          `)
          .eq("company_id", company.id)
          .is("representante_legal_id", null)
          .order("created_at", { ascending: false })

        // Buscar notas da empresa
        const { data: notes } = await supabase
          .from("notes")
          .select(`
            *,
            user:users!notes_created_by_fkey(id, name, email, avatar_url)
          `)
          .eq("company_id", company.id)
          .is("representante_legal_id", null)
          .order("created_at", { ascending: false })

        // Buscar representante legal
        const { data: representanteLegalData } = await supabase
          .from("representantes_legais")
          .select("*")
          .eq("company_id", company.id)
          .single()

        let representanteLegal = null
        if (representanteLegalData) {
          // Buscar fluxos do representante legal
          const { data: repFlows } = await supabase
            .from("flows")
            .select(`
              *,
              user:users!flows_created_by_fkey(id, name, email, avatar_url)
            `)
            .eq("representante_legal_id", representanteLegalData.id)
            .order("created_at", { ascending: false })

          // Buscar notas do representante legal
          const { data: repNotes } = await supabase
            .from("notes")
            .select(`
              *,
              user:users!notes_created_by_fkey(id, name, email, avatar_url)
            `)
            .eq("representante_legal_id", representanteLegalData.id)
            .order("created_at", { ascending: false })

          representanteLegal = {
            ...representanteLegalData,
            flows: repFlows || [],
            notes: repNotes || [],
            createdAt: representanteLegalData.created_at,
            updatedAt: representanteLegalData.updated_at,
          }
        }

        // Buscar parecer final
        const { data: parecerFinalData } = await supabase
          .from("parecer_final")
          .select(`
            *,
            user:users!parecer_final_created_by_fkey(id, name, email, avatar_url)
          `)
          .eq("company_id", company.id)
          .single()

        // Transformar os dados para o formato esperado
        return {
          ...company,
          nomeEmpresa: company.nome_empresa,
          dueDate: company.due_date,
          createdAt: company.created_at,
          updatedAt: company.updated_at,
          representanteLegal,
          parecerFinal: parecerFinalData || null,
          flows: flows || [],
          notes: notes || [],
        } as Company
      }),
    )

    return { data: companiesWithRelations, error: null }
  } catch (error) {
    console.error("Erro inesperado ao buscar empresas:", error)
    return { data: null, error }
  }
}

export const createCompany = async (companyData: Omit<Company, "id" | "created_at" | "updated_at" | "created_by">) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Usuário não autenticado" } }
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      cnpj: companyData.cnpj,
      nome_empresa: companyData.nomeEmpresa,
      porte: companyData.porte,
      estado: companyData.estado,
      cidade: companyData.cidade,
      endereco: companyData.endereco,
      cnae: companyData.cnae,
      telefone: companyData.telefone,
      email: companyData.email,
      abertura: companyData.abertura,
      risco: companyData.risco,
      status: companyData.status,
      priority: companyData.priority,
      due_date: companyData.dueDate,
      archived: companyData.archived || false,
      created_by: session.user.id,
    })
    .select()
    .single()

  return { data, error }
}

export const updateCompany = async (id: string, updates: Partial<Company>) => {
  const updateData: any = {}

  // Mapear campos para o formato do banco
  if (updates.nomeEmpresa) updateData.nome_empresa = updates.nomeEmpresa
  if (updates.dueDate) updateData.due_date = updates.dueDate
  if (updates.cnpj) updateData.cnpj = updates.cnpj
  if (updates.porte) updateData.porte = updates.porte
  if (updates.estado) updateData.estado = updates.estado
  if (updates.cidade) updateData.cidade = updates.cidade
  if (updates.endereco) updateData.endereco = updates.endereco
  if (updates.cnae) updateData.cnae = updates.cnae
  if (updates.telefone) updateData.telefone = updates.telefone
  if (updates.email) updateData.email = updates.email
  if (updates.abertura) updateData.abertura = updates.abertura
  if (updates.risco) updateData.risco = updates.risco
  if (updates.status) updateData.status = updates.status
  if (updates.priority) updateData.priority = updates.priority
  if (updates.archived !== undefined) updateData.archived = updates.archived

  const { data, error } = await supabase.from("companies").update(updateData).eq("id", id).select().single()

  return { data, error }
}

export const archiveCompany = async (id: string) => {
  return updateCompany(id, { archived: true })
}

export const restoreCompany = async (id: string) => {
  return updateCompany(id, { archived: false })
}

// ===== FUNÇÕES PARA FLUXOS =====

export const createFlow = async (flowData: {
  company_id: string
  representante_legal_id?: string | null
  nome_fluxo: string
  check_fluxo: string
  observacao: string
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Usuário não autenticado" } }
  }

  const { data, error } = await supabase
    .from("flows")
    .insert({
      company_id: flowData.company_id,
      representante_legal_id: flowData.representante_legal_id || null,
      nome_fluxo: flowData.nome_fluxo,
      check_fluxo: flowData.check_fluxo,
      observacao: flowData.observacao,
      created_by: session.user.id,
    })
    .select(`
      *,
      user:users!flows_created_by_fkey(id, name, email, avatar_url)
    `)
    .single()

  return { data, error }
}

// ===== FUNÇÕES PARA NOTAS =====

export const createNote = async (noteData: {
  company_id: string
  representante_legal_id?: string | null
  tipo: string
  content: string
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Usuário não autenticado" } }
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      company_id: noteData.company_id,
      representante_legal_id: noteData.representante_legal_id || null,
      tipo: noteData.tipo,
      content: noteData.content,
      created_by: session.user.id,
    })
    .select(`
      *,
      user:users!notes_created_by_fkey(id, name, email, avatar_url)
    `)
    .single()

  return { data, error }
}

// ===== FUNÇÕES PARA REPRESENTANTES LEGAIS =====

export const createRepresentanteLegal = async (repData: {
  company_id: string
  nome: string
  cpf: string
  telefone: string
  endereco: string
}) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { data: null, error: { message: "Usuário não autenticado" } }
    }

    // Verificar se já existe um representante legal para esta empresa
    const { data: existingRep, error: checkError } = await supabase
      .from("representantes_legais")
      .select("id")
      .eq("company_id", repData.company_id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 é o código para "não encontrado"
      console.error("Erro ao verificar representante legal existente:", checkError)
      return { data: null, error: checkError }
    }

    if (existingRep) {
      // Se já existe, atualiza em vez de criar
      const { data, error } = await supabase
        .from("representantes_legais")
        .update({
          nome: repData.nome,
          cpf: repData.cpf,
          telefone: repData.telefone,
          endereco: repData.endereco,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRep.id)
        .select()
        .single()

      return { data, error }
    } else {
      // Se não existe, cria um novo
      const { data, error } = await supabase
        .from("representantes_legais")
        .insert({
          company_id: repData.company_id,
          nome: repData.nome,
          cpf: repData.cpf,
          telefone: repData.telefone,
          endereco: repData.endereco,
          created_by: session.user.id,
        })
        .select()
        .single()

      return { data, error }
    }
  } catch (error) {
    console.error("Erro inesperado ao criar/atualizar representante legal:", error)
    return { data: null, error }
  }
}

export const updateRepresentanteLegal = async (
  id: string,
  updates: {
    nome?: string
    cpf?: string
    telefone?: string
    endereco?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from("representantes_legais")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao atualizar representante legal:", error)
    return { data: null, error }
  }
}

export const getRepresentanteLegal = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from("representantes_legais")
      .select("*")
      .eq("company_id", companyId)
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao buscar representante legal:", error)
    return { data: null, error }
  }
}

// ===== FUNÇÕES PARA FLUXOS DO REPRESENTANTE LEGAL =====

export const createFlowRepresentante = async (flowData: {
  representante_legal_id: string
  nome_fluxo: string
  check_fluxo: string
  observacao: string
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Usuário não autenticado" } }
  }

  const { data, error } = await supabase
    .from("flows")
    .insert({
      company_id: null, // Não vinculado à empresa diretamente
      representante_legal_id: flowData.representante_legal_id,
      nome_fluxo: flowData.nome_fluxo,
      check_fluxo: flowData.check_fluxo,
      observacao: flowData.observacao,
      created_by: session.user.id,
    })
    .select(`
      *,
      user:users!flows_created_by_fkey(id, name, email, avatar_url)
    `)
    .single()

  return { data, error }
}

export const updateFlowRepresentante = async (
  id: string,
  updates: {
    nome_fluxo?: string
    check_fluxo?: string
    observacao?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from("flows")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        user:users!flows_created_by_fkey(id, name, email, avatar_url)
      `)
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao atualizar fluxo do representante:", error)
    return { data: null, error }
  }
}

export const deleteFlowRepresentante = async (id: string) => {
  try {
    const { error } = await supabase.from("flows").delete().eq("id", id)
    return { error }
  } catch (error) {
    console.error("Erro inesperado ao deletar fluxo do representante:", error)
    return { error }
  }
}

// ===== FUNÇÕES PARA NOTAS DO REPRESENTANTE LEGAL =====

export const createNoteRepresentante = async (noteData: {
  representante_legal_id: string
  tipo: string
  content: string
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Usuário não autenticado" } }
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      company_id: null, // Não vinculado à empresa diretamente
      representante_legal_id: noteData.representante_legal_id,
      tipo: noteData.tipo,
      content: noteData.content,
      created_by: session.user.id,
    })
    .select(`
      *,
      user:users!notes_created_by_fkey(id, name, email, avatar_url)
    `)
    .single()

  return { data, error }
}

export const updateNoteRepresentante = async (
  id: string,
  updates: {
    tipo?: string
    content?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        user:users!notes_created_by_fkey(id, name, email, avatar_url)
      `)
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao atualizar nota do representante:", error)
    return { data: null, error }
  }
}

export const deleteNoteRepresentante = async (id: string) => {
  try {
    const { error } = await supabase.from("notes").delete().eq("id", id)
    return { error }
  } catch (error) {
    console.error("Erro inesperado ao deletar nota do representante:", error)
    return { error }
  }
}

// ===== FUNÇÕES PARA PARECER FINAL DO REPRESENTANTE LEGAL =====

export const createParecerFinalRepresentante = async (parecerData: {
  representante_legal_id: string
  risco: string
  orientacao: string
  parecer: string
}) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { data: null, error: { message: "Usuário não autenticado" } }
    }

    // Verificar se já existe um parecer para este representante
    const { data: existingParecer, error: checkError } = await supabase
      .from("parecer_final")
      .select("id")
      .eq("representante_legal_id", parecerData.representante_legal_id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erro ao verificar parecer existente:", checkError)
      return { data: null, error: checkError }
    }

    if (existingParecer) {
      // Se já existe, atualiza em vez de criar
      const { data, error } = await supabase
        .from("parecer_final")
        .update({
          risco: parecerData.risco,
          orientacao: parecerData.orientacao,
          parecer: parecerData.parecer,
        })
        .eq("id", existingParecer.id)
        .select(`
          *,
          user:users!parecer_final_created_by_fkey(id, name, email, avatar_url)
        `)
        .single()

      return { data, error }
    } else {
      // Se não existe, cria um novo
      const { data, error } = await supabase
        .from("parecer_final")
        .insert({
          company_id: null, // Não vinculado à empresa diretamente
          representante_legal_id: parecerData.representante_legal_id,
          risco: parecerData.risco,
          orientacao: parecerData.orientacao,
          parecer: parecerData.parecer,
          created_by: session.user.id,
        })
        .select(`
          *,
          user:users!parecer_final_created_by_fkey(id, name, email, avatar_url)
        `)
        .single()

      return { data, error }
    }
  } catch (error) {
    console.error("Erro inesperado ao criar/atualizar parecer do representante:", error)
    return { data: null, error }
  }
}

export const updateParecerFinalRepresentante = async (
  id: string,
  updates: {
    risco?: string
    orientacao?: string
    parecer?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from("parecer_final")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        user:users!parecer_final_created_by_fkey(id, name, email, avatar_url)
      `)
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao atualizar parecer do representante:", error)
    return { data: null, error }
  }
}

export const deleteParecerFinalRepresentante = async (id: string) => {
  try {
    const { error } = await supabase.from("parecer_final").delete().eq("id", id)
    return { error }
  } catch (error) {
    console.error("Erro inesperado ao deletar parecer do representante:", error)
    return { error }
  }
}

// ===== FUNÇÕES PARA PARECER FINAL =====

export const createParecerFinal = async (parecerData: {
  company_id: string
  representante_legal_id?: string | null
  risco: string
  orientacao: string
  parecer: string
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { data: null, error: { message: "Usuário não autenticado" } }
  }

  const { data, error } = await supabase
    .from("parecer_final")
    .insert({
      company_id: parecerData.company_id,
      representante_legal_id: parecerData.representante_legal_id || null,
      risco: parecerData.risco,
      orientacao: parecerData.orientacao,
      parecer: parecerData.parecer,
      created_by: session.user.id,
    })
    .select(`
      *,
      user:users!parecer_final_created_by_fkey(id, name, email, avatar_url)
    `)
    .single()

  return { data, error }
}

// ===== FUNÇÕES PARA ATUALIZAR PARECER FINAL =====

export const updateParecerFinal = async (
  id: string,
  updates: {
    risco?: string
    orientacao?: string
    parecer?: string
  },
) => {
  const { data, error } = await supabase
    .from("parecer_final")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      user:users!parecer_final_created_by_fkey(id, name, email, avatar_url)
    `)
    .single()

  return { data, error }
}

// ===== FUNÇÕES PARA TAREFAS =====

export const getTasks = async () => {
  try {
    // Primeiro, buscar todas as tarefas
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (tasksError) {
      console.error("Erro ao buscar tarefas:", tasksError)
      return { data: null, error: tasksError }
    }

    if (!tasksData) {
      return { data: [], error: null }
    }

    // Buscar todos os usuários para fazer o join manualmente
    const { data: usersData, error: usersError } = await supabase.from("users").select("id, name, email, avatar_url")

    if (usersError) {
      console.error("Erro ao buscar usuários:", usersError)
      return { data: tasksData, error: null } // Retorna as tarefas sem os dados de usuário
    }

    // Criar um mapa de usuários para facilitar o acesso
    const usersMap = new Map()
    usersData?.forEach((user) => {
      usersMap.set(user.id, user)
    })

    // Adicionar os dados de usuário às tarefas
    const tasksWithUsers = tasksData.map((task) => {
      const assignedUser = task.assigned_to ? usersMap.get(task.assigned_to) : null
      const createdByUser = task.created_by ? usersMap.get(task.created_by) : null

      return {
        ...task,
        assigned_user: assignedUser || null,
        created_by_user: createdByUser || null,
      }
    })

    return { data: tasksWithUsers, error: null }
  } catch (error) {
    console.error("Erro inesperado ao buscar tarefas:", error)
    return { data: null, error }
  }
}

export const createTask = async (taskData: {
  titulo: string
  descricao?: string
  priority: string
  due_date: string
  assigned_to?: string
}) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { data: null, error: { message: "Usuário não autenticado" } }
    }

    // Inserir a nova tarefa
    const { data: newTask, error: insertError } = await supabase
      .from("tasks")
      .insert({
        titulo: taskData.titulo,
        descricao: taskData.descricao,
        priority: taskData.priority,
        due_date: taskData.due_date,
        assigned_to: taskData.assigned_to || session.user.id,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Erro ao inserir tarefa:", insertError)
      return { data: null, error: insertError }
    }

    // Criar notificação se a tarefa foi atribuída a outro usuário
    if (taskData.assigned_to && taskData.assigned_to !== session.user.id) {
      await createNotification({
        user_id: taskData.assigned_to,
        task_id: newTask.id,
        title: "Nova tarefa atribuída",
        message: `Você recebeu uma nova tarefa: ${taskData.titulo}`,
      })
    }

    // Buscar dados do usuário atribuído
    const { data: assignedUser } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .eq("id", newTask.assigned_to)
      .single()

    // Buscar dados do usuário que criou
    const { data: createdByUser } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .eq("id", newTask.created_by)
      .single()

    // Retornar a tarefa com os dados de usuário
    return {
      data: {
        ...newTask,
        assigned_user: assignedUser || null,
        created_by_user: createdByUser || null,
      },
      error: null,
    }
  } catch (error) {
    console.error("Erro inesperado ao criar tarefa:", error)
    return { data: null, error }
  }
}

export const updateTask = async (
  id: string,
  updates: {
    titulo?: string
    descricao?: string
    status?: "nova" | "em_andamento" | "concluida" | "arquivada" | "lixeira"
    priority?: string
    due_date?: string
    assigned_to?: string
  },
) => {
  try {
    // Filtrar apenas os campos válidos da tabela tasks
    const validUpdates: any = {}

    if (updates.titulo !== undefined) validUpdates.titulo = updates.titulo
    if (updates.descricao !== undefined) validUpdates.descricao = updates.descricao
    if (updates.status !== undefined) validUpdates.status = updates.status
    if (updates.priority !== undefined) validUpdates.priority = updates.priority
    if (updates.due_date !== undefined) validUpdates.due_date = updates.due_date
    if (updates.assigned_to !== undefined) validUpdates.assigned_to = updates.assigned_to

    // Atualizar a tarefa apenas com campos válidos
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(validUpdates)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar tarefa:", updateError)
      return { data: null, error: updateError }
    }

    // Buscar dados do usuário atribuído apenas se assigned_to não for null
    let assignedUser = null
    if (updatedTask.assigned_to) {
      const { data: assignedUserData, error: assignedUserError } = await supabase
        .from("users")
        .select("id, name, email, avatar_url")
        .eq("id", updatedTask.assigned_to)
        .single()

      if (!assignedUserError) {
        assignedUser = assignedUserData
      }
    }

    // Buscar dados do usuário que criou apenas se created_by não for null
    let createdByUser = null
    if (updatedTask.created_by) {
      const { data: createdByUserData, error: createdByUserError } = await supabase
        .from("users")
        .select("id, name, email, avatar_url")
        .eq("id", updatedTask.created_by)
        .single()

      if (!createdByUserError) {
        createdByUser = createdByUserData
      }
    }

    // Retornar a tarefa com os dados de usuário
    return {
      data: {
        ...updatedTask,
        assigned_user: assignedUser,
        created_by_user: createdByUser,
      },
      error: null,
    }
  } catch (error) {
    console.error("Erro inesperado ao atualizar tarefa:", error)
    return { data: null, error }
  }
}

export const deleteTask = async (id: string) => {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    return { error }
  } catch (error) {
    console.error("Erro inesperado ao deletar tarefa:", error)
    return { error }
  }
}

// Buscar usuários com fallback para tabela users se user_task_notify não existir
export const getUsers = async () => {
  try {
    // Tentar buscar da tabela user_task_notify primeiro
    const { data: taskNotifyData, error: taskNotifyError } = await supabase
      .from("user_task_notify")
      .select("uid as id, name, email, role")
      .order("name", { ascending: true })

    // Se a tabela user_task_notify existir e não houver erro, usar ela
    if (!taskNotifyError && taskNotifyData) {
      return { data: taskNotifyData, error: null }
    }

    // Fallback: usar tabela users com filtro por role
    console.log("Tabela user_task_notify não encontrada, usando fallback para tabela users")
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("role", "user")
      .order("name", { ascending: true })

    if (usersError) {
      // Se também falhar na tabela users, tentar sem filtro de role
      console.log("Erro ao filtrar por role, buscando todos os usuários")
      const { data: allUsersData, error: allUsersError } = await supabase
        .from("users")
        .select("id, name, email")
        .order("name", { ascending: true })

      return { data: allUsersData, error: allUsersError }
    }

    return { data: usersData, error: null }
  } catch (error) {
    console.error("Erro inesperado ao buscar usuários:", error)
    return { data: null, error }
  }
}

// Função para sincronizar usuário na tabela user_task_notify
export const syncUserTaskNotify = async (userData: {
  uid: string
  name: string
  email: string
  role: string
}) => {
  try {
    const { data, error } = await supabase
      .from("user_task_notify")
      .upsert({
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao sincronizar usuário:", error)
    return { data: null, error }
  }
}

// ===== FUNÇÕES PARA NOTIFICAÇÕES =====

// Criar notificação
export const createNotification = async (notificationData: {
  user_id: string
  task_id: string
  title: string
  message: string
}) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notificationData.user_id,
        task_id: notificationData.task_id,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao criar notificação:", error)
    return { data: null, error }
  }
}

// Buscar notificações não lidas
export const getUnreadNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, created_at, task_id")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao buscar notificações não lidas:", error)
    return { data: null, error }
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    return { error }
  } catch (error) {
    console.error("Erro inesperado ao marcar notificação como lida:", error)
    return { error }
  }
}

export const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        title,
        message,
        read,
        created_at,
        task_id,
        tasks!notifications_task_id_fkey(titulo, status)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Erro inesperado ao buscar notificações:", error)
    return { data: null, error }
  }
}

export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

    return { error }
  } catch (error) {
    console.error("Erro inesperado ao deletar notificação:", error)
    return { error }
  }
}

// Função para esvaziar lixeira
export const emptyTrash = async () => {
  try {
    const { error } = await supabase.from("tasks").delete().eq("status", "lixeira")

    return { error }
  } catch (error) {
    console.error("Erro inesperado ao esvaziar lixeira:", error)
    return { error }
  }
}
