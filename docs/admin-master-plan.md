# Plan Maestro del Módulo Administrador General — Defensoría de la Niñez y Adolescencia (DNA)

Este documento define las especificaciones técnicas, modelo de datos y alcance de interfaz para el **Módulo de Administración General (`ADMINISTRADOR`)** del Sistema de Gestión de Casos DNA Sucre.

---

## 1. Visión General del Módulo Administrador

El **Administrador General** cuenta con privilegios totales de gestión sobre la plataforma municipal. Es el responsable de la infraestructura territorial, la gestión del talento humano, la seguridad de accesos (RBAC), la auditoría y los reportes analíticos de los 9 distritos de Sucre.

```
                    ┌─────────────────────────────────────────┐
                    │          ADMINISTRADOR GENERAL          │
                    └────────────────────┬────────────────────┘
                                         │
 ┌──────────────────────┬────────────────┼──────────────────────┬──────────────────────┐
 │                      │                │                      │                      │
▼                      ▼                ▼                      ▼                      ▼
Gestión de Oficinas    Gestión Humana   Matriz RBAC Permisos   Auditoría Global       Configuración IA Local
(Los 9 Distritos)      (Roles y Cuentas)(Seguridad)            (Logs y Backups)       (Modelos y Base Vectorial)
```

---

## 2. Definición Territorial — Los 9 Distritos de Sucre

El municipio de Sucre cuenta con 8 distritos (urbanos y rurales) más la Sede Central. El Administrador puede administrar las 9 oficinas del municipio:

| # | Código Oficina | Nombre Oficial | Tipo | Dirección / Ubicación |
|---|---|---|---|---|
| 1 | `CENTRAL` | **Defensoría Central Sucre** | Sede Central / Urbano | Calle Junín N° 450, Z. Central |
| 2 | `DIST_1` | **Defensoría Distrital 1 — Mercado Campesino** | Urbano | Av. Las Delicias N° 120, Z. Mercado Campesino |
| 3 | `DIST_2` | **Defensoría Distrital 2 — Alto Delicias / Lajastambo** | Urbano | Av. Juana Azurduy N° 850, Z. Lajastambo |
| 4 | `DIST_3` | **Defensoría Distrital 3 — Yurac Yurac / Max Toledo** | Urbano | Av. 6 de Marzo N° 310, Z. Yurac Yurac |
| 5 | `DIST_4` | **Defensoría Distrital 4 — San José / Villa Armonía** | Urbano | Av. Jaime Mendoza N° 1100, Z. San José |
| 6 | `DIST_5` | **Defensoría Distrital 5 — Aranjuez / Azari** | Urbano | Av. Panamericana N° 420, Z. Azari |
| 7 | `DIST_6` | **Defensoría Distrital 6 — Distrito Rural Arabate** | Rural | Subalcaldía Arabate, Comunidad Arabate |
| 8 | `DIST_7` | **Defensoría Distrital 7 — Distrito Rural Chataquila** | Rural | Centro Cívico Chataquila, Z. Turismo |
| 9 | `DIST_8` | **Defensoría Distrital 8 — Distrito Rural Potolo** | Rural | Subalcaldía Potolo, Plaza Principal Potolo |

### Campos de la Entidad `Office`:
- `id` (UUID v7, PK)
- `code` (String, Unique — ej. `CENTRAL`, `DIST_1`, ..., `DIST_8`)
- `name` (String — Nombre de la oficina)
- `type` (Enum: `URBANO`, `RURAL`, `SEDE_CENTRAL`)
- `address` (String — Ubicación física)
- `phone` (String — Teléfono de contacto)
- `isActive` (Boolean — Estado operativo)
- `createdAt`, `updatedAt`

---

## 3. Gestión Completa de Funcionarios (CRUD de Usuarios)

El Administrador tiene control total sobre el catálogo de personal interdisciplinario de las defensorías:

