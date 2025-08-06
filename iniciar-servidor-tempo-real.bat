@echo off
echo ===================================================
echo INICIANDO SERVIDOR EM TEMPO REAL ARKOS
echo ===================================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Erro: Node.js não encontrado. Por favor, instale o Node.js.
    echo Visite https://nodejs.org/en/download/ para baixar e instalar.
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Erro: npm não encontrado. Por favor, reinstale o Node.js.
    pause
    exit /b 1
)

echo Verificando dependências...
call npm install --legacy-peer-deps

echo.
echo ===================================================
echo INICIANDO SERVIDOR EM TEMPO REAL
echo ===================================================
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
echo Pressione Ctrl+C para encerrar o servidor
echo.

REM Usar 'call' para garantir que o script não termine imediatamente
call npm run dev

REM Adicionar pausa no final para manter a janela aberta em caso de erro
pause