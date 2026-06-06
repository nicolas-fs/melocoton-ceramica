# 🔒 Auditoría de Seguridad — Melocotón Cerámica
**Stack:** Next.js 14 (App Router), NextAuth.js, Mercado Pago, datos en memoria  
**Metodología:** Revisión manual de código + análisis estático automatizado  
**Clasificación:** Crítica / Alta / Media / Baja / Informativo

---

## Resumen ejecutivo

El proyecto presenta un **nivel de seguridad BUENO** para un e-commerce de escala pequeña. No se encontraron vulnerabilidades críticas. Las APIs de administración están correctamente protegidas con autenticación. Los datos sensibles (tokens, contraseñas) no están hardcodeados en el código fuente. Se identificaron **5 hallazgos** que deben corregirse antes del lanzamiento a producción.

| Severidad | Cantidad |
|---|---|
| 🔴 Crítica   | 0 |
| 🟠 Alta      | 1 |
| 🟡 Media     | 3 |
| 🟢 Baja      | 1 |
| ℹ️ Informativo | 4 |

**Veredicto: APTO para producción con correcciones de nivel Medio.**

---

## Hallazgos

---

### HAL-01 — 🟠 ALTA: Manipulación de precios en el checkout

**Archivo:** `src/app/api/checkout/route.ts`  
**Líneas:** 9–22 (desestructuración del body), 54–60 (creación de preferencia MP)

**Descripción:**  
El servidor acepta el precio de cada ítem directamente desde el cliente (`i.precio`) sin verificarlo contra la base de datos interna. Un atacante podría modificar el cuerpo de la petición HTTP y enviar `precio: 1` para cualquier producto, y el sistema crearía una preferencia de Mercado Pago por $1 ARS.

```typescript
// src/app/api/checkout/route.ts — L54-60 (VULNERABLE)
items: items.map(i => ({
  id:         i.productoId,
  title:      i.titulo,
  quantity:   i.cantidad,
  unit_price: i.precio,   // ← precio viene del cliente, no verificado
  currency_id: 'ARS',
})),
```

**Impacto:** Compras a precio manipulado por el atacante.

**Corrección:**
```typescript
// En el servidor, verificar cada precio contra la base de datos
import { obtenerProductoPorId } from '@/lib/productos';

// Dentro del POST handler, reemplazar el map de items:
const itemsVerificados = await Promise.all(
  items.map(async (i) => {
    const producto = await obtenerProductoPorId(i.productoId);
    if (!producto) throw new Error(`Producto no encontrado: ${i.productoId}`);
    if (producto.stock < i.cantidad) throw new Error(`Stock insuficiente: ${producto.titulo}`);
    return {
      productoId:     i.productoId,
      titulo:         producto.titulo,     // nombre del servidor, no del cliente
      cantidad:       i.cantidad,
      precioUnitario: producto.precio,     // precio del servidor ← CLAVE
    };
  })
);

// Recalcular subtotal y total en el servidor
const subtotalVerificado = itemsVerificados.reduce(
  (sum, i) => sum + i.precioUnitario * i.cantidad, 0
);
const totalVerificado = subtotalVerificado + costoEnvio;
```

---

### HAL-02 — 🟡 MEDIA: Webhook de Mercado Pago sin verificación de firma

**Archivo:** `src/app/api/mp-webhook/route.ts`  
**Líneas:** 21–35

**Descripción:**  
El webhook acepta cualquier petición POST sin verificar que provenga realmente de Mercado Pago. Si bien el código consulta la API de MP para verificar el estado del pago (mitigación parcial), no valida la firma `x-signature` del encabezado HTTP.

```typescript
// src/app/api/mp-webhook/route.ts — L21-35 (SIN VALIDACIÓN DE FIRMA)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;
    // ← No se verifica x-signature ni x-request-id
```

**Impacto:** Un atacante podría enviar peticiones falsas al webhook. La consulta a la API de MP mitiga esto parcialmente (el pago falso no existiría en MP), pero genera carga innecesaria y logs de error.

