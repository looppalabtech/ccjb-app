-- Script para verificar se o usuário foi criado corretamente

-- Verificar na tabela auth.users
SELECT 
    '🔍 Verificando auth.users' as status;

SELECT 
    id,
    email,
    role,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'root@ccjb.com.br';

-- Verificar na tabela public.users (se existir)
SELECT 
    '🔍 Verificando public.users' as status;

SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM public.users 
WHERE email = 'root@ccjb.com.br';

-- Contar total de usuários
SELECT 
    '📊 Total de usuários' as status,
    COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
    '📊 Total de perfis' as status,
    COUNT(*) as total_public_users
FROM public.users;

-- Verificar se a senha está criptografada corretamente
SELECT 
    '🔐 Verificando senha' as status,
    CASE 
        WHEN encrypted_password IS NOT NULL AND encrypted_password != '' 
        THEN '✅ Senha criptografada encontrada'
        ELSE '❌ Problema com a senha'
    END as senha_status
FROM auth.users 
WHERE email = 'root@ccjb.com.br';
