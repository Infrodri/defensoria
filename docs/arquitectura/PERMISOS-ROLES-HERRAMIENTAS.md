# 🔐 Permisos por Rol - Herramientas Phase 2

## 📋 MATRIZ DE ACCESO

### 🟢 ADMINISTRADOR (Total Access)
```
✅ TIENE ACCESO A TODO

Operación:
  ✅ Panel General
  ✅ Agenda y Citas
  ✅ Expedientes
  ✅ Inicio de caso
  ✅ Inspecciones
  ✅ Reportes GAM
  ✅ Balanceo de Equipo

Gestión Institucional:
  ✅ Personal & Permisos
  ✅ Oficinas y Distritos
  ✅ Auditoría Total

Sistema:
  ✅ Herramientas (puede usar y subir audio)
  ✅ Verificar Herramientas (panel admin con health checks)
  ✅ Configuración IA
  ✅ Base de Conocimiento
  ✅ Disciplinas
  ✅ Catálogos
  ✅ Mantenimiento
```

**URLs Disponibles:**
- `/tools-demo` → Subir audio y usar herramientas
- `/admin/tools-verification` → Panel de verificación y aprobación

---

### 🟡 JEFATURA (Management Access)
```
✅ Operación:
  ✅ Panel General
  ✅ Agenda y Citas
  ✅ Expedientes
  ✅ Inicio de caso
  ✅ Inspecciones
  ✅ Reportes GAM
  ✅ Balanceo de Equipo
  ✅ Auditoría

✅ Herramientas:
  ✅ Herramientas (acceso a /tools-demo)

❌ Sistema:
  ❌ Verificar Herramientas (solo admin)
  ❌ Configuración IA
  ❌ Base de Conocimiento
  ❌ Disciplinas
  ❌ Catálogos
  ❌ Mantenimiento
```

**URLs Disponibles:**
- `/tools-demo` → Subir audio y usar herramientas
- `/admin/tools-verification` → NO (Access Denied)

---

### 🔵 ABOGADO (Work Access)
```
✅ Panel General
✅ Agenda y Citas
✅ Mis Casos Asignados
✅ Herramientas Legales (/tools-demo - solo legal)
✅ Inspecciones
✅ Copiloto IA

❌ Expedientes (solo asignados)
❌ Ingesta
❌ Sistema
```

**URLs Disponibles:**
- `/tools-demo` → Subir audio, ver herramientas legales
- `/admin/tools-verification` → NO (Access Denied)

---

### 🟣 PSICOLOGO (Work Access)
```
✅ Panel General
✅ Agenda y Citas
✅ Mis Casos Asignados
✅ Herramientas Psicológicas (/tools-demo - solo psicológicas)
✅ Indicadores de Riesgo
✅ Copiloto IA

❌ Expedientes (solo asignados)
❌ Ingesta
❌ Sistema
```

**URLs Disponibles:**
- `/tools-demo` → Subir audio, ver herramientas psicológicas
- `/admin/tools-verification` → NO (Access Denied)

---

### 🟢 SOCIAL (Work Access)
```
✅ Panel General
✅ Agenda y Citas
✅ Mis Casos Asignados
✅ Herramientas Sociales (/tools-demo - solo sociales)
✅ Directorio Derivación
✅ Copiloto IA

❌ Expedientes (solo asignados)
❌ Ingesta
❌ Sistema
```

**URLs Disponibles:**
- `/tools-demo` → Subir audio, ver herramientas sociales
- `/admin/tools-verification` → NO (Access Denied)

---

### ⚪ SECRETARIA (Limited Access)
```
✅ Panel General
✅ Agenda y Citas
✅ Inicio de caso
✅ Inspecciones
✅ Expedientes (lectura)

❌ Herramientas
❌ Sistema
```

**URLs Disponibles:**
- `/tools-demo` → NO (Access Denied)
- `/admin/tools-verification` → NO (Access Denied)

---

### 👨‍⚖️ REFERENTE_TUTOR (Portal Only)
```
✅ Estado del Caso
✅ Mis Citas
✅ Portal del Tutor

❌ Todo lo demás
```

**URLs Disponibles:**
- `/tools-demo` → NO (Access Denied)
- `/admin/tools-verification` → NO (Access Denied)

---

## 📊 TABLA RESUMEN

