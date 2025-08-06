@echo off
title ARKOS - Sistema de Logística
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ARKOS LOGÍSTICA                           ║
echo ║                SISTEMA DE ROMANEIO                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Escolha uma opção:
echo.
echo [1] 🚀 Iniciar Servidor Tempo Real
echo [2] 🧹 Limpeza Completa do Sistema
echo [3] 🔧 Teste do Sistema
echo [4] 📊 Status do Sistema
echo [5] ❌ Sair
echo.

set /p choice="Digite sua escolha (1-5): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto cleanup
if "%choice%"=="3" goto test
if "%choice%"=="4" goto status
if "%choice%"=="5" goto exit
goto invalid

:start_server
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    INICIANDO SERVIDOR                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
call "ARKOS-SERVIDOR-TEMPO-REAL.bat"
goto menu

:cleanup
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    LIMPEZA DO SISTEMA                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
call "limpeza-completa.bat"
goto menu

:test
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    TESTE DO SISTEMA                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
call "teste-tempo-real.bat"
goto menu

:status
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    STATUS DO SISTEMA                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Verificando arquivos essenciais...
if exist "src\App.jsx" (
    echo ✓ App.jsx encontrado
) else (
    echo ❌ App.jsx não encontrado
)

if exist "package.json" (
    echo ✓ package.json encontrado
) else (
    echo ❌ package.json não encontrado
)

if exist "node_modules" (
    echo ✓ Dependências instaladas
) else (
    echo ❌ Dependências não encontradas
)

echo.
echo Verificando arquivos de som...
if exist "public\sounds\bip.mp3" (
    echo ✓ Som de confirmação OK
) else (
    echo ❌ Som de confirmação não encontrado
)

if exist "public\sounds\siren.mp3" (
    echo ✓ Som de alerta OK
) else (
    echo ❌ Som de alerta não encontrado
)

echo.
echo Verificando logo ARKOS...
if exist "public\images\arkos_logo.svg" (
    echo ✓ Logo ARKOS OK
) else (
    echo ❌ Logo ARKOS não encontrada
)

echo.
echo Verificando conectividade...
ping -n 1 8.8.8.8 >nul
if %errorlevel% equ 0 (
    echo ✓ Conectividade OK
) else (
    echo ❌ Problema de conectividade
)

echo.
echo Verificando porta do servidor...
netstat -an | findstr ":5175" >nul
if %errorlevel% equ 0 (
    echo ✓ Servidor ativo na porta 5175
) else (
    echo ❌ Servidor não encontrado na porta 5175
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    INFORMAÇÕES DE ACESSO                     ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  🌐 URL Local: http://localhost:5175                        ║
echo ║  👤 Login Operador: karbox2025 / karstoq                   ║
echo ║  🔐 Login Admin: gerente2025 / quito123                    ║
echo ║  ⌨️  Painel Admin: Ctrl+Shift+A                            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
goto menu

:invalid
echo.
echo ❌ Opção inválida! Digite um número de 1 a 5.
echo.
pause
goto menu

:menu
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ARKOS LOGÍSTICA                           ║
echo ║                SISTEMA DE ROMANEIO                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Escolha uma opção:
echo.
echo [1] 🚀 Iniciar Servidor Tempo Real
echo [2] 🧹 Limpeza Completa do Sistema
echo [3] 🔧 Teste do Sistema
echo [4] 📊 Status do Sistema
echo [5] ❌ Sair
echo.

set /p choice="Digite sua escolha (1-5): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto cleanup
if "%choice%"=="3" goto test
if "%choice%"=="4" goto status
if "%choice%"=="5" goto exit
goto invalid

:exit
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ENCERRANDO SISTEMA                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Obrigado por usar o Sistema ARKOS!
echo.
pause
exit 