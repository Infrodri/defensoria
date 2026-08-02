# 📚 DOCUMENTACIÓN - DNA SUCRE

Índice maestro de la documentación del sistema DNA (Defensoría de la Niñez y Adolescencia, Sucre, Bolivia).

## 📂 ESTRUCTURA DE DOCUMENTACIÓN

```
📂 docs/
├── 📄 README.md ............................... Este archivo (índice maestro)
├── 📄 00-INDEX.md ........................... Punto de entrada para agentes IA
├── 📄 01-CONTEXTO-PROYECTO.md .............. Contexto general del proyecto
├── 📄 02-ARQUITECTURA-RESUMEN.md ............ Resumen técnico y brechas
│
├── 📁 guias-usuario/ ....................... Guías para usuarios finales (por rol y flujo)
├── 📁 legal/ ............................... Marco legal y reglamentos municipales
├── 📁 arquitectura/ ........................ Documentación técnica de arquitectura e integración
├── 📁 entregas/ ............................ Entregas, resúmenes y estado de fases
├── 📁 testing/ ............................. Testing, verificación y reportes de QA
├── 📁 agentes-ia/ ......................... Instrucciones y configuraciones para agentes IA
└── 📁 obsoletos/ .............................. Documentos obsoletos o superados (referencia)
```

Carpetas técnicas ya existentes (se conservan): `arquitectura/` (ADR), `api/`, `modelo-datos/`, `seguridad/`, `rag/`, `hoja-de-ruta/`, `marco-legal/`, `ejemplos/`, `INSTRUCCIONES-AGENTE-TESTING/`, `SETUP-AGENTE-EJECUTOR/`.

---

## 🎯 ACCESO RÁPIDO

### **Para Usuarios del Sistema**

- **Guías por rol**: [`docs/guias-usuario/`](./guias-usuario/)
- **Flujo completo de un caso**: [`docs/guias-usuario/FLUJO-COMPLETO-CASO-REAL.md`](./guias-usuario/FLUJO-COMPLETO-CASO-REAL.md)
- **Inicio rápido herramientas**: [`docs/guias-usuario/INICIO-RAPIDO-HERRAMIENTAS.md`](./guias-usuario/INICIO-RAPIDO-HERRAMIENTAS.md)

### **Marco Legal y Normativo**

- **Marco legal completo**: [`docs/legal/README.md`](./legal/README.md)
- **Reglamento Municipal de Defensorías**: [`docs/legal/REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md`](./legal/REGLAMENTO-MUNICIPAL-DEFENSORIAS-136-03.md)
  - Ordenanza Nº 136/03 (2003)
  - Define roles, atribuciones y procedimientos legales
  - Base legal del funcionamiento de las Defensorías
- **🚨 Brechas legales identificadas**: [`docs/legal/BRECHAS-LEGALES-Y-SOLUCIONES.md`](./legal/BRECHAS-LEGALES-Y-SOLUCIONES.md)
  - 4 brechas identificadas (2 críticas)
  - Plan de corrección con prioridades
  - **LECTURA OBLIGATORIA**
- **Guía de implementación técnica**: [`docs/legal/IMPLEMENTACION-TECNICA-BRECHAS.md`](./legal/IMPLEMENTACION-TECNICA-BRECHAS.md)

### **Para Desarrolladores y QA**

- **Estado de testing Phase 2**: [`docs/testing/TESTING-PHASE2-STATUS.md`](./testing/TESTING-PHASE2-STATUS.md)
- **Testing manual de herramientas**: [`docs/testing/TESTING-MANUAL-HERRAMIENTAS.md`](./testing/TESTING-MANUAL-HERRAMIENTAS.md)
- **Integración Frontend-API**: [`docs/arquitectura/INTEGRATION_FRONTEND_API.md`](./arquitectura/INTEGRATION_FRONTEND_API.md)
- **UX Tooltips**: [`docs/arquitectura/UX-TOOLTIPS-IMPLEMENTACION.md`](./arquitectura/UX-TOOLTIPS-IMPLEMENTACION.md)
- **Entrega Phase 2**: [`docs/entregas/ENTREGA-PHASE2-HERRAMIENTAS-Y-ADMIN.md`](./entregas/ENTREGA-PHASE2-HERRAMIENTAS-Y-ADMIN.md)
- **Resumen entrega Phase 2**: [`docs/entregas/RESUMEN-ENTREGA-PHASE2-COMPLETO.md`](./entregas/RESUMEN-ENTREGA-PHASE2-COMPLETO.md)

### **Para Agentes IA**

- **Leer primero**: [`docs/00-INDEX.md`](./00-INDEX.md)
- **Contexto del proyecto**: [`docs/01-CONTEXTO-PROYECTO.md`](./01-CONTEXTO-PROYECTO.md)
- **Instrucciones para agentes**: [`docs/agentes-ia/INSTRUCCIONES-AGENTES.md`](./agentes-ia/INSTRUCCIONES-AGENTES.md)

---

## 📊 DOCUMENTACIÓN POR CATEGORÍA