| Rol | Panel | Herramientas | Verificar | Config IA | Auditoría |
|-----|-------|-------------|-----------|-----------|-----------|
| ADMINISTRADOR | ✅ | ✅ | ✅ | ✅ | ✅ |
| JEFATURA | ✅ | ✅ | ❌ | ❌ | ✅ |
| ABOGADO | ✅ | ✅ | ❌ | ❌ | ❌ |
| PSICOLOGO | ✅ | ✅ | ❌ | ❌ | ❌ |
| SOCIAL | ✅ | ✅ | ❌ | ❌ | ❌ |
| SECRETARIA | ✅ | ❌ | ❌ | ❌ | ❌ |
| REFERENTE_TUTOR | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔍 ¿CÓMO VERIFICAR PERMISOS?

### Para ADMINISTRADOR (debe ver TODO)
```
1. Loguea como: admin@defensoria.bo
2. Sidebar debe mostrar:
   - Operación (7 items)
   - Gestión Institucional (3 items)
   - Sistema (7 items, incluyendo "Herramientas" y "Verificar Herramientas")
3. Total: 17 items en sidebar
```

### Para JEFATURA (sin Sistema)
```
1. Loguea como: jefatura@defensoria.bo
2. Sidebar debe mostrar:
   - Herramientas
   - Auditoría
3. NO debe ver:
   - Verificar Herramientas
   - Configuración IA
   - Base de Conocimiento
```

### Para ABOGADO (solo trabajo)
```
1. Loguea como: abogado@defensoria.bo
2. Sidebar debe mostrar:
   - Panel General
   - Agenda y Citas
   - Mis Casos Asignados
   - Herramientas Legales
   - Inspecciones
   - Copiloto IA
3. Total: 6 items
```

---

## 🛡️ PROTECCIÓN EN BACKEND

### Endpoints Protegidos

**Transcripción (accesible a múltiples roles)**
```
POST /api/knowledge/transcribe
  Roles: ADMINISTRADOR, JEFATURA, ABOGADO, PSICOLOGO, SOCIAL
  Método: Role-based guard en NestJS
```

**Health Checks (solo admin)**
```
GET /api/tools-admin/health
  Roles: ADMINISTRADOR ONLY
  Método: @Roles(Role.ADMINISTRADOR) decorator
```

**Aprobación (solo admin)**
```
POST /api/tools-admin/approve
  Roles: ADMINISTRADOR ONLY
  Método: @Roles(Role.ADMINISTRADOR) decorator
```

---

## 🔒 PROTECCIÓN EN FRONTEND

### Pages Protegidas

**`/admin/tools-verification`**
```typescript
// Verifica rol ANTES de renderizar
if (!user || user.role !== Role.ADMINISTRADOR) {
  return <AccessDenied />
}
return <AdminToolsPanel />
```

**`/tools-demo`**
```
No tiene protección en cliente (acceso público)
Backend valida roles en endpoints
```

---

## ✅ RESUMEN

### ¿Qué tiene ADMINISTRADOR?
✅ Acceso a TODO  
✅ Puede subir audio y usar herramientas  
✅ Puede verificar status de servicios  
✅ Puede aprobar herramientas  
✅ Puede configurar IA, KB, disciplinas  

### ¿Qué tienen otros roles?
✅ Pueden subir audio y usar herramientas (si su rol lo permite)  
✅ NO pueden acceder al panel de admin  
✅ NO pueden aprobar herramientas  
✅ Acceso limitado a su rol específico  

### ¿Cómo se protege?
🔒 Rol-based guards en Backend (NestJS)  
🔒 Rol-based pages en Frontend (React)  
🔒 Tokens JWT con rol incluido  
🔒 Validación en cada endpoint  

---

## 🚀 TESTING

Para verificar que los permisos funcionan:

1. **Loguea como ADMINISTRADOR**
   - Debes ver: "Herramientas" + "Verificar Herramientas" en Sistema
   - Prueba acceder a `/admin/tools-verification` → Debe funcionar

2. **Loguea como JEFATURA**
   - Debes ver: "Herramientas" pero NO "Verificar Herramientas"
   - Prueba acceder a `/admin/tools-verification` → Debe ser Access Denied

3. **Loguea como ABOGADO**
   - Debes ver: "Herramientas Legales"
   - Prueba subir audio en `/tools-demo` → Debe funcionar

---

**Status**: ✅ ADMINISTRADOR TIENE ACCESO TOTAL
