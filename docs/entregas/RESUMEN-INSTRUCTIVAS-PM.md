# RESUMEN EJECUTIVO: INSTRUCTIVAS PARA PROJECT MANAGER

**Proyecto**: Sistema DNA Sucre  
**Fase**: 2 (Implementación de 11 módulos especializados)  
**Audiencia**: Project Manager (Orquestador)  
**Tiempo de lectura**: 5 minutos  
**Propósito**: Entender qué delegaciones harás esta semana

---

## 🎯 EN UNA FRASE

**Delegarás 11 módulos a 6 agentes especializados en paralelo, usando formato TPV, y los monitorizarás diariamente hasta completar Fase 2.**

---

## 📦 QUÉ ENTREGAS OBTENDRÁS

| Qué | Cuándo | De quién | Cómo validas |
|-----|--------|----------|-------------|
| **12 endpoints REST** | Viernes | 4 agentes backend | Swagger + curl |
| **11 tablas nuevas en BD** | Viernes | Agentes + schema | `npx prisma studio` |
| **60+ tests PASS** | Viernes | Agentes | `npm run test` |
| **8-10 nuevas páginas React** | Viernes | 3 agentes frontend | Navegador |
| **40+ integration tests** | Viernes | 1 agente QA | `npm run test:e2e` |
| **PR documentadas** | Viernes | Todos | GitHub review |
| **Código mergeado a develop** | Viernes | PM (después de validar) | Git log |

---

## 👥 AGENTES QUE TRABAJAN PARA TI

```
BACKEND (4 agentes):
  ├─ Backend-Legal (8 horas) → 3 endpoints jurídicos
  ├─ Backend-Psych (10 horas) → 4 endpoints psicológicos
  ├─ Backend-Social (8 horas) → 3 endpoints sociales
  └─ Backend-Transversal (6 horas) → 2 endpoints transversales

FRONTEND (3 agentes):
  ├─ Frontend-Legal (5 horas) → 2 páginas legales
  ├─ Frontend-Psych (5 horas) → 2 páginas psicológicas
  └─ Frontend-Social (5 horas) → 2 páginas sociales

QA (1 agente):
  └─ QA-Integration (8 horas) → 40+ tests

TOTAL: 6 agentes, 77 horas, 5 días de duración real (paralelo)
```

---

## 📋 LOS 4 DOCUMENTOS QUE USARÁS

### 1. **PM-DELEGACION-AGENTES-IA.md** (LEE ESTO PRIMERO)
- ✅ Estructura de delegación
- ✅ Formato TPV explicado
- ✅ Checklist de validación
- ✅ Ejemplos de delegaciones reales
- ✅ Matriz de riesgos
- ✅ Troubleshooting de problemas comunes

**Uso**: Tu guía de referencia (léela + marca en favoritos)

---

### 2. **MATRIZ-DELEGACIONES-FASE2.md** (ACTUALIZA DIARIAMENTE)
- ✅ Matriz de 6 agentes × 11 módulos
- ✅ Timelines: lunes a viernes
- ✅ Dependencias entre tareas
- ✅ Tracker de progreso

**Uso**: Tu tablero de control + status meetings

---

### 3. **PLANTILLAS-DELEGACION-TPV.md** (COPIAR Y PEGAR)
- ✅ 3 plantillas TPV listas para usar
- ✅ Legal Tools, Psych Tools, QA Testing (como ejemplos)
- ✅ Instrucciones "copiar, reemplazar [VARIABLES], enviar"

**Uso**: Cuando delegas a un agente (copy-paste + edit)

---

### 4. **PM-GUIA-RAPIDA.md** (CUANDO NECESITAS RESPUESTAS RÁPIDAS)
- ✅ Flujo de delegación en 5 pasos
- ✅ Checklist diario de PM
- ✅ Quick commands (git, npm, etc.)
- ✅ SOS: problemas comunes

**Uso**: Cuando hay una emergencia o necesitas refresh rápido

---

## 🚀 TUS RESPONSABILIDADES ESTA SEMANA

### Antes de Fase 2 (Lunes 08:00)

```
PREPARACIÓN (máximo 1 hora):
  ☐ Schema Prisma finalizado (11 tablas nuevas)
  ☐ Migraciones ejecutadas: npx prisma migrate dev
  ☐ 6 ramas Git creadas: feature/legal-tools, etc.
  ☐ Plantillas TPV editadas con detalles específicos
  ☐ Credenciales compartidas con agentes
  ☐ Documentación disponible (compartir links)
```