### Funcionalidades:
1. **Listado de Personal**: Vista de tabla paginada con filtros por Distrito, Rol y Estado (Activo/Inactivo).
2. **Registro de Funcionario (CREATE)**:
   - Documento de Identidad (CI/Pasaporte)
   - Nombres y Apellidos
   - Correo Institucional (`@defensoria.gob.bo`)
   - Rol (`ADMINISTRADOR`, `JEFATURA`, `ABOGADO`, `PSICOLOGO`, `SOCIAL`, `SECRETARIA`)
   - Oficina/Distrito Asignado
   - Contraseña inicial
3. **Edición de Perfil (UPDATE)**: Modificación de nombres, correo, teléfono y asignación de distrito.
4. **Reasignación de Rol / Permisos**: Cambio de rol operativo instantáneo.
5. **Restablecimiento de Contraseña**: Blanqueo seguro de credenciales.
6. **Baja / Alta Operativa (DELETE/DEACTIVATE)**: Inactivación con conservación de historial de intervenciones.

---

### 🔐 2. Gestión Dinámica de Módulos del Sistema y Matriz RBAC
- **Modelo de Datos Prisma (`SystemModule`)**:
  - `id`: UUID v7.
  - `code`: Código único en Mayúsculas (`MOD_DISTRICTS`, `MOD_USERS`, `MOD_CASES_INGEST`, etc.).
### 👤 2. Matriz de Permisos & Seguridad RBAC (`/permisos`)
- **Gestión Total para `ADMINISTRADOR`**: El Administrador cuenta con **CRUDs completos** y facultades operativas sobre todos los módulos del sistema, incluyendo:
  - **Detalle de Expedientes (`/casos/[id]`)**: Habilitadas las opciones de **`🔒 Generar PIN Tutor`** y **`Asignar Profesional`** al equipo interdisciplinario (`CaseTeamHistory`) con menú desplegable interactivo por rol (`ABOGADO`, `PSICOLOGO`, `SOCIAL`).
  - **Módulos del Sistema (`SystemModule`)**: Creación, edición, eliminación y ajuste de permisos por rol.
  - `DELETE /api/system-modules/:id`: Eliminación de módulos personalizados.

- **Interfaz de Usuario (`/permisos` - Matriz RBAC)**:
  - Botón **`+ Crear Nuevo Módulo`** para registrar nuevas secciones o acciones en la plataforma.
  - Botones **`Editar Permisos`** y **`Eliminar`** para cada fila de la matriz de seguridad.
  - Modal con desplegables por rol (`✅ Total`, `✅`, `📋 Asignados`, `Lectura`, `✅ Titular`, `❌`).

---

### 🛡️ 3. Auditoría Inmutable de Sistema (`/auditoria`)
- **Acceso Habilitado para Administrador**: Se configuró la API (`AuditController`) y el frontend (`/auditoria`) para permitir el acceso total de consulta de registros append-only a los roles de **`ADMINISTRADOR`** y **`JEFATURA`**.

---

### 📅 4. Módulo de Agenda Consolidada y Control Diario de Citas (`/citas`)
- **Acceso Directo en Menú Lateral por Rol**:
  - Habilitado el ítem de navegación **`Agenda y Citas`** en el menú lateral para todos los roles profesionales (`ABOGADO`, `PSICOLOGO`, `SOCIAL`, `SECRETARIA`, `JEFATURA`, `ADMINISTRADOR`).
- **Filtro de Alcance (Mi Agenda Asignada vs Agenda Consolidada)**:
  - **Roles Profesionales (`ABOGADO`, `PSICOLOGO`, `SOCIAL`)**: Acceso directo y exclusivo a **`📋 Mi Agenda Personal Asignada`** (`?onlyMine=true`), mostrando únicamente las citas de sus expedientes asignados sin intentar llamadas de administración de usuarios.
  - **Administradores y Jefatura**: Pestañas selectoras para alternar entre **`📋 Mi Agenda Personal Asignada`** y **`🌐 Agenda Consolidada Institucional`** (todas las 9 oficinas).
  - Filtros por Fecha (`[YYYY-MM-DD]`), Distrito/Oficina y Tipo de Intervención.
