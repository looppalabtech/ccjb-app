-- Script para inserir o primeiro usuário no sistema
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos limpar qualquer usuário existente com este email (opcional)
DELETE FROM auth.users WHERE email = 'root@ccjb.com.br';
DELETE FROM public.users WHERE email = 'root@ccjb.com.br';

-- Inserir o usuário na tabela auth.users do Supabase
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'root@ccjb.com.br',
    crypt('senha123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrador CCJB"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Verificar se o usuário foi criado
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'root@ccjb.com.br';

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Usuário root@ccjb.com.br criado com sucesso!';
    RAISE NOTICE 'Email: root@ccjb.com.br';
    RAISE NOTICE 'Senha: senha123';
    RAISE NOTICE 'O usuário pode fazer login imediatamente.';
END $$;
