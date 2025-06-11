-- Criar tabela user_task_notify para gerenciar usuários que podem receber tarefas
CREATE TABLE IF NOT EXISTS public.user_task_notify (
    uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_task_notify_role ON public.user_task_notify(role);
CREATE INDEX IF NOT EXISTS idx_user_task_notify_email ON public.user_task_notify(email);

-- Inserir usuários existentes na nova tabela
INSERT INTO public.user_task_notify (uid, name, email, role)
SELECT 
    u.id,
    u.name,
    u.email,
    COALESCE(u.role, 'user') as role
FROM public.users u
WHERE u.role = 'user'
ON CONFLICT (uid) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Criar função para sincronizar automaticamente quando usuário for criado/atualizado
CREATE OR REPLACE FUNCTION sync_user_task_notify()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for INSERT ou UPDATE e o role for 'user'
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.role = 'user' THEN
        INSERT INTO public.user_task_notify (uid, name, email, role)
        VALUES (NEW.id, NEW.name, NEW.email, NEW.role)
        ON CONFLICT (uid) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            updated_at = NOW();
    END IF;
    
    -- Se for UPDATE e o role mudou de 'user' para outro, remover da tabela
    IF TG_OP = 'UPDATE' AND OLD.role = 'user' AND NEW.role != 'user' THEN
        DELETE FROM public.user_task_notify WHERE uid = NEW.id;
    END IF;
    
    -- Se for DELETE, remover da tabela
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public.user_task_notify WHERE uid = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS trigger_sync_user_task_notify ON public.users;
CREATE TRIGGER trigger_sync_user_task_notify
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_task_notify();
