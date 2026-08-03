/**
 * Utilidades para manejar salida JSON estructurada de modelos de IA.
 *
 * Patrón preferido sobre la extracción por regex/palabras clave línea por línea:
 * el modelo devuelve JSON y acá se parsea con validación, con fallback conservador.
 * El fallback nunca inventa valores clínicos/legales: devuelve estructuras vacías
 * para que el consumidor decida cómo manejar la falta de información.
 */

/**
 * Intenta parsear un objeto JSON desde la respuesta del modelo.
 * Orden de intentos:
 *  1. parseo directo del texto completo
 *  2. bloque de código con/sin lenguaje (```json ... ```)
 *  3. primer `{` ... último `}` del texto (el modelo puede agregar prosa alrededor)
 * Si todo falla, devuelve el fallback provisto.
 */
export function extractJson<T>(text: string, fallback: T): T {
  if (!text || text.trim().length === 0) return fallback;

  const trimmed = text.trim();

  // 1. Intento directo
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    /* continuar */
  }

  // 2. Bloque de código con o sin lenguaje
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim()) as T;
    } catch {
      /* continuar */
    }
  }

  // 3. Primer { ... último }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    } catch {
      /* continuar */
    }
  }

  return fallback;
}

/** Normaliza un valor a string (o fallback). */
export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** Normaliza un valor a número finito (o fallback). */
export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Normaliza un valor a array de strings (o fallback). */
export function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return fallback;
}

/** Limita un número a un rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Construye la query de búsqueda RAG a partir del CONTENIDO REAL del caso
 * (transcripción, indicadores, etc.), no de un string fijo igual para todos
 * los casos. Normaliza espacios y recorta al largo máximo de embedding.
 */
export function buildRagQuery(text: string, maxChars = 800): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}
