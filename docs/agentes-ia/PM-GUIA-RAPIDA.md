# GUÍA RÁPIDA PM — DELEGACIÓN A AGENTES IA

**Para**: Project Managers nuevos  
**Duración lectura**: 10 minutos  
**Propósito**: Entender cómo delegar tareas a agentes especializados sin quedarse sin contexto

---

## 📚 ESTRUCTURA DE DOCUMENTOS

```
PM usa:
├── PM-DELEGACION-AGENTES-IA.md        ← Guía completa (LEE PRIMERO)
│   └── Estructura, formato TPV, checklist, métricas, troubleshooting
│
├── MATRIZ-DELEGACIONES-FASE2.md       ← Tablero de control
│   └── Tracking semanal, dependencias, status de cada agente
│
├── PLANTILLAS-DELEGACION-TPV.md       ← Templates copy-paste
│   └── Delegaciones reales para cada módulo (copiar, ajustar, enviar)
│
├── PM-GUIA-RAPIDA.md                  ← ESTE ARCHIVO
│   └── Checklists + flows + quick ref
│
└── ARQUITECTURA-FINAL-COMPLETA.md     ← Para entender qué se construye
    └── Contexto, módulos, endpoints, tablas
```

---

## 🚀 FLUJO DE DELEGACIÓN EN 5 PASOS

### Paso 1: Preparar (30 min)
```
Checklist antes de delegar a un agente:

Schema:
  ✅ Nuevas tablas en schema.prisma
  ✅ Migraciones ejecutadas (npx prisma migrate dev)
  
Repo:
  ✅ Rama Git creada (feature/[nombre])
  ✅ Carpeta destino vacía (apps/api/src/modules/[nuevo]/)
  
Docs:
  ✅ ARQUITECTURA-FINAL-COMPLETA.md disponible
  ✅ agentes-ia/INSTRUCCIONES-AGENTES.md disponible
  ✅ Este módulo está documentado ahí
  
Credenciales:
  ✅ Usuario: [rol]@defensoria.gob.bo | Password: Password123!
  ✅ DB: localhost, usuario=dev, password=***
  ✅ Ollama: http://localhost:11434 (verificar que funciona)
  
Tests:
  ✅ Seed.ts crea datos de prueba para este módulo
  ✅ Fixtures disponibles (referencia)
```

### Paso 2: Plantilla TPV (15 min)
```
Abrir: PLANTILLAS-DELEGACION-TPV.md
Copiar: Plantilla para el módulo específico
Editar: Reemplazar [VARIABLES] en corchetes
Enviar: Al agente por Slack + email

Ejemplo:
- [NUM] → 1, 2, 3, etc.
- [NOMBRE MÓDULO] → Legal Tools, Psych Tools, etc.
- [N endpoints] → 3, 4, etc.
- [tests count] → 15, 20, etc.
```

### Paso 3: Briefing (20 min)
```
Agente recibe:
1. TPV task (formato Task-Preconditions-Validation)
2. Link a ARQUITECTURA-FINAL-COMPLETA.md
3. Link a agentes-ia/INSTRUCCIONES-AGENTES.md
4. Credenciales (DB, git, Ollama)
5. Link a código de referencia (Fase 1 modules)
6. Slack channel #phase-2 + teléfono PM si urgente

PM dice:
"Hola [Agente], te delegamos [MODULO].

La tarea está en el formato TPV abajo.
Cualquier pregunta/bloqueador → escribe en #phase-2 o dame call.
Check-in cada 2 horas: dime % de progreso.

¿Questions antes de empezar?
[TPV task]"
```

### Paso 4: Monitoreo (Continuo)
```
Check-in cada 2 horas:
  "¿Cómo va [MODULO]? ¿% de progreso?"
  Agente responde: "50%, en DTOs ahora"

Si bloqueador:
  Agente: "Bloqueado 30 min en schema Prisma"
  PM: Resuelve en < 30 min o escala a Tech Lead

Si no reporta en 2 horas:
  PM pinga: "¿Status? ¿Bloqueado?"
```

### Paso 5: Validación + Merge (1 hora)
```
Agente reporta: "LISTO - PR #XX"

PM checklist rápido:
  ✅ npx tsc --noEmit → 0 errores
  ✅ npm run test → N tests PASS
  ✅ Swagger → N endpoints documentados
  ✅ Manual curl test → 200 OK
  ✅ PR code review OK (no cambios pedidos)

Merge:
  git pull origin feature/[nombre]
  git merge --no-ff feature/[nombre]
  git push origin develop
  
Comunicar:
  "✅ Merged [MODULO] a develop.
   Próxima tarea: [DELEGACIÓN #X]"
```

---

## 📊 MÉTRICAS DIARIAS PM

### Tablero Control Semanal (Actualizar diariamente)

