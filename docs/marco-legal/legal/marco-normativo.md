# Marco Normativo — Sistema de Gestión de Casos DNA

> [!CAUTION]
> Este documento tiene fines exclusivos de referencia para el diseño y desarrollo del sistema informático. No constituye asesoría legal y no debe ser utilizado como sustituto del criterio de un asesor legal o profesional del derecho.

## 1. Jerarquía Normativa

El sistema opera bajo el siguiente marco normativo aplicable al sistema de protección infantil municipal en Bolivia:

1. **Constitución Política del Estado (2009)** — Art. 59-61 (derechos de NNA).
2. **Ley N° 548 (17 julio 2014)** — Código Niña, Niño y Adolescente. Establece el SIPPROINA. Esta es la ley rectora.
3. **Ley N° 1168 (2019)** — Modifica la Ley 548: acorta plazos judiciales y reforma procedimientos de adopción.
4. **Ley N° 1371 (1 mayo 2021)** — Modifica el Art. 84 y relacionados de la Ley 548: prioriza el acogimiento familiar sobre el institucional y agiliza la colocación familiar.
5. **Reglamento Municipal de Defensorías de Sucre (Ordenanza 136/03, 2003)** — Operativamente válido en lo que no contradiga a la Ley 548. Su terminología de autoridades judiciales está desactualizada (pre-2014).

## 2. Estructura Institucional

La estructura organizacional de la Defensoría de la Niñez y Adolescencia se conforma de la siguiente manera:

```text
Gobierno Autónomo Municipal (GAM)
 └── Jefatura de Asuntos de Género – Generacionales
       └── Defensoría de la Niñez y Adolescencia (DNA)
             ├── Oficina Central (piloto para pruebas)
             ├── Oficina Distrital 1
             ├── Oficina Distrital 2
             └── Oficina Distrital N (según densidad poblacional)
```

- Es **UNA sola institución** con múltiples oficinas dentro de un mismo municipio.
- La autoridad judicial de referencia es la **Jueza o Juez Público en materia de Niñez y Adolescencia**.
- A nivel departamental interactúa con la **Instancia Técnica Departamental de Política Social (ITDPS)**.

## 3. Equipo Interdisciplinario

El equipo de atención está conformado por profesionales de diferentes disciplinas, de acuerdo con el reglamento municipal y la práctica reportada:

- **Áreas:** Trabajo Social, Psicología y Área Legal, coordinados por la Jefatura.
- **Apoyo:** Apoyo administrativo a través de Secretaría.

## 4. Plazos Legales Configurados en el Sistema

Los siguientes plazos legales generan alertas automáticas en el sistema:

| Acción / Procedimiento | Plazo Legal | Observaciones |
| :--- | :--- | :--- |
| Comunicar acogimiento circunstancial a la autoridad judicial | **24 horas** | Genera alerta crítica en el sistema |
| *Otros plazos* | *Por definir* | Pendientes en validación legal (Fase 0) |

## 5. Restricción de Datos de NNA

> [!IMPORTANT]
> Despliegue **On-premise OBLIGATORIO** por dictamen del asesor legal del GAM.

- Queda estrictamente **prohibido** almacenar registros nominales o expedientes de menores en nubes públicas o extranjeras.
- **Fundamento:** Cumplimiento de las leyes de confidencialidad y protección de identidad del NNA.

## 6. Catálogos Configurables

Para facilitar su mantenimiento ante cambios normativos, los siguientes catálogos legales deben ser configurables desde la interfaz del sistema (sin necesidad de modificar el código fuente):

- Tipos de trámite/caso
- Medidas de protección
- Vías de intervención
- Tipos de informe

Esto permite al asesor legal actualizar los parámetros normativos de manera independiente.

## 7. Pendiente de Fase 0

Antes de iniciar la Fase 1, se requiere la validación legal de los siguientes puntos:

- Catálogo final de medidas de protección vigentes bajo la Ley 548.
- Validación de terminología legal en los formularios del sistema.
- Confirmación de tipos de informe requeridos por la institución.