### Durante Fase 2 (Lunes a Viernes)

```
CADA DÍA (máximo 2 horas):
  ☐ 09:00 - Standup (15 min) - todos reportan %
  ☐ Cada 2h - Check-in: "¿Status?" → agentes responden
  ☐ 14:00 - Checkpoint mid-day (30 min)
  ☐ 17:00 - EOD update: ¿quién está bloqueado?
  ☐ Actualizar MATRIZ-DELEGACIONES-FASE2.md

CUANDO AGENTE DICE "LISTO":
  ☐ Revisar PR en GitHub (5 min)
  ☐ Ejecutar: npm run test (1 min)
  ☐ Ejecutar: npm run tsc --noEmit (1 min)
  ☐ Verificar Swagger (2 min)
  ☐ Si todo OK → Approbar + Mergear
  ☐ Comunicar: "✅ MERGED [MÓDULO]"

CUANDO AGENTE ESTÁ BLOQUEADO:
  ☐ Escuchar problema (5 min)
  ☐ Si es técnico → call a Tech Lead (< 30 min)
  ☐ Si es acceso/config → resolver inmediato
  ☐ Reportar al agente: solución + próxima tarea
```

### Después de Fase 2 (Viernes 17:00)

```
CIERRE:
  ☐ Todos los módulos MERGED a develop
  ☐ Crear branch release/fase-2
  ☐ Escribir Changelog (qué es nuevo)
  ☐ Version bump: v1.1.0
  ☐ Tag release: git tag v1.1.0
  ☐ Demo a stakeholders (opcional)
  ☐ Retrospecativa: qué aprendimos
```

---

## 📊 ENTREGA POR DÍA

### Lunes: 0% (Setup)
```
Legal Tools backend comienza
Psych Tools backend comienza
Schema finalizado, repos ready
```

### Martes: 20% (Backend heavy)
```
Legal Tools backend 50% (DTOs + controller)
Psych Tools backend 50% (servicios)
Social Tools backend 20% (setup)
Primer merge esperado: SI EN TRACK
```

### Miércoles: 40% (Backend final + Frontend start)
```
Legal Tools backend DONE
Psych Tools backend DONE
Frontend comienza (Legal, Psych, Social)
Transversal backend comienza
Esperado: 3 merges
```

### Jueves: 65% (Frontend heavy)
```
Frontend: Legal 50%, Psych 50%, Social 50%
Transversal backend DONE
Social backend DONE
Esperado: 2 merges
```

### Viernes: 100% (Frontend final + QA)
```
Frontend: Legal DONE, Psych DONE, Social DONE
QA: Integration + E2E tests DONE
Esperado: 5 merges + release branch
```

---

## ✅ VALIDACIÓN FINAL (VIERNES 16:00)

**Ejecuta esto para validar que TODO está listo**:

```bash
# 1. Compilación TypeScript
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit --skipLibCheck
# → Debe retornar: 0 errores

# 2. Tests de backend
npm run test -- legal-tools
npm run test -- psychological-tools
npm run test -- social-tools
npm run test -- transversal-tools
# → Debe retornar: XX PASS, coverage >= 80%

# 3. Tests de QA
npm run test:e2e
# → Debe retornar: 40+ PASS

# 4. Swagger (navegar en navegador)
# http://localhost:4000/api/docs
# → Debe mostrar: 12 endpoints nuevos documentados

# 5. Database
npx prisma studio
# → Debe mostrar: 11 nuevas tablas con datos

# 6. Release ready
git log --oneline develop | head -20
# → Debe mostrar: commits de todos los módulos

# SI TODO OK:
git tag v1.1.0 -m "Release Fase 2 - 11 módulos"
git push --tags
```

---

## 🎯 FORMATO TPV BREVÍSIMO

**Cada delegación tiene 3 secciones**:

1. **TASK** (qué debe entregar)
   - Línea 1-2: describe objetivo
   - Ejemplo: "Implementar 3 endpoints POST para análisis legal"

2. **PRECONDITIONS** (qué debe existir antes)
   - Schema Prisma actualizado
   - DB migrada
   - Rama Git creada
   - Docs disponibles

3. **VALIDATION** (cómo validas que está LISTO)
   - TypeScript: 0 errores
   - Tests: N PASS
   - Swagger: N endpoints
   - Manual curl test: 200 OK
   - No hardcoding: variable de entorno
   - PR aprobada

