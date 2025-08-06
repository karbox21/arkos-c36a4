@echo off
echo ===================================================
echo VERIFICACAO DE CONEXAO EM TEMPO REAL - ARKOS
echo ===================================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao encontrado. Por favor, instale o Node.js.
    echo Visite https://nodejs.org/en/download/ para baixar e instalar.
    pause
    exit /b 1
)

REM Verificar versão do Node.js
echo [INFO] Verificando versao do Node.js...
node -v

REM Verificar conexão com a internet
echo [INFO] Verificando conexao com a internet...
ping -n 2 google.com >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Sem conexao com a internet. Verifique sua rede.
    pause
    exit /b 1
) else (
    echo [OK] Conexao com a internet funcionando.
)

REM Verificar conexão com o Supabase
echo [INFO] Verificando conexao com o Supabase...
ping -n 2 bsiwogyzrareprzzrxsx.supabase.co >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Nao foi possivel conectar ao Supabase. Verifique sua rede ou o status do servico.
    pause
    exit /b 1
) else (
    echo [OK] Conexao com o Supabase funcionando.
)

REM Verificar arquivo .env.local
echo [INFO] Verificando arquivo .env.local...
if not exist ".env.local" (
    echo [ERRO] Arquivo .env.local nao encontrado.
    echo Criando arquivo .env.local com configuracoes padrao...
    echo VITE_SUPABASE_URL=https://bsiwogyzrareprzzrxsx.supabase.co> .env.local
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzaXdvZ3l6cmFyZXByenpyeHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzI0NzksImV4cCI6MjA2OTY0ODQ3OX0.96uD5ev5u0EKGOYfQlEwwfn18zcFwoO6DbOJ2LDLazs>> .env.local
    echo [OK] Arquivo .env.local criado com sucesso.
) else (
    echo [OK] Arquivo .env.local encontrado.
)

REM Verificar dependências
echo [INFO] Verificando dependencias do projeto...
if not exist "node_modules" (
    echo [AVISO] Pasta node_modules nao encontrada. Instalando dependencias...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    ) else (
        echo [OK] Dependencias instaladas com sucesso.
    )
) else (
    echo [OK] Dependencias ja instaladas.
)

REM Verificar portas em uso
echo [INFO] Verificando portas em uso...
netstat -ano | findstr :5173 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Porta 5173 em uso. O servidor usará outra porta.
)

echo.
echo ===================================================
echo RESUMO DA VERIFICACAO
echo ===================================================
echo.
echo [OK] Node.js instalado
echo [OK] Conexao com a internet funcionando
echo [OK] Conexao com o Supabase funcionando
echo [OK] Arquivo .env.local configurado
echo [OK] Dependencias verificadas
echo.
echo O sistema esta pronto para conexao em tempo real!
echo Para iniciar o servidor, execute o arquivo "iniciar-servidor-tempo-real.bat"
echo.
echo O servidor será iniciado em um dos seguintes endereços:
echo - http://localhost:5173
echo - http://localhost:5174
echo - http://localhost:5175
echo - http://localhost:5176
echo - http://localhost:5177
echo - http://localhost:5178
echo.
echo Verifique o endereço exato no terminal após a inicialização
echo.
echo Para mais informacoes, consulte o arquivo "SOLUCAO-SERVIDOR-TEMPO-REAL.md"
echo.

pause