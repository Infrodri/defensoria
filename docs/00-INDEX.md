# Índice de Documentación - Sistema DNA

**Para Agentes IA**: Este es el punto de entrada principal. Lea este documento primero para entender la estructura y saber qué leer según la tarea.

---

## 🎯 Lectura por Objetivo

### Si eres un Agente IA nuevo en el proyecto
1. **PRIMERO**: Lee [01-CONTEXTO-PROYECTO.md](01-CONTEXTO-PROYECTO.md) - 5 min
2. **SEGUNDO**: Lee [02-ARQUITECTURA-RESUMEN.md](02-ARQUITECTURA-RESUMEN.md) - 10 min
3. **DESPUÉS**: Según la tarea, ve a la sección específica abajo

### Si necesitas entender RAG/IA
→ Ve a [rag/00-RAG-INDEX.md](rag/00-RAG-INDEX.md)

### Si necesitas entender el modelo de datos
→ Ve a [data-model/schema-v0.md](data-model/schema-v0.md)

### Si necesitas entender seguridad/RBAC
→ Ve a [security/access-control.md](security/access-control.md)

### Si necesitas ver la API
→ Ve a [api/](api/)

### Si necesitas decisiones arquitectónicas
→ Ve a [architecture/](architecture/)

---

## 📂 Estructura de Documentación

```
docs/
├── 00-INDEX.md                           ← TÚ ESTÁS AQUÍ (punto de entrada)
├── 01-CONTEXTO-PROYECTO.md               ← Contexto general del proyecto
├── 02-ARQUITECTURA-RESUMEN.md            ← Resumen técnico
│
├── ROLES-Y-PERMISOS-RESUMEN.md           ← ⭐ EMPIEZA AQUÍ para roles/permisos
├── INSTRUCCIONES-AGENTES-v2.md           ← ⭐ Instrucciones detalladas (COMPLETO)
├── VERIFICACION-SINCRONIZACION.md        ← ⭐ Checklist de validación
│
├── master-spec.md                        ← Especificación canónica completa
├── admin-master-plan.md                  ← Plan maestro administrador
├── system-overview.md                    ← Visión general del sistema
├── known-risks.md                        ← Riesgos conocidos
│
├── rag/                                  ← Sistema RAG (TODO sobre IA)
│   ├── 00-RAG-INDEX.md                   ← Índice RAG (leer primero)
│   ├── 01-RAG-OVERVIEW.md                ← Resumen RAG
│   ├── architecture/                     ← Decisiones técnicas RAG
│   ├── guides/                           ← Guías de usuario RAG
│   ├── examples/                         ← Ejemplos de documentos
│   ├── testing/                          ← Tests RAG
│   └── implementation/                   ← Detalles código RAG
│
├── architecture/                         ← ADRs (decisiones arquitectónicas)
│   ├── ADR-001-foundation.md
│   ├── ADR-023-ia-local-soberana.md
│   ├── ADR-024-rag-ingestion-strategy.md
│   └── ADR-025-pdf-to-markdown-strategy.md
│
├── data-model/                           ← Esquemas de base de datos
│   └── schema-v0.md
│
├── security/                             ← Seguridad y RBAC
│   └── access-control.md
│
├── api/                                  ← Documentación API REST
├── legal/                                ← Marco legal boliviano
└── roadmap/                              ← Fases del proyecto
```

---

## 🚀 Flujos Comunes para Agentes IA

### Flujo 0: "Necesito entender roles y permisos" (PRIMERO)
```
1. docs/ROLES-Y-PERMISOS-RESUMEN.md       (5 min)    ← EMPIEZA AQUÍ
2. docs/INSTRUCCIONES-AGENTES-v2.md       (15 min)   ← Detalles técnicos
3. docs/VERIFICACION-SINCRONIZACION.md    (10 min)   ← Validación
```
**Resultado**: Entenderás qué rol hace qué, cómo se sincroniza todo.

### Flujo 1: "Necesito entender qué hace este sistema"
```
1. docs/01-CONTEXTO-PROYECTO.md          (5 min)
2. docs/02-ARQUITECTURA-RESUMEN.md       (10 min)
3. docs/data-model/schema-v0.md          (15 min)
```
**Resultado**: Entenderás el propósito, stack y estructura de datos.