- **Sección de Citaciones Urgentes en el Dashboard (`/panel`)**:
  - Tarjetero destacado **`⚡ Citaciones Urgentes y Próximos Compromisos (Mi Agenda)`** en el Panel General.
  - Filtra automáticamente las citaciones del profesional logueado vinculadas a **expedientes en 🔴 RIESGO ALTO** o audiencias/evaluaciones prioritarias.
- **Transferencia y Reasignación de Representación (`PATCH /api/appointments/:id/reassign`)**:
  - Opción **`🔁 Reasignar`** en la tabla de citas para Administradores y Jefatura con filtro estricto por especialidad (`ABOGADO` ➔ `ABOGADO`, `PSICOLOGO` ➔ `PSICOLOGO`) y asignación automática al equipo del expediente (`CaseTeamHistory`).
- **Generación de Reporte Imprimible**:
  - Botón **`🖨️ Imprimir Reporte de Citas`** que despliega una vista modal con formato oficial del GAM Sucre lista para impresión directa o descarga en PDF con campos de firma.

---

## 4. Matriz de Permisos & Seguridad RBAC

El sistema opera con control de acceso basado en roles (RBAC) combinado con seguridad a nivel de filas (RLS) en PostgreSQL:

| Módulo / Acción | ADMINISTRADOR | JEFATURA | ABOGADO | PSICOLOGO | SOCIAL | SECRETARIA | REFERENTE_TUTOR |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Gestión de Distritos** | **CRUD Total** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Gestión de Usuarios** | **CRUD Total** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Matriz de Permisos** | **CRUD Total** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Ingesta de Casos** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Ver Casos Asignados** | ✅ (Todos) | ✅ (Todos) | 📋 (Propios) | 📋 (Propios) | 📋 (Propios) | ✅ (Todos) | 📋 (Limitado) |
| **Transferir Expediente** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Informes Sociales** | ✅ (Lectura) | ✅ (Lectura) | 🔒 (Token) | 🔒 (Token) | **CRUD** | ❌ | ❌ |
| **Informes Psicológicos**| ✅ (Lectura) | ✅ (Lectura) | 🔒 (Token) | **CRUD** | 🔒 (Token) | ❌ | ❌ |
| **Informes Jurídicos** | ✅ (Lectura) | ✅ (Lectura) | **CRUD** | ❌ | ❌ | ❌ | ❌ |
| **Inspecciones** | **CRUD Total** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Auditoría del Sistema**| **Consulta Total**| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Auditoría del Sistema (`AuditLog Explorer`)

Consulta inmutable de todas las operaciones realizadas en la plataforma.
- **Filtros**: Por Rango de Fechas, Usuario, Rol, Acción (`LOGIN`, `CASE_CREATE`, `TEAM_ASSIGN`, `REPORT_EMIT`, `SECURITY_TOKEN_USE`, `USER_UPDATE`), Entidad Afectada e Dirección IP.
- **Garantía Append-Only**: Sin opciones de modificación o eliminación en base de datos.

---

## 6. Módulo de Reportes Totales y Por Distrito

El Administrador accede a métricas consolidadas con selector de Distrito (Oficina Central, Distrito 1 al 8, o Total Municipal):

1. **KPIs Globales**:
   - Total de expedientes abiertos en la gestión.
   - Casos activos vs. casos cerrados.
   - Distribución por nivel de riesgo (Bajo, Medio, Alto).
2. **Estadísticas Territorializadas**:
   - Carga horaria y volumen de casos por distrito.
   - Tipologías de vulneración más frecuentes por zona urbana/rural.
   - Tiempos promedio de resolución por Vía de Intervención (Administrativa / Judicial).
3. **Exportación Consolidada**: Generación de reportes institucional para el GAM (Gobierno Autónomo Municipal).

---

## 7. Configuración de Inteligencia Artificial Soberana y Base de Conocimiento (RAG)

El Administrador General es el único rol con acceso a la parametrización de los motores de IA locales (sin conexión a internet):

