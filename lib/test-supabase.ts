import { supabase } from "./supabase"

export const testSupabaseConnection = async () => {
  try {
    console.log("🧪 Iniciando teste de conexão com Supabase...")

    // 1. Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL não configurada" }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada" }
    }

    console.log("✅ Variáveis de ambiente configuradas")

    // 2. Testar conexão básica com o banco
    console.log("🔍 Testando conexão com banco...")
    const { data: testData, error: testError } = await supabase.from("users").select("count").limit(1)

    if (testError) {
      console.error("❌ Erro na conexão com banco:", testError.message)
      return { success: false, error: `Erro de conexão: ${testError.message}` }
    }

    console.log("✅ Conexão com banco estabelecida")

    // 3. Verificar se há sessão ativa
    console.log("🔍 Verificando sessão ativa...")
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("❌ Erro ao verificar sessão:", sessionError.message)
    } else {
      console.log(session ? "✅ Sessão ativa encontrada" : "ℹ️ Nenhuma sessão ativa")
    }

    // 4. Verificar se usuário root existe (tentativa de login com credenciais inválidas)
    console.log("🔍 Verificando se usuário root existe...")
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: "root@ccjb.com.br",
      password: "senha-invalida-teste",
    })

    const rootExists = authError?.message === "Invalid login credentials"

    if (rootExists) {
      console.log("✅ Usuário root encontrado no sistema de autenticação")
    } else {
      console.log("⚠️ Usuário root não encontrado ou erro:", authError?.message)
    }

    // 5. Verificar se tabela users existe e tem dados
    console.log("🔍 Verificando tabela users...")
    const { data: usersData, error: usersError } = await supabase.from("users").select("id, email, name").limit(5)

    if (usersError) {
      console.error("❌ Erro ao acessar tabela users:", usersError.message)
    } else {
      console.log("✅ Tabela users acessível:", usersData?.length || 0, "registros encontrados")
    }

    console.log("✅ Teste de conexão concluído com sucesso")
    return {
      success: true,
      message: `Conexão OK${session ? " (logado)" : " (não logado)"}${rootExists ? " - Root existe" : " - Root não encontrado"}`,
      details: {
        connected: true,
        hasSession: !!session,
        rootExists,
        usersTableAccessible: !usersError,
        usersCount: usersData?.length || 0,
      },
    }
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error)
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Função adicional para testar login completo
export const testLogin = async (email: string, password: string) => {
  try {
    console.log("🔐 Testando login com:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Erro no login:", error.message)
      return { success: false, error: error.message }
    }

    console.log("✅ Login realizado com sucesso")

    // Fazer logout imediatamente após o teste
    await supabase.auth.signOut()
    console.log("✅ Logout realizado após teste")

    return { success: true, user: data.user }
  } catch (error) {
    console.error("❌ Erro inesperado no teste de login:", error)
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
