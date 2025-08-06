# Guia de Conexão em Tempo Real para Múltiplos PCs - ARKOS

## Visão Geral

Este guia explica como configurar múltiplos computadores para se conectarem ao sistema ARKOS em tempo real, permitindo que todos os usuários vejam uns aos outros online e compartilhem atualizações em tempo real.

## Requisitos

- Todos os computadores devem estar conectados à internet
- Node.js instalado em cada computador (versão 14 ou superior)
- Acesso ao mesmo banco de dados Supabase

## Configuração em Cada Computador

### 1. Instalação do Sistema

Para cada computador que deseja conectar ao sistema em tempo real:

1. Copie a pasta completa do projeto ARKOS para o computador
2. Certifique-se de que o arquivo `.env.local` esteja presente com as credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=https://bsiwogyzrareprzzrxsx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzaXdvZ3l6cmFyZXByenpyeHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzI0NzksImV4cCI6MjA2OTY0ODQ3OX0.96uD5ev5u0EKGOYfQlEwwfn18zcFwoO6DbOJ2LDLazs
   ```

### 2. Iniciando o Servidor em Cada Computador

Em cada computador, inicie o servidor seguindo um destes métodos:

#### Método 1: Usando o Executável

1. Dê um duplo clique no arquivo `iniciar-servidor-tempo-real.bat` na pasta raiz do projeto
2. O servidor será iniciado automaticamente e abrirá no navegador padrão
3. Aguarde até que a mensagem "Servidor iniciado" apareça no terminal

#### Método 2: Usando Comandos npm

1. Abra um terminal na pasta raiz do projeto
2. Execute o comando: `npm install --legacy-peer-deps`
3. Execute o comando: `npm run dev`
4. Acesse o endereço local mostrado no terminal (geralmente http://localhost:5173, http://localhost:5174, http://localhost:5175 ou http://localhost:5176)

### 3. Verificando a Conexão

Para verificar se os computadores estão conectados em tempo real:

1. Observe o painel "Real-Time Monitoring" no canto superior direito da interface
2. Você deverá ver os outros usuários listados em "Online Users"
3. Qualquer ação realizada por outros usuários aparecerá em "Recent Activities"

## Solução de Problemas

### Problema: Computadores não aparecem online

1. **Verifique a conexão com a internet** em todos os computadores
2. **Verifique o arquivo `.env.local`** para garantir que as credenciais do Supabase estejam corretas
3. **Reinicie o servidor** fechando o terminal e iniciando novamente o arquivo `iniciar-servidor-tempo-real.bat`
4. **Verifique se todos os computadores estão usando a mesma versão do sistema**

### Problema: Erro de dependências ao instalar

Se você encontrar erros relacionados a conflitos de dependências ao executar `npm install`, use o seguinte comando:

```
npm install --legacy-peer-deps
```

Este comando ignora os conflitos de dependências entre pares e permite que a instalação seja concluída.

### Problema: Servidor não inicia

1. Verifique se o Node.js está instalado corretamente executando `node -v` no terminal
2. Verifique se não há outro servidor rodando na mesma porta
3. Tente usar uma porta diferente adicionando `--port 3000` ao comando `npm run dev`

## Melhores Práticas

1. **Mantenha todos os computadores atualizados** com a mesma versão do sistema
2. **Faça login com contas diferentes** em cada computador para melhor identificação
3. **Mantenha o servidor rodando** enquanto estiver usando o sistema
4. **Sincronize regularmente** clicando no botão de atualização no painel de monitoramento

## Suporte

Se você continuar enfrentando problemas com a conexão em tempo real, entre em contato com o suporte técnico fornecendo:

1. Versão do Node.js (`node -v`)
2. Sistema operacional e versão
3. Logs de erro do terminal
4. Descrição detalhada do problema

---

*Este guia foi criado para ajudar na configuração do sistema ARKOS em múltiplos computadores. Siga as instruções cuidadosamente para garantir uma experiência em tempo real sem problemas.*