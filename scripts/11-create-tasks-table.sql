-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'nova' CHECK (status IN ('nova', 'em_andamento', 'concluida', 'arquivada', 'trash')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todas as tarefas (para colaboração)
CREATE POLICY "Users can view all tasks" ON tasks
    FOR SELECT USING (true);

-- Política para permitir que usuários criem tarefas
CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Política para permitir que usuários atualizem tarefas que criaram ou que foram atribuídas a eles
CREATE POLICY "Users can update own or assigned tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to
    );

-- Política para permitir que usuários deletem apenas tarefas que criaram
CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid() = created_by);

-- Inserir algumas tarefas de exemplo (opcional)
INSERT INTO tasks (titulo, descricao, priority, due_date, created_by) VALUES
('Revisar documentação do projeto', 'Verificar se toda a documentação está atualizada', 'medium', CURRENT_DATE + INTERVAL '7 days', (SELECT id FROM users LIMIT 1)),
('Implementar nova funcionalidade', 'Desenvolver o módulo de relatórios', 'high', CURRENT_DATE + INTERVAL '14 days', (SELECT id FROM users LIMIT 1)),
('Corrigir bugs reportados', 'Resolver os bugs encontrados na última versão', 'high', CURRENT_DATE + INTERVAL '3 days', (SELECT id FROM users LIMIT 1));