### 1️⃣ **GUÍAS DE USUARIO** (Usuarios finales)
- **Ubicación**: [`docs/guias-usuario/`](./guias-usuario/)
- Guías para SECRETARIA, ABOGADO, PSICÓLOGO, TRABAJADOR SOCIAL, JEFATURA y ADMINISTRADOR + flujo completo de caso.

### 2️⃣ **ARQUITECTURA** (Desarrolladores)
- **Ubicación**: [`docs/arquitectura/`](./arquitectura/)
- Integración frontend-API, implementación de herramientas por disciplina, tooltips, permisos/roles, master-spec y system-overview.
- ADR (decisiones técnicas): [`docs/arquitectura/`](./arquitectura/)

### 3️⃣ **ENTREGAS** (Estado de fases)
- **Ubicación**: [`docs/entregas/`](./entregas/)
- Resúmenes ejecutivos y entregas de cada fase.

### 4️⃣ **TESTING Y QA** (Control de calidad)
- **Ubicación**: [`docs/testing/`](./testing/)
- Testing, verificación y reportes de estado.

### 5️⃣ **AGENTES IA** (Configuración y gestión de IA)
- **Ubicación**: [`docs/agentes-ia/`](./agentes-ia/)
- Instrucciones, delegaciones, prompts y guías para agentes de IA.

### 6️⃣ **LEGACY** (Obsoletos / referencia)
- **Ubicación**: [`docs/obsoletos/`](./obsoletos/)
- Versiones antiguas y documentos superados conservados para referencia y trazabilidad.

---

## 🔍 BÚSQUEDA RÁPIDA POR TEMA

| Tema | Documento |
|------|-----------|
| Herramientas Phase 2 - resumen | [`entregas/RESUMEN-ENTREGA-PHASE2-COMPLETO.md`](./entregas/RESUMEN-ENTREGA-PHASE2-COMPLETO.md) |
| Herramientas Phase 2 - estado | [`testing/TESTING-PHASE2-STATUS.md`](./testing/TESTING-PHASE2-STATUS.md) |
| Herramientas Phase 2 - integración | [`arquitectura/INTEGRATION_FRONTEND_API.md`](./arquitectura/INTEGRATION_FRONTEND_API.md) |
| Roles y permisos | [`arquitectura/ROLES-Y-PERMISOS-RESUMEN.md`](./arquitectura/ROLES-Y-PERMISOS-RESUMEN.md) |
| Modelo de datos | [`modelo-datos/schema-v0.md`](./modelo-datos/schema-v0.md) |
| Sistema RAG / IA | [`rag/00-RAG-INDEX.md`](./rag/00-RAG-INDEX.md) |
| Seguridad / RBAC | [`seguridad/access-control.md`](./seguridad/access-control.md) |
| API | [`api/`](./api/) |

---

## 📝 CONVENCIONES

### **Nomenclatura de Archivos**
- `GUIA-[ROL].md` - Guías de usuario por rol (en `guias-usuario/`)
- `TESTING-*.md` — Documentos de testing/QA (en `testing/`)
- `INSTRUCCIONES-*.md` — Instrucciones de agentes (en `agentes-ia/`)
- `RESUMEN-*.md` — Resúmenes ejecutivos (en `entregas/`)
- `ENTREGA-*.md` / `*-PHASE*-*.md` — Entregas de fases (en `entregas/`)

### **Ubicación de Archivos**
- Guías de usuario → `docs/guias-usuario/`
- Arquitectura/integración técnica → `docs/arquitectura/`
- Entregas y resúmenes → `docs/entregas/`
- Testing y QA → `docs/testing/`
- Instrucciones de agentes IA → `docs/agentes-ia/`
- Obsoletos/superados → `docs/obsoletos/`

---

## 🚀 INICIO RÁPIDO

### **Soy usuario del sistema**
1. Ve a [`docs/guias-usuario/README.md`](./guias-usuario/README.md)
2. Busca tu rol y lee la guía correspondiente
3. Consulta el flujo completo para entender el contexto general

### **Soy desarrollador**
1. Lee [`docs/arquitectura/INTEGRATION_FRONTEND_API.md`](./arquitectura/INTEGRATION_FRONTEND_API.md)
2. Revisa [`docs/testing/TESTING-PHASE2-STATUS.md`](./testing/TESTING-PHASE2-STATUS.md)
3. Consulta guías de usuario para entender casos de uso

### **Soy QA / Tester**
1. Comienza con [`docs/testing/TESTING-MANUAL-HERRAMIENTAS.md`](./testing/TESTING-MANUAL-HERRAMIENTAS.md)
2. Sigue con [`docs/testing/TESTING-PHASE2-STATUS.md`](./testing/TESTING-PHASE2-STATUS.md)
3. Usa las guías de usuario como base de casos de prueba

---

## 📞 MANTENCIÓN

**Última actualización**: 2 de Agosto, 2026

**Responsable**: Equipo de Desarrollo DNA Sucre

**Contacto**: Ver documentación de soporte en cada guía específica.

---

**¿No encuentras lo que buscas?** Revisa [`00-INDEX.md`](./00-INDEX.md) o contacta al equipo de desarrollo.