```
FASE 2 PROGRESO:

Lunes:
  Backend-Legal: 0% ████░░░░░░
  Backend-Psych: 0% ████░░░░░░
  TOTAL: 0% (0/11 módulos)

Martes:
  Backend-Legal: 50% ████████░░ (Agente: Backend-Legal)
  Backend-Psych: 30% ██████░░░░ (Agente: Backend-Psych)
  TOTAL: 15% (2/13 milestones)

Miércoles:
  Backend-Legal: 100% ██████████ ✅
  Backend-Psych: 80% ████████░░
  Frontend-Legal: 30% ██████░░░░ (Agente: Frontend-Legal)
  TOTAL: 35% (5/14 milestones)

...

Viernes:
  TOTAL: 100% ✅✅✅ (11/11 módulos DONE)
```

---

## 🔴 SOS: PROBLEMAS COMUNES Y SOLUCIONES

### Problema: "Agente reporta: TypeScript error TS2339"

**Diagnosis** (< 5 min):
```bash
# 1. ¿Schema Prisma actualizado?
git diff packages/db/prisma/schema.prisma | grep -E "^+"

# 2. ¿Migration ejecutada?
npx prisma migrate status

# 3. ¿Caché de TS limpio?
rm -rf apps/api/dist node_modules/.cache
npx prisma generate
npx tsc --noEmit
```

**Acción**:
- Si schema falta tablas: actualizar + ejecutar migrate
- Si migration pending: agente ejecuta `npx prisma migrate dev`
- Si caché: limpiar y recompilar

---

### Problema: "Agente reporta: Jest 0 tests matched"

**Diagnosis**:
```bash
# 1. ¿Archivo .spec.ts existe?
ls -la apps/api/src/modules/[modulo]/[modulo].service.spec.ts

# 2. ¿Tiene describe() y it()?
grep "describe\|it(" apps/api/src/modules/[modulo]/[modulo].service.spec.ts

# 3. ¿Jest puede compilar?
npm run test -- --listTests | grep [modulo]
```

**Acción**:
- Agente revisa que hay describe() y it() en el archivo
- Recompilar: `npx tsc --noEmit`
- Ejecutar verbose: `npm run test -- [spec] --verbose`

---

### Problema: "Agente reporta: Swagger no muestra endpoint"

**Diagnosis**:
```bash
# 1. ¿Módulo importado en app.module.ts?
grep "[ModuleName]Module" apps/api/src/app.module.ts

# 2. ¿Compilar sin errores?
npx tsc --noEmit

# 3. ¿Dev server reiniciado?
# (Si lleva > 2 min sin reiniciar)
```

**Acción**:
- Si módulo no está en app.module.ts: importar y agregar a @Module({ imports: [...] })
- Reiniciar dev server: `npm run start:dev`
- Ir a http://localhost:4000/api/docs y refrescar

---

### Problema: "Agente bloqueado > 1 hora"

**PM acción inmediata**:
```
1. Call al agente (no chat): "¿Qué pasó?"
2. Escuchar 5 min
3. Si es tema técnico → call a Tech Lead
4. Tech Lead + Agente resuelven en screen share
5. PM recibe update: "Ahora en [tarea]"
```

---

## 📋 CHECKPOINTS DIARIOS PM

### Lunes (Día 1)
```
09:00 - Reunión Kickoff
  - Presente: PM, 6 agentes, Tech Lead
  - Duración: 30 min
  - Temas:
    ✅ Agenda de fase 2
    ✅ Delegaciones asignadas
    ✅ Credenciales compartidas
    ✅ Preguntas generales

10:00 - Status Check 1
  - ¿Todos tienen acceso a DB/Ollama?
  - ¿Ramas Git creadas?
  - ¿Algún bloqueador inicial?

14:00 - Status Check 2
  - Backend-Legal: ¿DTOs creados?
  - Backend-Psych: ¿Setup hecho?
  - Otros: ¿En track?
```

### Martes-Viernes (Días 2-5)
```
09:00 - Standup (15 min, todos en chat)
  Agentes reportan: "Hoy hago X, bloqueador Y"

Cada 2 horas - Status Check
  PM: "¿Status?" Agentes responden %

14:00 - Mid-day Checkpoint (30 min, opcional)
  Revisar si hay bloqueadores críticos

17:00 - EOD Status
  Agentes: "Fin del día: Z% completado"
  PM: Actualiza MATRIZ-DELEGACIONES-FASE2.md
```

---

## ⚡ QUICK COMMANDS PM

```bash
# Ver estado de ramas
git branch -a | grep feature/

# Ver qué cambió en cada rama
git diff develop..feature/legal-tools

# Pull + test rápido en rama de agente
git fetch origin && \
git checkout feature/legal-tools && \
npm run test -- legal-tools.service.spec.ts

# Revisar coverage
npm run test:cov -- legal-tools

# Hacer merge local (sin push)
git merge --no-ff feature/legal-tools --no-commit

# Ver PRs abiertas en GitHub
gh pr list --base develop

# Aprobar PR
gh pr review [PR_NUMBER] --approve

# Mergear PR
gh pr merge [PR_NUMBER] --merge --delete-branch
```

---

