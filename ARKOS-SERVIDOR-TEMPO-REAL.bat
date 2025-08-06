@echo off
title ARKOS - Servidor Tempo Real
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ARKOS LOGÍSTICA                           ║
echo ║                SERVIDOR TEMPO REAL                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Verificando conectividade de rede...
ping -n 1 8.8.8.8 >nul
if %errorlevel% equ 0 (
    echo ✓ Conectividade de rede OK
) else (
    echo ❌ Problema de conectividade
    echo Verifique sua conexão com a internet
    pause
    exit /b 1
)

echo.
echo Verificando arquivos essenciais...
if not exist "src\App.jsx" (
    echo ❌ App.jsx não encontrado
    echo Execute primeiro: limpeza-completa.bat
    pause
    exit /b 1
) else (
    echo ✓ App.jsx encontrado
)

if not exist "package.json" (
    echo ❌ package.json não encontrado
    pause
    exit /b 1
) else (
    echo ✓ package.json encontrado
)

echo.
echo Verificando dependências...
if not exist "node_modules" (
    echo ❌ node_modules não encontrado
    echo Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependências encontradas
)

echo.
echo Verificando arquivos de som...
if not exist "public\sounds\bip.mp3" (
    echo ⚠️  Arquivo bip.mp3 não encontrado
) else (
    echo ✓ Som de confirmação OK
)

if not exist "public\sounds\siren.mp3" (
    echo ⚠️  Arquivo siren.mp3 não encontrado
) else (
    echo ✓ Som de alerta OK
)

echo.
echo Verificando logo ARKOS...
if not exist "public\images\arkos_logo.svg" (
    echo ⚠️  Logo ARKOS não encontrada
) else (
    echo ✓ Logo ARKOS OK
)

echo.
echo ========================================
echo    INICIANDO SERVIDOR TEMPO REAL
echo ========================================
echo.

echo Configurando servidor para compartilhamento em tempo real...
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    INFORMAÇÕES DE ACESSO                     ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  🌐 URL Local: http://localhost:5175                        ║
echo ║  🌍 URL Rede: http://%COMPUTERNAME%:5175                    ║
echo ║  📱 Outros PCs: http://[SEU-IP]:5175                       ║
echo ║                                                              ║
echo ║  👤 Login Operador: karbox2025 / karstoq                   ║
echo ║  🔐 Login Admin: gerente2025 / quito123                    ║
echo ║  ⌨️  Painel Admin: Ctrl+Shift+A                            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Obtendo IP da rede...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    echo 🌍 Seu IP na rede: !IP!
    echo 📱 Outros PCs podem acessar: http://!IP!:5175
    goto :found_ip
)
:found_ip

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    COMPARTILHAMENTO TEMPO REAL              ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  ✅ Dados sincronizados em tempo real via Supabase          ║
echo ║  ✅ Atividades visíveis em todos os PCs                     ║
echo ║  ✅ Sons compartilhados entre dispositivos                  ║
echo ║  ✅ Calendário sincronizado                                 ║
echo ║  ✅ Relatórios em tempo real                                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Pressione qualquer tecla para iniciar o servidor...
pause >nul

echo.
echo 🚀 Iniciando servidor ARKOS em tempo real...
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    SERVIDOR ATIVO                            ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  ✅ Servidor rodando em: http://localhost:5175              ║
echo ║  ✅ Compartilhamento ativo                                  ║
echo ║  ✅ Sincronização em tempo real                             ║
echo ║  ✅ Outros PCs podem conectar                               ║
echo ║                                                              ║
echo ║  💡 Para parar: Pressione Ctrl+C                           ║
echo ║  💡 Para reiniciar: Execute este arquivo novamente         ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

npm run dev

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    SERVIDOR PARADO                           ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  ⚠️  Servidor foi encerrado                                 ║
echo ║  💡 Para reiniciar, execute este arquivo novamente         ║
echo ║  💡 Para limpeza, execute: limpeza-completa.bat            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause 