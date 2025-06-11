-- Adicionar coluna role à tabela users se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Atualizar usuários existentes para ter role 'user' se estiver NULL
UPDATE users SET role = 'user' WHERE role IS NULL;
