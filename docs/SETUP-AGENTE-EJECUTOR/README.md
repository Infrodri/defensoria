# 🤖 SETUP AGENTE EJECUTOR - Skills & MCP

## 🎯 OBJETIVO
Configurar un agente con las mismas capacidades que Kiro para ejecutar las instrucciones de testing y desarrollo.

## 📋 SKILLS REQUERIDAS (FREE)

### 1. **File Operations**
**Qué necesita**: Leer, escribir, editar archivos
**MCP**: `file-manager`
```bash
# Instalar con uvx
uvx install mcp-file-manager
```
**GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem

### 2. **Code Execution & Terminal**
**Qué necesita**: Ejecutar comandos, compilar, testing
**MCP**: `shell-execution`
```bash
# Instalar con uvx
uvx install mcp-shell
```
**GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/shell

### 3. **Git Operations**
**Qué necesita**: Git add, commit, push, diff
**MCP**: `git-operations`
```bash
# Instalar con uvx
uvx install mcp-git
```
**GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/git

### 4. **Web Search & Documentation**
**Qué necesita**: Buscar soluciones, documentación técnica
**MCP**: `web-search`
```bash
# Instalar con uvx
uvx install mcp-web-search
```
**GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/web-search

### 5. **Database Operations** 
**Qué necesita**: Conectar PostgreSQL, ejecutar queries
**MCP**: `postgres-mcp`
```bash
# Instalar con uvx
uvx install postgres-mcp-server
```
**GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/postgres

## 🔧 CONFIGURACIÓN MCP.JSON

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-file-manager"],
      "env": {
        "ALLOWED_DIRECTORIES": "c:\\dev\\defensoria"
      }
    },
    "shell": {
      "command": "uvx", 
      "args": ["mcp-shell"],
      "env": {
        "SHELL_RESTRICT_COMMANDS": "false",
        "ALLOWED_COMMANDS": "*"
      }
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-git"],
      "env": {
        "GIT_REPOSITORY_PATH": "c:\\dev\\defensoria"
      }
    },
    "web-search": {
      "command": "uvx",
      "args": ["mcp-web-search"],
      "env": {
        "SEARCH_ENGINE": "duckduckgo"
      }
    },
    "postgres": {
      "command": "uvx",
      "args": ["postgres-mcp-server"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/defensoria"
      }
    }
  }
}
```

## 📚 SKILLS DE DESARROLLO

### 6. **TypeScript/JavaScript**
**Qué necesita**: Entender y modificar código TS/JS
**Skill Built-in**: La mayoría de LLMs ya tienen esto
**Backup MCP**: `typescript-analyzer`
```bash
uvx install typescript-mcp-server
```

### 7. **NestJS/React**
**Qué necesita**: Frameworks específicos
**Skill Built-in**: Incluido en modelos modernos
**Documentación**: Acceso via web-search MCP

### 8. **Prisma ORM**
**Qué necesita**: Entender schemas, migrations
**MCP**: `prisma-mcp`
```bash
uvx install prisma-mcp-server
```
**GitHub**: https://github.com/prisma/prisma-mcp

## 🗂️ CONTEXT FILES REQUERIDOS

El agente debe tener acceso a:

### Proyecto Context
```
c:\dev\defensoria\
├── apps\api\               (Backend NestJS)
├── apps\web\               (Frontend Next.js)  
├── packages\db\            (Prisma schemas)
├── INSTRUCCIONES-AGENTE-TESTING\  (Mis instrucciones)
└── GUIAS-USUARIO-HERRAMIENTAS\    (User guides)
```

### Documentation Context
```
c:\dev\defensoria\docs\
├── ARQUITECTURA-HERRAMIENTAS-PROFESIONALES.md
├── API-ENDPOINTS.md
├── ROLES-PERMISSIONS.md
└── *.md (todos los docs técnicos)
```

## 🚀 INSTALACIÓN PASO A PASO

### Pre-requisitos
```bash
# 1. Instalar Python & uv
pip install uv

# 2. Instalar uvx
uv tool install uvx
```

### Instalar MCPs
```bash
# Core file operations
uvx install mcp-file-manager
uvx install mcp-shell  
uvx install mcp-git

# Development tools
uvx install typescript-mcp-server
uvx install prisma-mcp-server
uvx install postgres-mcp-server

# Optional but recommended
uvx install mcp-web-search
```

### Verificar Instalación
```bash
uvx list
# Debe mostrar todos los MCPs instalados
```

## 🎯 MODELO RECOMENDADO

### Para Desarrollo Complejo
**Claude 3.5 Sonnet** (via Anthropic API)
- Excelente con TypeScript/NestJS/React
- Muy bueno siguiendo instrucciones detalladas
- Maneja contexto grande (200k tokens)

### Alternativa Open Source
**Qwen2.5-Coder-32B** (local con Ollama)
```bash
ollama pull qwen2.5-coder:32b
```
- Especializado en código
- Funciona completamente local
- Muy bueno con JavaScript/TypeScript

### Alternativa Comercial Económica
**GPT-4 Turbo** (via OpenAI API)
- Buen balance precio/performance
- Excelente seguimiento de instrucciones
- Integración fácil

## 📋 VERIFICACIÓN DE SETUP

### Test 1: File Operations
```
Agente debe poder:
✅ Leer archivos TypeScript
✅ Modificar código
✅ Crear nuevos archivos
```

### Test 2: Terminal Operations  
```
Agente debe poder:
✅ npm run build
✅ npx tsc --noEmit
✅ git add/commit
```

### Test 3: Database Operations
```
Agente debe poder:
✅ Conectar a PostgreSQL
✅ Ejecutar queries
✅ Ver schemas Prisma
```

### Test 4: Context Understanding
```
Agente debe entender:
✅ Estructura del proyecto
✅ Arquitectura NestJS/React
✅ Roles y permisos
✅ Flujo de herramientas
```

## 🔒 SECURITY NOTES

### Permisos Recomendados
```json
{
  "filesystem": {
    "allowed_paths": ["c:\\dev\\defensoria"],
    "read_only": false
  },
  "shell": {
    "allowed_commands": ["npm", "npx", "git", "node"],
    "dangerous_commands_blocked": ["rm -rf", "del /s", "format"]
  },
  "database": {
    "read_write": true,
    "production_blocked": true
  }
}
```

## 📞 TROUBLESHOOTING

### Error: "uvx command not found"
```bash
# Agregar a PATH
export PATH="$HOME/.local/bin:$PATH"  # Linux/Mac
# O configurar en Windows PATH
```

### Error: "MCP server connection failed" 
```bash
# Verificar instalación
uvx list
uvx reinstall [mcp-name]
```

### Error: "Permission denied"
```bash
# Verificar permisos de directorio
chmod +x ~/.local/bin/uvx  # Linux/Mac
# O ejecutar como administrador en Windows
```

---

**Una vez instalado todo esto, el agente tendrá las mismas capacidades que yo para:**
- ✅ Leer y modificar código
- ✅ Ejecutar tests y compilaciones  
- ✅ Hacer commits git
- ✅ Buscar documentación
- ✅ Conectar a base de datos
- ✅ Seguir instrucciones técnicas detalladas