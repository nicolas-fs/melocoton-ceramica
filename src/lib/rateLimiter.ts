// ============================================================
// RATE LIMITER — Melocotón Cerámica
// HAL-04 FIX: Protección contra fuerza bruta y spam
//
// Implementación en memoria — válida para un solo proceso.
// Para producción con múltiples instancias: usar @upstash/ratelimit
// con Vercel KV (plan gratuito disponible).
// ============================================================

interface RateLimitEntry {
 count: number;
 resetAt: number;
 blocked: boolean;
}

// Almacenamiento en memoria
const store = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 5 minutos
if (typeof setInterval !== 'undefined') {
 setInterval(() => {
 const now = Date.now();
 for (const [key, entry] of store.entries()) {
 if (now > entry.resetAt) store.delete(key);
 }
 }, 5 * 60 * 1000);
}

export interface RateLimitResult {
 allowed: boolean;
 remaining: number;
 resetIn: number; // segundos hasta que se reinicia el contador
 retryAfter: number; // segundos para reintentar si fue bloqueado
}

/**
 * Verifica si una clave (IP, userAgent, etc.) ha superado el límite.
 *
 * @param key - Identificador único (ej: `login:IP`, `checkout:IP`)
 * @param maxAttempts - Máximo de intentos en la ventana
 * @param windowMs - Tamaño de la ventana en milisegundos
 * @param blockMs - Tiempo de bloqueo al superar el límite (ms)
 */
export function checkRateLimit(
 key: string,
 maxAttempts: number,
 windowMs: number,
 blockMs?: number
): RateLimitResult {
 const now = Date.now();
 const entry = store.get(key);

 // Entrada nueva o ventana expirada
 if (!entry || now > entry.resetAt) {
 store.set(key, { count: 1, resetAt: now + windowMs, blocked: false });
 return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs / 1000, retryAfter: 0 };
 }

 // Bloqueado activamente
 if (entry.blocked && now <= entry.resetAt) {
 return {
 allowed: false,
 remaining: 0,
 resetIn: Math.ceil((entry.resetAt - now) / 1000),
 retryAfter: Math.ceil((entry.resetAt - now) / 1000),
 };
 }

 // Dentro de la ventana — incrementar contador
 entry.count++;

 if (entry.count > maxAttempts) {
 // Supera el límite — bloquear
 const duration = blockMs ?? windowMs;
 entry.blocked = true;
 entry.resetAt = now + duration;
 store.set(key, entry);
 return {
 allowed: false,
 remaining: 0,
 resetIn: Math.ceil(duration / 1000),
 retryAfter: Math.ceil(duration / 1000),
 };
 }

 store.set(key, entry);
 return {
 allowed: true,
 remaining: maxAttempts - entry.count,
 resetIn: Math.ceil((entry.resetAt - now) / 1000),
 retryAfter: 0,
 };
}

/**
 * Obtiene la IP real del cliente considerando proxies (Vercel).
 */
export function getClientIp(req: Request): string {
 const headers = req instanceof Request ? req.headers : (req as any).headers;
 return (
 (typeof headers.get === 'function'
 ? headers.get('x-forwarded-for')?.split(',')[0]?.trim()
 : (headers as any)['x-forwarded-for']?.split(',')[0]?.trim()
 ) ?? 'unknown'
 );
}

// ── Configuraciones presets ───────────────────────────────

/** Login admin: 10 intentos / 15 minutos, bloqueo de 30 minutos */
export const RATE_LIMIT_LOGIN = {
 maxAttempts: 10,
 windowMs: 15 * 60 * 1000,
 blockMs: 30 * 60 * 1000,
};

/** Checkout: 20 pedidos / hora por IP */
export const RATE_LIMIT_CHECKOUT = {
 maxAttempts: 20,
 windowMs: 60 * 60 * 1000,
 blockMs: 2 * 60 * 60 * 1000,
};

/** API mayorista: 5 consultas / hora */
export const RATE_LIMIT_MAYORISTA = {
 maxAttempts: 5,
 windowMs: 60 * 60 * 1000,
 blockMs: 60 * 60 * 1000,
};
