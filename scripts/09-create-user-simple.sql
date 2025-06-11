-- Script alternativo mais simples
-- Este script usa as funções nativas do Supabase

-- Função para criar usuário usando as funções do Supabase
DO $$
DECLARE
    new_user_id uuid;
    user_exists boolean;
BEGIN
    -- Verificar se o usuário já existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'root@ccjb.com.br'
    ) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Usuário já existe! Removendo para recriar...';
        DELETE FROM auth.users WHERE email = 'root@ccjb.com.br';
        DELETE FROM public.users WHERE email = 'root@ccjb.com.br';
    END IF;
    
    -- Gerar UUID para o novo usuário
    new_user_id := gen_random_uuid();
    
    -- Inserir na tabela auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'root@ccjb.com.br',
        crypt('senha123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Administrador CCJB"}'
    );
    
    -- Inserir na tabela public.users (se existir)
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'root@ccjb.com.br',
        'Administrador CCJB',
        'admin',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Usuário criado com sucesso!';
    RAISE NOTICE 'ID: %', new_user_id;
    RAISE NOTICE 'Email: root@ccjb.com.br';
    RAISE NOTICE 'Senha: senha123';
    
END $$;

-- Verificar o resultado
SELECT 
    'auth.users' as tabela,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'root@ccjb.com.br'

UNION ALL

SELECT 
    'public.users' as tabela,
    id::text,
    email,
    created_at::timestamptz,
    updated_at
FROM public.users 
WHERE email = 'root@ccjb.com.br';
