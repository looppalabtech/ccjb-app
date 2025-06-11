# Configuração do Banco de Dados - CCJB Compliance

## Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Variáveis de ambiente configuradas

## Configuração das Variáveis de Ambiente

Crie um arquivo \`.env.local\` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
\`\`\`

## Execução dos Scripts SQL

Execute os scripts na seguinte ordem no SQL Editor do Supabase:

### 1. Criar Tabela de Usuários
Execute o script \`01-create-users-table.sql\`

### 2. Criar Usuário Root
Execute o script \`02-create-root-user.sql\`

**IMPORTANTE**: Este script deve ser executado como administrador no SQL Editor do Supabase.

### 3. Criar Tabelas do Sistema
Execute os scripts na ordem:
- \`03-create-companies-table.sql\`
- \`04-create-flows-table.sql\`
- \`05-create-notes-table.sql\`
- \`06-create-representantes-legais-table.sql\`
- \`07-create-parecer-final-table.sql\`

## Usuário Padrão Criado

- **Email**: root@ccjb.com.br
- **Senha**: senha123
- **Role**: admin

## Estrutura do Banco de Dados

### Tabelas Principais:

1. **users** - Perfis dos usuários
2. **companies** - Empresas cadastradas
3. **flows** - Fluxos de documentação
4. **notes** - Notas e observações
5. **representantes_legais** - Representantes legais das empresas
6. **parecer_final** - Pareceres finais

### Recursos de Segurança:

- **RLS (Row Level Security)** habilitado em todas as tabelas
- **Políticas de acesso** configuradas
- **Triggers** para timestamps automáticos
- **Função automática** para criação de perfil de usuário

## Verificação da Instalação

Após executar todos os scripts:

1. Verifique se todas as tabelas foram criadas
2. Confirme se o usuário root foi criado
3. Teste o login com as credenciais fornecidas
4. Verifique se as políticas RLS estão ativas

## Troubleshooting

### Erro ao criar usuário root:
- Certifique-se de executar o script como administrador
- Verifique se não há conflitos de email

### Problemas de permissão:
- Confirme se RLS está habilitado
- Verifique se as políticas foram criadas corretamente

### Erro de conexão:
- Confirme as variáveis de ambiente
- Verifique se o projeto Supabase está ativo
\`\`\`
