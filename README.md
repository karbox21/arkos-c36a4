# ARKOS - Sistema de Gerenciamento em Tempo Real

## Sobre o Projeto

ARKOS é um sistema de gerenciamento em tempo real que permite o controle de pacotes, operadores e coleções, com sincronização em nuvem através do Supabase.

## Funcionalidades

- Login e cadastro de usuários
- Escaneamento de pacotes com detecção de duplicados
- Sincronização em tempo real com Supabase
- Gerenciamento de operadores
- Relatórios e exportação de dados
- Interface responsiva e moderna

## Tecnologias Utilizadas

- React
- Supabase (Autenticação, Banco de Dados)
- Vite
- TailwindCSS
- Framer Motion

## Como Executar Localmente

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Como Fazer Deploy

### Pré-requisitos

1. Configure seu projeto no Supabase:
   - Crie uma conta em supabase.com
   - Crie um novo projeto
   - Configure as tabelas necessárias

### Deploy

Para fazer o deploy:

1. **Construa o aplicativo**:
   ```
   npm run build
   ```

2. **Faça o upload para seu serviço de hospedagem preferido** (Vercel, Netlify, etc.)

## Solução de Problemas

### Problemas de Login

Se você encontrar problemas ao fazer login:

1. Verifique se está usando um email válido no formato correto (exemplo@dominio.com)
2. Certifique-se de que sua senha tem pelo menos 6 caracteres
3. Verifique sua conexão com a internet

### Sincronização em Tempo Real

O sistema sincroniza automaticamente os dados com o Supabase. Se você notar problemas de sincronização:

1. Verifique sua conexão com a internet
2. Verifique o status de sincronização no canto inferior da tela
3. Tente recarregar a página

## Contato

Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento.