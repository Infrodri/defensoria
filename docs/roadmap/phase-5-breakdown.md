# Project Roadmap: Phase 5 Breakdown

This document details the fifth and final phase of the DNA Case Management System implementation: **Módulo de Inspecciones y Fiscalización de Locales**.

## Phase 5 — Módulo de Inspecciones y Fiscalización
**Duration:** 1-2 weeks
**Dependencies:** Phase 1 (MVP Core)

### Contexto
De acuerdo con la Ley 548 y el Reglamento Municipal de Sucre, la Defensoría de la Niñez y Adolescencia (DNA) realiza operativos proactivos de fiscalización en establecimientos comerciales y de transporte (bar es, discotecas, salas de juegos, terminales de buses, internet cafes).
El objetivo es verificar que no se vendan bebidas alcohólicas a menores, no haya explotación laboral infantil, ni transporte no autorizado de NNA sin permiso de viaje.

### Tasks

#### 1. Base de Datos (`packages/db`)
- [ ] Agregar modelos Prisma:
  - `Establishment`: Locales comerciales o puntos de control fiscalizados (Nombre, Categoría, Dirección, Propietario/Responsable).
  - `Inspection`: Registro de operativo u orden de inspección (Fecha/Hora, Oficina, Equipo interviniente, Estado).
  - `InspectionFinding`: Hallazgos o infracciones detectadas durante la inspección (ej. NNA consumiendo alcohol, falta de permiso de viaje, NNA trabajando en horario nocturno, Derivación a Expediente).

#### 2. Backend (`apps/api`)
- [ ] Módulo `InspectionsModule`:
  - CRUD para Establecimientos / Puntos de Control (`/api/establishments`).
  - Registro de Inspecciones/Operativos (`/api/inspections`).
  - Vinculación opcional entre un Hallazgo en inspección y la creación automática de un Expediente de Caso (`/api/inspections/:id/create-case`).

#### 3. Frontend (`apps/web`)
- [ ] Vista `/inspecciones`:
  - Lista y registro de Operativos de Inspección.
  - Formulario de Registro de Operativo (Lugar, Fecha, Participantes, NNA intervenidos).
  - Botón "Derivar a Expediente de Caso" si durante el operativo se detectó un NNA en vulneración directa de derechos.

### Acceptance Criteria
- [ ] Jefatura y profesionales pueden registrar operativos de fiscalización proactiva.
- [ ] Se pueden catalogar hallazgos de infracción (ej. venta de alcohol a menores).
- [ ] Se permite generar directamente un Expediente de Caso a partir de un NNA hallado durante un operativo.
