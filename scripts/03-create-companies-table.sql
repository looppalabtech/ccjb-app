-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT UNIQUE NOT NULL,
  nome_empresa TEXT NOT NULL,
  porte TEXT NOT NULL CHECK (porte IN ('MEI', 'ME', 'EPP', 'Grande')),
  estado TEXT,
  cidade TEXT,
  endereco TEXT,
  cnae TEXT,
  telefone TEXT,
  email TEXT,
  abertura DATE,
  risco TEXT NOT NULL DEFAULT 'Baixo' CHECK (risco IN ('Baixo', 'Médio', 'Alto', 'Crítico')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view all companies" ON public.companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update companies" ON public.companies
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete companies" ON public.companies
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER handle_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
