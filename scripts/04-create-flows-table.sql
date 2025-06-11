-- Criar tabela de fluxos
CREATE TABLE IF NOT EXISTS public.flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  representante_legal_id UUID,
  nome_fluxo TEXT NOT NULL CHECK (nome_fluxo IN ('contrato social', 'cnpj', 'representante legal', 'capital social', 'comprovante endereço')),
  check_fluxo TEXT NOT NULL CHECK (check_fluxo IN ('válido', 'inválido', 'compatível', 'inconsistente', 'positivo', 'negativo')),
  observacao TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view all flows" ON public.flows
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert flows" ON public.flows
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update flows" ON public.flows
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete flows" ON public.flows
  FOR DELETE USING (auth.uid() IS NOT NULL);
