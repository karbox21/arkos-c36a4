# Solução para Problemas do Servidor em Tempo Real ARKOS

## Problema Identificado

O script `iniciar-servidor-tempo-real.bat` estava fechando imediatamente após ser executado, impedindo que o servidor ficasse online. Isso ocorria porque os comandos `npm` estavam sendo executados sem o prefixo `call`, o que fazia com que o script de lote (batch) terminasse prematuramente.

## Solução Implementada

O script `iniciar-servidor-tempo-real.bat` foi modificado para incluir o comando `call` antes dos comandos `npm`, garantindo que o script continue em execução após cada comando. Além disso, foi adicionada uma pausa extra no final para manter a janela aberta em caso de erro.

### Alterações realizadas:

1. Substituído `npm install --legacy-peer-deps` por `call npm install --legacy-peer-deps`
2. Substituído `npm run dev` por `call npm run dev`
3. Adicionado comentário explicativo sobre o uso do `call`
4. Adicionado comentário sobre a pausa final

## Como Usar o Servidor em Tempo Real

1. Execute o arquivo `iniciar-servidor-tempo-real.bat` com um duplo clique
2. Aguarde a instalação das dependências e a inicialização do servidor
3. O servidor será iniciado em um dos seguintes endereços:
   - http://localhost:5173
   - http://localhost:5174
   - http://localhost:5175
   - http://localhost:5176
   - http://localhost:5177
   - http://localhost:5178
4. Verifique o endereço exato no terminal após a inicialização
5. Acesse o endereço em seu navegador para utilizar o sistema

## Verificação de Problemas

Se ainda estiver enfrentando problemas, execute o arquivo `verificar-conexao-tempo-real.bat` para diagnosticar possíveis problemas com:

- Instalação do Node.js
- Conexão com a internet
- Conexão com o Supabase
- Configuração do arquivo .env.local
- Instalação das dependências do projeto

## Dicas Adicionais

1. **Janela fechando rapidamente**: Se a janela do terminal ainda fechar rapidamente, verifique se há erros no console. Você pode executar o script através do Prompt de Comando (cmd) para ver as mensagens de erro.

2. **Portas em uso**: Se uma porta já estiver em uso (por exemplo, 5173), o Vite tentará automaticamente a próxima porta disponível (5174, 5175, etc.). No exemplo atual, o servidor está rodando na porta 5178.

3. **Múltiplas instâncias**: Não execute múltiplas instâncias do servidor ao mesmo tempo, pois isso pode causar conflitos de porta.

4. **Firewall**: Certifique-se de que seu firewall não está bloqueando as conexões locais nas portas utilizadas pelo servidor.

5. **Antivírus**: Alguns programas antivírus podem bloquear a execução de scripts. Considere adicionar exceções para a pasta do projeto.

## Suporte

Se continuar enfrentando problemas após seguir todas as instruções acima, entre em contato com o suporte técnico do ARKOS para obter assistência adicional.