## 📞 ESCALACIÓN RÁPIDA

```
PROBLEMA                        CONTACTO          TIEMPO RESPUESTA
─────────────────────────────────────────────────────────────────
TypeScript error                Tech Lead + Agente   5 min
Jest test fails                 Tech Lead           10 min
DB migration issue              DevOps              15 min
Ollama no responde              DevOps              30 min
Conflicto de merge              Tech Lead           20 min
Performance problema            Tech Lead + DevOps   1 hora
Bloqueador crítico              CTO                 < 2 horas
```

---

## 🎯 DEFINICIONES DE LISTO

### Módulo Backend = LISTO cuando:
- ✅ `npx tsc --noEmit` → 0 errores
- ✅ `npm run test` → N tests PASS (>80% coverage)
- ✅ Swagger muestra N endpoints documentados
- ✅ Happy path API call → 200 OK
- ✅ Error path API call → 4xx con mensaje
- ✅ PR aprobada (sin "cambios requeridos")
- ✅ Merged a `develop`

### Módulo Frontend = LISTO cuando:
- ✅ `npx tsc --noEmit --skipLibCheck` → 0 errores
- ✅ Rutas accesibles y cargan sin error
- ✅ Guard por rol validado (logout → redirige)
- ✅ Datos cargan desde API
- ✅ Loading + error states visibles
- ✅ Responsive: mobile + desktop
- ✅ Lighthouse Performance > 80
- ✅ Tests PASS

### QA Testing = LISTO cuando:
- ✅ 40+ integration tests PASS
- ✅ 15+ E2E tests PASS
- ✅ Coverage >= 80%
- ✅ Performance baseline registrado
- ✅ No regressions (Fase 1 tests PASS)
- ✅ PR aprobada
- ✅ Merged a `develop`

---

## 🚨 RED FLAGS (Escalación inmediata)

```
🔴 ROJO - ESCALAR YA
├─ Agente no reporta status por 2+ horas
├─ Bloqueador > 3 horas sin resolver
├─ TypeScript errors que crecen (era 5, ahora 20)
├─ Tests que antes pasaban ahora fallan
├─ DB corrupta o migraciones conflictivas
├─ Ollama cae y no reinicia
└─ Performance: API responde > 2000ms

🟠 NARANJA - MONITOREAR
├─ Agente reporta 0% progreso en 4 horas
├─ Bloqueador 1-3 horas
├─ 1-2 tests fallando (intermitente)
├─ Performance: 500-2000ms
├─ 1 error TypeScript nuevo
└─ PR pendiente de revisión > 1 hora

🟡 AMARILLO - OBSERVAR
├─ Agente reporta 30% (en track)
├─ Preguntas técnicas (no bloqueador)
├─ Performance: 300-500ms
├─ Pequeño comentario en PR (no bloqueador)
└─ Merge conflict fácil de resolver
```

---

## 📈 ÉXITO DE FASE 2

**Criterios de éxito PM**:

| Métrica | Target | Validar |
|---------|--------|---------|
| Delegaciones on-time | 100% (11/11) | Cada módulo listado tiene fecha entrega |
| Quality (tests PASS) | 100% | npm run test → todos PASS |
| Code review time | < 1 hora | PR no lleva > 60 min en review |
| Bloqueadores resueltos | < 2 horas | Ninguno tarda > 120 min |
| Team satisfaction | > 80% | Post-retrospective survey |
| Performance baseline | < 500ms | Todos endpoints |
| Coverage | >= 80% | npm run test:cov |

**PM entrega al CTO**:
- ✅ 11/11 módulos completados
- ✅ 12 endpoints funcionales
- ✅ 11 tablas en DB
- ✅ 60+ tests pasando
- ✅ Documentación actualizada
- ✅ Release branch `release/fase-2` lista
- ✅ Changelog escrito

---

## 📚 LECTURA RECOMENDADA

**Para PM nuevo (orden)**:
1. **Este archivo** (5 min) ← TE ESTÁS AQUÍ
2. ARQUITECTURA-FINAL-COMPLETA.md (15 min) — entiende qué se construye
3. agentes-ia/INSTRUCCIONES-AGENTES.md (20 min) — permisos y roles técnicos
4. PM-DELEGACION-AGENTES-IA.md (30 min) — guía completa
5. PLANTILLAS-DELEGACION-TPV.md (10 min) — cómo delegar
6. MATRIZ-DELEGACIONES-FASE2.md (10 min) — tracking

**Total**: 90 minutos para estar ready

---

## 🆘 CONTACTOS DE EMERGENCIA

```
Tech Lead:      [Slack: @tech-lead] | [Teléfono: 555-XXXX]
DevOps:         [Slack: @devops] | [Teléfono: 555-XXXX]
CTO/Arquitecto: [Slack: @cto] | [Teléfono: 555-XXXX]
PM On-Duty:     [Este documento]
```

---

**Versión**: 1.0  
**Última actualización**: 2026-08-01  
**Próxima revisión**: Post-Fase 2


