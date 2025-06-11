-- Criar tabela de representantes legais
CREATE TABLE IF NOT EXISTS public.representantes_legais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.representantes_legais ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view all representantes" ON public.representantes_legais
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert representantes" ON public.representantes_legais
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update representantes" ON public.representantes_legais
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete representantes" ON public.representantes_legais
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER handle_representantes_updated_at
  BEFORE UPDATE ON public.representantes_legais
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
