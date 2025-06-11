-- Script corrigido para criar o usuário root
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se o usuário já existe
DO $$
DECLARE
    user_exists boolean;
    new_user_id uuid;
BEGIN
    -- Verificar se o usuário já existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'root@ccjb.com.br'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Gerar um novo UUID para o usuário
        new_user_id := gen_random_uuid();
        
        -- Inserir o usuário na tabela auth.users
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
            new_user_id,
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
        
        -- Inserir o perfil na tabela public.users
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
        );
        
        RAISE NOTICE 'Usuário root criado com sucesso! ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Usuário root já existe!';
    END IF;
END $$;