**PM envía**: Plantilla TPV + credenciales + link a docs  
**Agente recibe**: Tarea clara, sin ambigüedad  
**Ambos ganan**: Conocimiento claro del qué y cómo validar

---

## 🚨 RED FLAGS (Escala YA)

```
BLOQUEA PROYECTO:
  ❌ Agente no reporta > 2 horas
  ❌ TypeScript error que crece (5 → 20)
  ❌ Tests que antes pasaban ahora fallan
  ❌ DB corrupta (migration conflict)
  ❌ Ollama cae sin reiniciar

REQUIERE ATENCIÓN:
  ⚠️  Bloqueador > 1 hora
  ⚠️  Performance > 2000ms
  ⚠️  Agente reporta 0% en 4 horas

NORMAL (OBSERVAR):
  ℹ️ Pregunta técnica
  ℹ️ Performance 300-500ms
  ℹ️ Comentario en PR
```

---

## 📞 CUANDO NECESITAS AYUDA

```
Problema                    → Contacto              Tiempo
─────────────────────────────────────────────────────────
¿Cómo delego una tarea?     → PLANTILLAS-DELEGACION  5 min
¿Qué checklist usar?        → PM-DELEGACION-AGENTES  10 min
¿Qué agente está bloqueado? → MATRIZ-DELEGACIONES    1 min
¿Error técnico?             → Tech Lead + este doc   15 min
¿Se rompió DB?              → DevOps + Tech Lead     30 min
¿Agente desaparece?         → Call directo            5 min
```

---

## 💡 TIPS PARA ÉXITO

1. **Sé claro en la delegación**
   - TPV debe ser sin ambigüedad
   - Si agente pregunta → responde en < 5 min
   - Mejor pregunta clara ahora que retrasos después

2. **Monitorea pero no asfixies**
   - Check-in cada 2 horas OK
   - Check-in cada 30 min = micromanagement
   - Si agente está bloqueado > 1h → intervén

3. **Celebra victorias**
   - ✅ Cuando agente mergea módulo → "¡Excelente!"
   - Mantiene motivación alta
   - Fase 2 es intensa, feedback positivo ayuda

4. **Documenta decisiones**
   - Cualquier cambio de scope → anotado en MATRIZ
   - Bloqueadores resueltos → date + solución
   - Aprendizajes → para próximas fases

5. **Ten backup plan**
   - Si Backend-Legal se enferma → quién lo cubre?
   - Si QA falla → otros agentes pueden ayudar?
   - Identificar riesgos temprano

---

## 📈 MÉTRICA DE ÉXITO PM

**Ganas si**:
- ✅ Todos 11 módulos terminados el viernes
- ✅ 100% de tests PASS
- ✅ 0 bloqueadores sin resolver > 2 horas
- ✅ Todo mergeado a develop
- ✅ Equipo reporta "fue bien organizado"

**No ganas si**:
- ❌ Algún módulo no termina (o termina 50%)
- ❌ Agentes no saben qué hacer (TPV ambiguo)
- ❌ Bloqueadores duran 4+ horas
- ❌ Merge conflicts no resueltos
- ❌ Tests PASS pero performance caída

---

## 🎓 PRÓXIMA LECTURA RECOMENDADA

**Orden de lectura esta semana**:

1. **Ahora**: Este documento (5 min) ← TE ESTÁS AQUÍ
2. **HOY**: PM-DELEGACION-AGENTES-IA.md (30 min)
3. **HOY**: PLANTILLAS-DELEGACION-TPV.md (10 min)
4. **MAÑANA**: MATRIZ-DELEGACIONES-FASE2.md (5 min inicial)
5. **DIARIO**: PM-GUIA-RAPIDA.md (cuando necesites resolver rápido)

---

## 🎯 TU PRIMER ACCIÓN (AHORA)

```
[ ] 1. Abre: PM-DELEGACION-AGENTES-IA.md
[ ] 2. Lee secciones: 
      - "Estructura de Delegación"
      - "Formato TPV"
      - "Checklist de Validación"
[ ] 3. Abre: PLANTILLAS-DELEGACION-TPV.md
[ ] 4. Prepara 1 plantilla (Legal Tools Backend)
[ ] 5. Envía a tu Tech Lead: "Revisá la plantilla TPV ¿OK?"
[ ] 6. Listo para mañana: delegación #1 al agente

Tiempo total: 1 hora
```

---

**Generado por**: Kiro Project Management Agent  
**Fecha**: 2026-08-01  
**Estado**: Listo para usar  
**Feedback**: Escribe en #phase-2 si algo no está claro