### Flujo 2: "Necesito implementar algo relacionado con RAG"
```
1. docs/rag/00-RAG-INDEX.md              (2 min)
2. docs/rag/01-RAG-OVERVIEW.md           (5 min)
3. docs/rag/architecture/chunking-strategy.md  (10 min)
4. docs/rag/implementation/chunking-implementation.md  (20 min)
```
**Resultado**: Entenderás la arquitectura RAG y cómo está implementada.

### Flujo 3: "Necesito entender los permisos/RBAC"
```
1. docs/security/access-control.md       (10 min)
2. docs/architecture/ADR-001-foundation.md  (buscar sección RBAC)
3. apps/api/src/common/guards/           (revisar código)
```
**Resultado**: Entenderás el modelo de seguridad completo.

### Flujo 4: "Necesito modificar un módulo existente"
```
1. docs/01-CONTEXTO-PROYECTO.md          (contexto)
2. docs/data-model/schema-v0.md          (buscar tablas relevantes)
3. apps/api/src/modules/[modulo]/        (revisar código)
```
**Resultado**: Tendrás contexto suficiente para modificar con seguridad.

---

## 📖 Documentos por Audiencia

### Para Desarrolladores Backend
- [02-ARQUITECTURA-RESUMEN.md](02-ARQUITECTURA-RESUMEN.md)
- [data-model/schema-v0.md](data-model/schema-v0.md)
- [architecture/ADR-001-foundation.md](architecture/ADR-001-foundation.md)
- [rag/implementation/](rag/implementation/)

### Para Desarrolladores Frontend
- [01-CONTEXTO-PROYECTO.md](01-CONTEXTO-PROYECTO.md)
- [api/](api/) - Endpoints disponibles
- [security/access-control.md](security/access-control.md) - RBAC

### Para Ingenieros de IA/ML
- [rag/00-RAG-INDEX.md](rag/00-RAG-INDEX.md) - TODO sobre RAG
- [architecture/ADR-023-ia-local-soberana.md](architecture/ADR-023-ia-local-soberana.md)

### Para Administradores/Usuarios
- [rag/guides/](rag/guides/) - Guías de uso
- [rag/examples/](rag/examples/) - Ejemplos prácticos

---

## 🔍 Búsqueda Rápida por Tema

| Tema | Documento |
|------|-----------|
| **Roles y permisos (START HERE)** | [ROLES-Y-PERMISOS-RESUMEN.md](ROLES-Y-PERMISOS-RESUMEN.md) |
| **Instrucciones completas para agentes** | [INSTRUCCIONES-AGENTES-v2.md](INSTRUCCIONES-AGENTES-v2.md) |
| **Validación de sincronización** | [VERIFICACION-SINCRONIZACION.md](VERIFICACION-SINCRONIZACION.md) |
| Stack tecnológico | [01-CONTEXTO-PROYECTO.md](01-CONTEXTO-PROYECTO.md) |
| Base de datos | [data-model/schema-v0.md](data-model/schema-v0.md) |
| Autenticación | [architecture/ADR-001-foundation.md](architecture/ADR-001-foundation.md#adr-009) |
| RBAC | [security/access-control.md](security/access-control.md) |
| RAG/IA | [rag/00-RAG-INDEX.md](rag/00-RAG-INDEX.md) |
| Chunking | [rag/architecture/chunking-strategy.md](rag/architecture/chunking-strategy.md) |
| API | [api/](api/) |
| Riesgos | [known-risks.md](known-risks.md) |
| Roadmap | [roadmap/](roadmap/) |

---

## ⚠️ Importante para Agentes IA

### Jerarquía de Fuentes de Verdad
1. **Código fuente** (apps/) - La realidad actual
2. **Documentos de implementación** (rag/implementation/, etc.) - Cómo funciona
3. **ADRs** (architecture/) - Por qué se decidió así
4. **Especificaciones** (master-spec.md) - La visión original

Si hay contradicción, el código fuente gana.

### Antes de Modificar Código
1. Lee el contexto del proyecto (01-CONTEXTO-PROYECTO.md)
2. Revisa el modelo de datos si afecta DB
3. Consulta ADRs relevantes
4. Verifica RBAC si afecta permisos

### Convenciones de Naming
- Archivos: `kebab-case.md`
- Componentes: `PascalCase.tsx`
- Variables: `camelCase`
- Rutas: español + `kebab-case`

---

## 📝 Actualización de Documentación

Si modificas código significativamente:
1. Actualiza el documento de implementación correspondiente
2. Si cambias arquitectura, considera crear un ADR
3. Mantén el índice actualizado

---

**Última actualización**: 2026-08-01  
**Versión**: 1.0.0
