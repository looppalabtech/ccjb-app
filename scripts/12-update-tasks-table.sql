-- Adicionar coluna read para marcar notificações como lidas
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Atualizar constraint de status para incluir 'lixeira'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('nova', 'em_andamento', 'concluida', 'arquivada', 'lixeira'));

-- Atualizar tarefas existentes com status 'trash' para 'lixeira'
UPDATE tasks SET status = 'lixeira' WHERE status = 'trash';