1. **Configuración de Modelos (`/panel/admin/ia`)**:
   - Selector dinámico del modelo de **Texto / Razonamiento Jurídico** (conectado a la API de Ollama).
   - Selector dinámico del modelo de **Vectores / Embeddings**.
   - Configuración de red para el modelo de **Transcripción de Audio (Whisper)**.
2. **Ingesta de Documentos y Leyes (`/panel/admin/conocimiento`)**:
   - Subida nativa de archivos PDF (Manuales, Leyes, Códigos).
   - Proceso automatizado de lectura, partición (chunking) e inyección matemática en la base de datos `pgvector`.
3. **Gestión de la Base Vectorial (Proyección Futura)**:
   - Capacidad de borrar o actualizar leyes derogadas.
   - Forzar la re-indexación de toda la base de datos si se cambia el modelo de embeddings (ej. pasar de `nomic-embed-text` a uno superior).

---

### 📑 5. Módulo de Informes Profesionales e Inmutabilización Documental
- **Flujo de Pre-Emisión y Confirmación de Impresión (`ReportEditor`)**:
  - Al pulsar **`🔒 Emitir e Inmutabilizar Informe`**, el sistema abre la modal **"Vista Previa del Informe Institucional antes de Emitir"**.
  - **Opciones de Pre-Emisión**:
    - **`✏️ Modificar / Volver a Editar`**: Cierra la vista previa y regresa al borrador para correcciones sin congelar el documento.
    - **`🖨️ Confirmar, Imprimir e Inmutabilizar`**: Congela atómicamente el informe (`status: EMITIDO`), abre el cuadro de impresión oficial/PDF del navegador y actualiza el estado del expediente.
  - Formato membretado oficial GAM Sucre con espacio para firmas y sellos del profesional autor y la Jefatura DNA.

---

## 7. Módulo de Inspecciones & Fiscalización por Distrito

Supervisión de operativos en vía pública, establecimientos nocturnos y unidades educativas:
- **Catálogo de Establecimientos**: Registro por distrito (Unidad Educativa, Local Nocturno, Centro de Acogida).
- **Inspecciones Realizadas**: Fecha, equipo inspector, hallazgos y medidas correctivas dictadas.

---

## 8. Control de Ruta de Expedientes y Transferencias Distritales

Supervisión de la movilidad de los expedientes entre distritos:
- **Trazabilidad `CaseOfficeHistory`**: Registro cronológico de cuándo un caso pasó de una oficina distrital a otra.
- **Reasignación de Equipo**: Asignación automática o manual de profesionales del distrito receptor.
- **Riel Procesal Integrado**: Seguimiento de la fase procesal (*Derivación → Evaluación → Seguimiento → Judicialización → Cierre*).

---

## 9. Plan de Implementación Técnica

### Paso 1: Documentación y Especificaciones (FASE ACTUAL)
- [x] Creación del Plan Maestro (`docs/admin-master-plan.md`)
- [x] Actualización de la Matriz RBAC (`docs/security/access-control.md`)
- [x] Actualización del Modelo de Datos (`docs/data-model/schema-v0.md`)
- [x] Actualización del Resumen de Arquitectura (`docs/system-overview.md`)

### Paso 2: Backend API & Base de Datos
- [ ] Ampliación de la semilla de datos (`seed.ts`) con los **9 Distritos de Sucre** y sus usuarios iniciales.
- [ ] Creación de `OfficesModule` en NestJS (endpoints CRUD para oficinas/distritos).
- [ ] Creación de `UsersModule` en NestJS (endpoints CRUD para funcionarios y asignación de roles).
- [ ] Integración de filtros por distrito en el `CasesModule`, `InspectionsModule` y `ReportsModule`.

### Paso 3: Frontend Web (Dashboard Administrador)
- [ ] Vista `/oficinas`: Gestión de los 9 Distritos de Sucre.
- [ ] Vista `/usuarios`: CRUD de Funcionarios del Sistema.
- [ ] Vista `/permisos`: Matriz de Configuración RBAC.
- [ ] Vista `/reportes`: Panel analítico con filtros distritales.
- [ ] Vista `/auditoria`: Buscador de logs inmutables.
