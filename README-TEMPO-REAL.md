# Instruções para o Servidor em Tempo Real ARKOS

## Configuração do Supabase

O sistema ARKOS utiliza o Supabase como backend para funcionalidades em tempo real. As credenciais já estão configuradas no arquivo `.env.local`.

## Como Iniciar o Servidor em Tempo Real

### Método 1: Usando o Executável

1. Dê um duplo clique no arquivo `iniciar-servidor-tempo-real.bat` na pasta raiz do projeto.
2. O servidor será iniciado automaticamente e abrirá no navegador padrão.
3. Aguarde até que a mensagem "Servidor iniciado em http://localhost:5173" apareça no terminal.

### Método 2: Usando Comandos npm

Se preferir iniciar manualmente, siga estes passos:

1. Abra um terminal na pasta raiz do projeto
2. Execute o comando: `npm install` (apenas na primeira vez)
3. Execute o comando: `npm run dev`
4. Acesse http://localhost:5173 no seu navegador

## Funcionalidades em Tempo Real

O sistema oferece as seguintes funcionalidades em tempo real:

1. **Monitoramento de Usuários Online**: Veja quem está usando o sistema em tempo real
2. **Atividades Recentes**: Acompanhe as ações realizadas por outros usuários
3. **Sincronização de Dados**: Todas as alterações são sincronizadas automaticamente

## Solução de Problemas

Se encontrar problemas com o servidor em tempo real:

1. **Verifique sua conexão com a internet**
2. **Reinicie o servidor**: Feche o terminal e inicie novamente o arquivo `iniciar-servidor-tempo-real.bat`
3. **Limpe o cache do navegador**: Às vezes, o cache pode causar problemas de conexão

## Requisitos do Sistema

- Node.js 14 ou superior
- Navegador moderno (Chrome, Firefox, Edge)
- Conexão com a internet

## Suporte

Se precisar de ajuda adicional, entre em contato com o suporte técnico.