@echo off
echo ========================================
echo    LIMPEZA COMPLETA DO SISTEMA ARKOS
echo ========================================
echo.

echo Removendo arquivos temporários e desnecessários...
if exist "temp_sounds" (
    rmdir /s /q "temp_sounds"
    echo ✓ Pasta temp_sounds removida
)

if exist "fixed_sounds" (
    rmdir /s /q "fixed_sounds"
    echo ✓ Pasta fixed_sounds removida
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cache do node_modules removido
)

echo.
echo Removendo arquivos de backup e logs...
if exist "*.bak" (
    del /q "*.bak"
    echo ✓ Arquivos .bak removidos
)

if exist "*.tmp" (
    del /q "*.tmp"
    echo ✓ Arquivos .tmp removidos
)

if exist "*.log" (
    del /q "*.log"
    echo ✓ Arquivos .log removidos
)

echo.
echo Removendo arquivos de desenvolvimento desnecessários...
if exist "*.map" (
    del /q "*.map"
    echo ✓ Arquivos .map removidos
)

if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Pasta dist removida
)

echo.
echo Limpando cache do navegador...
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rmdir /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache"
    echo ✓ Cache do Chrome limpo
)

if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" (
    rmdir /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache"
    echo ✓ Cache do Edge limpo
)

echo.
echo Verificando integridade dos arquivos essenciais...
if not exist "public\sounds\bip.mp3" (
    echo ❌ Arquivo bip.mp3 não encontrado
) else (
    echo ✓ Arquivo bip.mp3 encontrado
)

if not exist "public\sounds\siren.mp3" (
    echo ❌ Arquivo siren.mp3 não encontrado
) else (
    echo ✓ Arquivo siren.mp3 encontrado
)

if not exist "public\images\arkos_logo.svg" (
    echo ❌ Logo ARKOS não encontrada
) else (
    echo ✓ Logo ARKOS encontrada
)

echo.
echo Verificando componentes essenciais...
if not exist "src\App.jsx" (
    echo ❌ App.jsx não encontrado
) else (
    echo ✓ App.jsx encontrado
)

if not exist "src\components\Calendar.jsx" (
    echo ❌ Calendar.jsx não encontrado
) else (
    echo ✓ Calendar.jsx encontrado
)

if not exist "src\components\SoundTest.jsx" (
    echo ❌ SoundTest.jsx não encontrado
) else (
    echo ✓ SoundTest.jsx encontrado
)

echo.
echo Limpando dependências desnecessárias...
if exist "node_modules" (
    echo Removendo node_modules para reinstalação limpa...
    rmdir /s /q "node_modules"
    echo ✓ node_modules removido
)

echo.
echo Reinstalando dependências...
npm install
if %errorlevel% equ 0 (
    echo ✓ Dependências reinstaladas com sucesso
) else (
    echo ❌ Erro ao reinstalar dependências
)

echo.
echo ========================================
echo    LIMPEZA COMPLETA CONCLUÍDA
echo ========================================
echo.
echo O sistema foi completamente limpo!
echo Arquivos desnecessários foram removidos.
echo Dependências foram reinstaladas.
echo.
pause 