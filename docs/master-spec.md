# SISTEMA DE GESTIÓN Y ACOMPAÑAMIENTO DE CASOS
## Defensoría de la Niñez y Adolescencia — Documento Maestro de Propuesta
### Versión consolidada 1.0 · Julio 2026

> **Documento de referencia canónico del proyecto.** Este archivo preserva la especificación original
> tal como fue definida por el equipo de producto. Los documentos técnicos derivados (ADR, Schema, Security)
> en `docs/` son la fuente de verdad para implementación.

---

> [!NOTE]
> Este documento fue la base para las decisiones arquitectónicas documentadas en
> [ADR-001](architecture/ADR-001-foundation.md), el modelo de datos en
> [Schema v0](data-model/schema-v0.md), y el modelo de seguridad en
> [Access Control](security/access-control.md).

## ÍNDICE

1. Resumen ejecutivo
2. Fundamento legal e institucional
3. Principios rectores del sistema
4. Roles del sistema
5. Modelo de datos
6. Arquitectura multi-distrital y registro único de casos
7. Catálogo de tipos de trámite
8. Sistema de diseño visual
9. Especificación de pantallas por rol
10. Módulo de Actuación Jurídica (profundización)
11. Seguridad y protección de datos
12. Mapeo hacia el código base existente
13. Stack tecnológico
14. Roadmap por fases
15. Riesgos identificados
16. Pendientes abiertos y próximos pasos

---

## 1. RESUMEN EJECUTIVO

Este documento especifica un sistema de gestión de casos para la **Defensoría de la Niñez y Adolescencia (DNA)**, servicio municipal gratuito y permanente dependiente del Gobierno Autónomo Municipal, operado por un equipo interdisciplinario (Trabajo Social, Psicología, Área Legal) bajo Jefatura, con desconcentración en oficinas distritales.

El sistema parte de un prototipo de código ya existente (originalmente diseñado como ERP para un bufete jurídico) y lo reconvierte integralmente, aplicando un principio rector no negociable:

> **El caso es del NNA. Los profesionales y las oficinas son temporales dentro del caso.**

Esto significa que el expediente (hechos, evidencias, informes) es **inmutable y persistente**, mientras que la asignación de profesionales y la oficina interviniente son **datos mutables con historial completo**, permitiendo rotación de personal y desconcentración distrital sin fragmentar ni duplicar la información del caso.

---

## 2. FUNDAMENTO LEGAL E INSTITUCIONAL

### 2.1 Marco normativo vigente
- **Ley N° 548 (2014), Código Niña, Niño y Adolescente**: implementa el Sistema Plurinacional Integral de la Niña, Niño y Adolescente (SIPPROINA). Es la norma nacional vigente y de mayor jerarquía.
- **Ley N° 1168 (2019)**: modifica Ley 548 — acorta plazos judiciales, reforma procedimientos de adopción.
- **Ley N° 1371 (2021)**: modifica Art. 84 y relacionados de Ley 548 — prioriza acogimiento familiar sobre institucional.
- **Reglamento Municipal de Defensorías de Sucre (Ordenanza 136/03, 2003)**: referencia operativa municipal; consistente con Ley 548 salvo terminología de autoridades judiciales (desactualizada).

### 2.2 Estructura organizacional confirmada

```
Gobierno Autónomo Municipal (GAM)
 └── Jefatura de Asuntos de Género – Generacionales
       └── Defensoría de la Niñez y Adolescencia (DNA)
             ├── Oficina Central
             ├── Oficina Distrital 1, 2, 3...
```

- Es **una sola institución con múltiples oficinas** dentro de un mismo municipio — arquitectura **multi-sede**, no multi-tenant.
- La autoridad judicial de referencia es la **Jueza o Juez Público en materia de Niñez y Adolescencia**.

### 2.3 Equipo interdisciplinario confirmado
Trabajo Social, Psicología y Área Legal, coordinados por Jefatura, con apoyo administrativo de Secretaría.

---

## 3. PRINCIPIOS RECTORES DEL SISTEMA

| # | Principio | Regla derivada |
|---|---|---|
| 1 | El expediente es del NNA, no del profesional | Datos base del caso inmutables; solo se anexa, nunca se sobrescribe |
| 2 | Rotación sin pérdida de continuidad | Equipo del Caso y Oficina interviniente son tablas históricas, no campos fijos |
| 3 | No duplicación de testimonio | Búsqueda previa obligatoria antes de crear cualquier caso nuevo |
| 4 | La IA asiste, no decide ni escribe el expediente | Todo contenido generado por IA es borrador hasta confirmación humana explícita |
| 5 | Protección reforzada por tratarse de menores | Control de acceso por rol y por asignación activa, auditoría inmutable, Token de Seguridad |
| 6 | Sin fines de cobro | No existe módulo financiero |
| 7 | Cumplimiento de plazos legales | Alertas automáticas para plazos como 24h de comunicación de acogimiento |

---