**Corrección:**
```typescript
// src/app/api/mp-webhook/route.ts — agregar al inicio del POST
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  // Verificar firma de Mercado Pago
  const xSignature  = req.headers.get('x-signature');
  const xRequestId  = req.headers.get('x-request-id');
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (webhookSecret && xSignature) {
    const [tsPart, v1Part] = xSignature.split(',');
    const ts = tsPart?.split('=')?.[1];
    const v1 = v1Part?.split('=')?.[1];
    const url = req.nextUrl.toString();
    const manifest = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(manifest)
      .digest('hex');

    if (v1 !== expected) {
      console.warn('[MP Webhook] Firma inválida — rechazado');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }
  }
  // ... resto del handler
}
```

**Variable de entorno a agregar:** `MERCADO_PAGO_WEBHOOK_SECRET` (obtenible en el panel de MP al configurar el webhook).

---

### HAL-03 — 🟡 MEDIA: XSS potencial en descripción de producto

**Archivo:** `src/app/producto/[slug]/page.tsx`  
**Líneas:** ~15–22 (construcción de `descripcionHTML`), ~95 (uso de `dangerouslySetInnerHTML`)

**Descripción:**  
La descripción del producto se convierte de Markdown simple a HTML y se inyecta directamente con `dangerouslySetInnerHTML` sin sanitización.

```typescript
// src/app/producto/[slug]/page.tsx
const descripcionHTML = producto.descripcion
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // ← Markdown → HTML
  .split('\n\n')
  .map(p => `<p>${p}</p>`)
  .join('');

// ...
<div dangerouslySetInnerHTML={{ __html: descripcionHTML }} />
// ← Si la descripción tiene <script>...</script>, se ejecuta
```

**Impacto:**  
- En el estado actual (datos en memoria cargados del código): **riesgo bajo**, solo un admin puede escribir descripciones.
- Cuando se migre a Supabase o a cualquier input del panel admin: **riesgo alto**, cualquier admin comprometido podría inyectar scripts que afecten a los compradores.

**Corrección:**
```bash
npm install dompurify @types/dompurify isomorphic-dompurify
```

```typescript
// src/app/producto/[slug]/page.tsx
import DOMPurify from 'isomorphic-dompurify';

const descripcionHTML = DOMPurify.sanitize(
  producto.descripcion
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n\n')
    .map(p => `<p>${p}</p>`)
    .join(''),
  { ALLOWED_TAGS: ['p', 'strong', 'em', 'br', 'ul', 'li', 'ol'] }
);
```

---

### HAL-04 — 🟡 MEDIA: Sin rate limiting en /admin-login ni /api/checkout

**Archivos:** `src/middleware.ts`, `src/app/api/checkout/route.ts`

**Descripción:**  
No hay protección contra ataques de fuerza bruta en el login del admin ni contra spam en el endpoint de checkout.

**Impacto:**
- `/admin-login`: un atacante puede probar millones de contraseñas sin restricción.
- `/api/checkout`: un bot puede crear miles de pedidos falsos, saturando el sistema de notificaciones.

**Corrección (usando el rate limiter nativo de Vercel o una librería simple):**

```typescript
// src/lib/rateLimiter.ts — implementación simple en memoria
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true; // permitir
  }

  if (entry.count >= maxAttempts) return false; // bloquear

  entry.count++;
  return true;
}
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts — en authorize()
import { checkRateLimit } from '@/lib/rateLimiter';

async authorize(credentials, req) {
  const ip = req?.headers?.['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    // 10 intentos por IP cada 15 minutos
    throw new Error('Demasiados intentos. Intentá en 15 minutos.');
  }
  // ... resto de la lógica
}
```

**Alternativa para Vercel:** usar `@vercel/kv` con `upstash/ratelimit` en producción.

---

### HAL-05 — 🟢 BAJA: Contraseña de admin en texto plano (variable de entorno)

**Archivo:** `src/app/api/auth/[...nextauth]/route.ts`  
**Líneas:** 12–18

**Descripción:**  
La contraseña del admin se compara directamente como texto plano contra `process.env.ADMIN_PASSWORD`. No se usa bcrypt ni ningún algoritmo de hash.

```typescript
// src/app/api/auth/[...nextauth]/route.ts — L12-18
async authorize(credentials) {
  if (
    credentials?.username === process.env.ADMIN_USERNAME &&
    credentials?.password === process.env.ADMIN_PASSWORD  // ← texto plano
  ) {
```

