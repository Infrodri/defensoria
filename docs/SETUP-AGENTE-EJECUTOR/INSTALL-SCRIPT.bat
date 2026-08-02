@echo off
echo ========================================
echo   SETUP AGENTE EJECUTOR - MCP TOOLS
echo ========================================

echo.
echo [1/7] Instalando uv (Python package manager)...
pip install uv
if %errorlevel% neq 0 (
    echo ERROR: Failed to install uv
    pause
    exit /b 1
)

echo.
echo [2/7] Instalando uvx (Universal eXecutable runner)...
uv tool install uvx
if %errorlevel% neq 0 (
    echo ERROR: Failed to install uvx
    pause
    exit /b 1
)

echo.
echo [3/7] Instalando File Manager MCP...
uvx install mcp-file-manager
echo Status: %errorlevel%

echo.
echo [4/7] Instalando Shell MCP...
uvx install mcp-shell  
echo Status: %errorlevel%

echo.
echo [5/7] Instalando Git MCP...
uvx install mcp-git
echo Status: %errorlevel%

echo.
echo [6/7] Instalando Web Search MCP...
uvx install mcp-web-search
echo Status: %errorlevel%

echo.
echo [7/7] Instalando Database MCPs...
uvx install postgres-mcp-server
uvx install typescript-mcp-server
uvx install prisma-mcp-server
echo Status: %errorlevel%

echo.
echo ========================================
echo   VERIFICANDO INSTALACION
echo ========================================
uvx list

echo.
echo ========================================
echo   SETUP COMPLETADO
echo ========================================
echo.
echo Siguiente paso:
echo 1. Copiar MCP-CONFIG-TEMPLATE.json a tu .kiro/settings/mcp.json
echo 2. Ajustar paths si es necesario
echo 3. Reiniciar tu agente/IDE
echo 4. Verificar que MCPs aparezcan disponibles
echo.
pause