## 4. ROLES DEL SISTEMA

| Rol | Función | Alcance de datos |
|---|---|---|
| **Jefatura de Unidad** | Visión 360°, asignación/reasignación, auditoría, permisos | Todo el sistema |
| **Abogado/a** | Actuación jurídica, seguimiento procesal, generación de escritos | Casos asignados |
| **Psicólogo/a** | Evaluación e informe psicológico, indicadores de riesgo | Casos asignados |
| **Trabajador/a Social** | Ficha social, informe social, coordinación con red de derivación | Casos asignados |
| **Secretaría** | Agenda, primera recepción/ingesta de denuncias | Operativo, no clínico |
| **Referente/Tutor legal** | Seguimiento simplificado del caso de su NNA | Vista muy restringida |

Creación de caso nuevo: solo **Secretaría** y **Jefatura**.

---

## 5. MODELO DE DATOS

```
NNA (persona titular)
 └── Caso (expediente único, datos base inmutables)
       ├── Historial de Equipo (profesional, rol, fecha inicio/fin, motivo)
       ├── Historial de Oficina/Distrito (oficina, fecha, motivo de derivación)
       ├── Vía de Intervención (histórica, 3 estados posibles)
       ├── Actuaciones/Bitácora (cronológica, autor, no editable tras firmar)
       ├── Evidencias (archivo, tipo, cadena de custodia, hash de integridad)
       ├── Informes (Social / Psicológico / Psicosocial / Jurídico)
       ├── Agenda del Caso (vinculada al código del caso, no al profesional)
       └── Fase del Caso (Derivación → Evaluación → Seguimiento → [Judicialización] → Cierre)
```

> Ver especificación completa de tablas en [Schema v0](data-model/schema-v0.md).

---

## 6. ARQUITECTURA MULTI-DISTRITAL Y REGISTRO ÚNICO DE CASOS

### 6.1 Búsqueda previa obligatoria (anti-duplicación)
Antes de crear un caso nuevo, el sistema exige búsqueda por nombre/documento del NNA, denunciante, denunciado o código de caso.

### 6.2 Derivación entre oficinas
Un caso puede derivarse entre oficinas con motivo obligatorio y trazabilidad completa.

### 6.3 Continuidad de agenda
La agenda está vinculada al código de caso, no a la oficina ni al profesional.

---

## 7. CATÁLOGO DE TIPOS DE TRÁMITE

| Tipo de trámite | Particularidad del flujo |
|---|---|
| Denuncia por vulneración de derechos | Puede derivar a Conciliación o Vía Legal |
| Consumo de alcohol/drogas por NNA | Informe psicosocial; posible solicitud de internación |
| Venta de alcohol a menores | Denunciado es establecimiento |
| Incumplimiento del derecho a la educación | Requiere constitución física en establecimiento |
| Extravío de NNA | Ficha social específica; flujo de búsqueda/hallazgo |
| NNA como autor/a de infracción | NNA es sujeto denunciado, no víctima |
| Fiscalización de locales | Proactivo/institucional, módulo separado |

### Vía de Intervención (3 estados, histórica y mutable)
- Gestión administrativa directa
- Conciliación (solo si NO constituye delito)
- Vía judicial

---

## 8. SISTEMA DE DISEÑO VISUAL

### 8.1 Paleta de color

| Token | Hex | Uso |
|---|---|---|
| `--bosque-profundo` | `#1E4B43` | Primario: sidebar, botones principales |
| `--salvia` | `#6B9080` | Secundario: estados positivos |
| `--tierra-calida` | `#C98A3E` | Acento humano |
| `--papel` | `#F7F5F0` | Fondo general |
| `--grafito` | `#2B2B28` | Texto principal |
| `--riesgo-bajo/medio/alto` | `#6B9080` / `#D9A441` / `#B44B3C` | Solo para riesgo real del NNA |

### 8.2 Tipografía
- Display: **Fraunces** (títulos)
- Cuerpo: **Public Sans** (legibilidad institucional)
- Datos/códigos: **IBM Plex Mono**

### 8.3 Elemento distintivo: Riel de Fase (`PhaseRail`)
Barra vertical fija en vista de expediente mostrando la fase actual como línea de tiempo.

---

## 9-16. SECCIONES RESTANTES

> Las secciones 9 (Pantallas por Rol), 10 (Módulo Jurídico), 11 (Seguridad), 12 (Mapeo código base),
> 13 (Stack), 14 (Roadmap), 15 (Riesgos) y 16 (Pendientes) se documentan en detalle en los
> documentos técnicos derivados:
>
> - Pantallas y rutas → [Roadmap Phase 1](roadmap/phase-1-breakdown.md)
> - Seguridad → [Access Control](security/access-control.md)
> - Stack y decisiones → [ADR-001](architecture/ADR-001-foundation.md)
> - Modelo de datos → [Schema v0](data-model/schema-v0.md)
> - Marco legal → [Marco Normativo](legal/marco-normativo.md)