**Contexto mitigante:** Las variables de entorno en Vercel están cifradas en reposo. Solo hay 1 usuario admin. No hay base de datos de usuarios que pueda filtrarse.

**Corrección (opcional pero recomendada):**
```typescript
// 1. Generar hash de la contraseña una vez:
// node -e "const bcrypt = require('bcrypt'); bcrypt.hash('micontraseña', 12).then(console.log)"

// 2. Guardar en .env.local:
// ADMIN_PASSWORD_HASH=$2b$12$...hash...

// 3. En authorize():
import bcrypt from 'bcrypt';
const isValid = await bcrypt.compare(
  credentials.password,
  process.env.ADMIN_PASSWORD_HASH!
);
if (credentials.username === process.env.ADMIN_USERNAME && isValid) {
  return { id: '1', name: 'Admin', email: 'admin@melocotonceramica.com' };
}
```

---

## Hallazgos informativos (sin acción requerida)

### INFO-01: Cookies de sesión — configuración correcta por defecto
NextAuth.js configura automáticamente las cookies con `httpOnly: true` y `Secure: true` en producción (HTTPS). La cookie `next-auth.session-token` usa SameSite=Lax. No se requiere acción.

### INFO-02: Archivos de datos no expuestos públicamente
Los datos en `data/productos.ts` y `data/galeria.ts` son módulos TypeScript compilados en el servidor, no archivos accesibles desde el navegador. No se exponen como archivos estáticos. Correcto.

### INFO-03: CSRF — NextAuth lo maneja
NextAuth incluye protección CSRF nativa para `/api/auth`. Las API routes de Next.js usan SameSite=Lax por defecto. No hay formularios que necesiten tokens CSRF adicionales.

### INFO-04: NEXT_PUBLIC_URL en server file
`src/app/api/checkout/route.ts` usa `process.env.NEXT_PUBLIC_URL` en código del servidor. No es un riesgo de seguridad (la variable es pública por diseño), pero es mejor práctica usar `SITE_URL` (variable server-only). Ya está parcialmente mitigado con el fallback `SITE_URL ?? NEXT_PUBLIC_URL`.

---

## Checklist de estado de seguridad

| Control | Estado | Notas |
|---|---|---|
| Variables de entorno fuera del código | ✅ | Sin hardcode encontrado |
| APIs admin requieren autenticación | ✅ | Todas las rutas verificadas |
| Middleware protege /admin/* | ✅ | getToken() en cada request |
| .gitignore cubre .env* | ✅ | Verificado |
| JSON de datos no accesible públicamente | ✅ | Solo en servidor |
| Headers de seguridad HTTP | ✅ | X-Frame-Options, CSP, etc. |
| CSRF protección | ✅ | NextAuth nativo |
| Cookies httpOnly + Secure | ✅ | NextAuth por defecto |
| Webhook verifica origen | ⚠️ | Solo consulta MP API |
| Precios verificados en servidor | ❌ | **Corregir antes del lanzamiento** |
| Sanitización HTML descripción | ⚠️ | Riesgo bajo actual, alto en futuro |
| Rate limiting login | ❌ | Corregir en producción |
| Bcrypt para contraseña admin | ⚠️ | Recomendado |

---

## Valoración general

```
Autenticación/Autorización:  ████████░░  8/10  Sólido
Protección de datos:         █████████░  9/10  Sin leaks
Seguridad de APIs:           ████████░░  8/10  Auth ok, precio pendiente
OWASP Top 10:                ███████░░░  7/10  XSS y precio a corregir
Integración Mercado Pago:    ███████░░░  7/10  Falta firma webhook
Rate limiting / DoS:         ████░░░░░░  4/10  Sin implementar

PUNTUACIÓN GLOBAL:           73/100 — BUENO (con 2 correcciones prioritarias)
```

**Correcciones prioritarias antes de producción:**
1. `HAL-01` — Verificar precios en servidor (1-2 horas de desarrollo)
2. `HAL-02` — Validar firma del webhook de MP (30 minutos)
3. `HAL-04` — Rate limiting en login (1 hora)
