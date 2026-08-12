# ADR-026: Procesamiento Asíncrono con pg-boss (Rechazo de BullMQ/Redis)

## Estado
Aceptado — 2026-08-07

## Contexto
El sistema DNA Sucre necesita procesamiento asíncrono para:
- Transcripción de audio (Whisper local, puede tardar 15-60 min)
- Visión/OCR de imágenes (Ollama Vision, 30s-5min)
- Extracción de texto de PDF/DOCX (segundos)
- Indexación vectorial (embeddings) de evidencias procesadas

Se evaluaron dos opciones:
1. **BullMQ + Redis**: Cola en memoria, alto rendimiento, requiere infraestructura Redis adicional
2. **pg-boss + PostgreSQL**: Cola transaccional sobre la misma base de datos existente

## Decisión
Se consolida **pg-boss** (ya instalado como `pg-boss@^10.4.2`) como el único broker de colas asíncronas del sistema. Se rechaza BullMQ/Redis.

## Justificación

### Operacional
- La DNA de Sucre opera en infraestructura local (no cloud) con conectividad intermitente
- Agregar Redis introduce un punto de falla adicional sin beneficio proporcional
- pg-boss escribe en el mismo PostgreSQL que ya ejecuta el sistema, eliminando dependencias externas
- El volumen de jobs es bajo (~50-200 evidencias/día), no requiere throughput de memoria

### Técnica
- pg-boss provee `at-most-once` delivery con retry configurable (`retryLimit: 3`, `retryBackoff: true`)
- Transaccionalidad ACID: si el job falla, el rollback es parte de la misma transacción Postgres
- `singletonKey` previene ejecución concurrente del mismo evidenceId
- No requiere serialización/deserialización Redis — los payloads JSON viven en la misma DB

### Limitaciones Aceptadas
- `teamConcurrency: 1` serializa el procesamiento — aceptable dado que Ollama/Whisper no pueden ejecutar múltiples inferencias simultáneas en una GPU
- `expireInMinutes` debe configurarse por tipo de job (audio: 60min, imagen: 15min, documento: 5min) para evitar que jobs largos expiren prematuramente
- No hay pub/sub en tiempo real — el frontend debe hacer polling o usar el estado de la evidencia en la DB

## Consecuencias
- ✅ Cero infraestructura adicional para despliegue local
- ✅ Auditoría de jobs integrada en el mismo backup de PostgreSQL
- ✅ Retry y dead-letter queue sin configuración de Redis Streams
- ⚠️ El throughput máximo está limitado por la velocidad de escritura de PostgreSQL (~1000 jobs/seg, suficiente)
- ⚠️ Si en el futuro se necesita procesamiento distribuido multi-servidor, migrar a BullMQ sería necesario

## Referencias
- [pg-boss documentation](https://github.com/timgit/pg-boss)
- `apps/api/src/modules/pgboss/pgboss.service.ts` — Servicio wrapper
- `apps/api/src/modules/evidences/evidence.worker.ts` — Worker de evidencias
