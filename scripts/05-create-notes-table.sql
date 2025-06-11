-- Criar tabela de notas
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  representante_legal_id UUID,
  tipo TEXT NOT NULL DEFAULT 'Alerta Normal' CHECK (tipo IN ('Alerta Crítico', 'Alerta Normal', 'Aviso', 'Pendência', 'Reenvio de Documentos')),
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view all notes" ON public.notes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update notes" ON public.notes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete notes" ON public.notes
  FOR DELETE USING (auth.uid() IS NOT NULL);
