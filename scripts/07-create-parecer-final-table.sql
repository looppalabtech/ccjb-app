-- Criar tabela de pareceres finais
CREATE TABLE IF NOT EXISTS public.parecer_final (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  representante_legal_id UUID REFERENCES public.representantes_legais(id) ON DELETE CASCADE,
  risco TEXT NOT NULL DEFAULT 'Baixo' CHECK (risco IN ('Baixo', 'Médio', 'Alto')),
  orientacao TEXT NOT NULL CHECK (orientacao IN ('Aprovar', 'Rejeitar')),
  parecer TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.parecer_final ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view all pareceres" ON public.parecer_final
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert pareceres" ON public.parecer_final
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update pareceres" ON public.parecer_final
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete pareceres" ON public.parecer_final
  FOR DELETE USING (auth.uid() IS NOT NULL);
