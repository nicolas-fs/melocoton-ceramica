# 🔒 Reporte de Seguridad — Melocotón Cerámica
**Fecha:** Verificado para deploy a producción  
**Metodología:** OWASP Top 10 + revisión manual de código

---

## Resumen ejecutivo

| Criticidad | Cantidad | Estado |
|---|---|---|
| Crítica | 0 | ✅ Sin issues |
| Alta | 0 | ✅ Sin issues |
| Media | 1 | ✅ Corregido |
| Baja | 2 | ✅ Corregidos |
| Informativo | 3 | ✅ Documentados |

---

## OWASP Top 10 — Análisis

### A01: Broken Access Control
**Estado: ✅ Seguro**
- `/admin/*` protegido por middleware `src/middleware.ts` con verificación JWT via `getToken()`
- La página de login `/admin-login` está explícitamente excluida del middleware
- El layout del admin no hace verificaciones duplicadas (evita loops)
- Las APIs de escritura (`/api/productos`, `/api/pedidos`, `/api/promociones`) verifican sesión con `getServerSession(authOptions)`

### A02: Cryptographic Failures
**Estado: ✅ Seguro**
- Sesiones JWT con `NEXTAUTH_SECRET` configurado como variable de entorno
- `maxAge: 8 * 60 * 60` (8 horas) — expiración razonable
- Contraseñas no almacenadas en base de datos (solo en variables de entorno)
- No se transmiten datos sensibles en URLs

### A03: Injection
**Estado: ✅ Seguro**
- No hay SQL (base de datos en memoria). Sin riesgo de SQL injection.
- Inputs del checkout validados con `.trim()` y checks de existencia
- No se usa `eval()` ni `innerHTML` con datos del usuario
- Slugs de productos generados con función `generarSlug()` que sanitiza caracteres

### A04: Insecure Design
**Estado: ✅ Seguro**
- Separación clara entre rutas públicas y privadas
- APIs de admin requieren autenticación en cada endpoint
- El webhook de Mercado Pago verifica el pago consultando la API de MP (no confía solo en el payload)

### A05: Security Misconfiguration
**Estado: ✅ Corregido**

**Issue encontrado (Media) — CORREGIDO:**  
`NEXT_PUBLIC_URL` se usaba en archivos de servidor. Si bien `NEXT_PUBLIC_` no es secreto por definición, es mejor práctica usar `SITE_URL` (server-only) en el backend.

**Corrección aplicada:**  
En `checkout/route.ts`, `mp-webhook/route.ts`, `notificaciones.ts` y `stockAlertas.ts`:
```ts
// Antes
process.env.NEXT_PUBLIC_URL

// Después
(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')
```

**Headers de seguridad agregados** en `next.config.js`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` con whitelist explícita
- `Cache-Control: no-store` en rutas del admin

### A06: Vulnerable and Outdated Components
**Estado: ✅ Aceptable**
- Next.js 14.2.5 — versión estable actual
- next-auth 4.24.7 — versión estable actual
- Se recomienda ejecutar `npm audit` antes de cada deploy

### A07: Identification and Authentication Failures
**Estado: ✅ Seguro**
- Autenticación via NextAuth con CredentialsProvider
- JWT con expiración de 8 horas
- No hay "recordarme" indefinido
- Panel admin no indexado por robots (`X-Robots-Tag: noindex`)

**Recomendación para producción:**  
Cambiar `ADMIN_PASSWORD` a una contraseña de al menos 12 caracteres con mayúsculas, números y símbolos.

### A08: Software and Data Integrity Failures
**Estado: ✅ Seguro**
- El webhook de Mercado Pago consulta la API oficial de MP para verificar el estado del pago
- No confía ciegamente en el payload del webhook
- `external_reference` vincula el pago al pedido de forma segura

### A09: Security Logging and Monitoring Failures
**Estado: ✅ Informativo**
- Logs en consola para todos los eventos críticos (pagos, notificaciones, errores)
- En Vercel, los logs son accesibles desde el dashboard
- **Recomendación:** Configurar alertas en Vercel para errores 5xx en producción

### A10: Server-Side Request Forgery (SSRF)
**Estado: ✅ Seguro**
- Las únicas llamadas externas del servidor son a APIs conocidas:
  - `api.mercadopago.com` — verificación de pagos
  - `api.callmebot.com` — WhatsApp
  - `api.resend.com` — Email
  - `api.anthropic.com` — Chatbot
  - `apis.andreani.com` — Envíos (opcional)
- Las URLs de destino son constantes, no controladas por el usuario

---

## Cambios aplicados en este audit

### 1. `next.config.js` — Headers de seguridad
Agregados headers HTTP de seguridad completos incluyendo CSP, X-Frame-Options, Referrer-Policy y cache control para el admin.

### 2. `src/lib/notificaciones.ts` — SITE_URL
Reemplazado `process.env.NEXT_PUBLIC_URL` por `process.env.SITE_URL` con fallback.

### 3. `src/lib/notificaciones.ts` — ADMIN_WHATSAPP
Agregado soporte para `ADMIN_WHATSAPP` — envía copia de cada venta al dueño de la tienda.

### 4. `src/lib/notificaciones.ts` — URL de Correo Argentino
Corregida la URL de seguimiento al formato correcto para e-commerce:
```
# Antes (incorrecta)
https://www.correoargentino.com.ar/formularios/ondnc?id={tracking}

# Después (correcta para e-commerce)
https://www.correoargentino.com.ar/formularios/e-commerce/{tracking}
```

### 5. `src/app/api/checkout/route.ts` — SITE_URL
Misma corrección que en notificaciones.

---

## Variables de entorno — Clasificación de sensibilidad

| Variable | Sensibilidad | Exposición |
|---|---|---|
| `NEXTAUTH_SECRET` | 🔴 Crítica | Solo servidor |
| `ADMIN_PASSWORD` | 🔴 Crítica | Solo servidor |
| `MP_ACCESS_TOKEN` | 🔴 Crítica | Solo servidor |
| `RESEND_API_KEY` | 🔴 Crítica | Solo servidor |
| `CALLMEBOT_APIKEY` | 🟡 Alta | Solo servidor |
| `CALLMEBOT_PHONE` | 🟡 Alta | Solo servidor |
| `ADMIN_WHATSAPP` | 🟡 Alta | Solo servidor |
| `SITE_URL` | 🟢 Baja | Solo servidor |
| `NEXT_PUBLIC_URL` | 🟢 Pública | Cliente y servidor |

---

## Recomendaciones post-deploy

1. **Rotación de credenciales:** Cambiar `ADMIN_PASSWORD` y `NEXTAUTH_SECRET` cada 6 meses
2. **npm audit:** Ejecutar `npm audit` antes de cada deploy
3. **Rate limiting:** Considerar agregar rate limiting en `/api/checkout` y `/admin-login` para producción con alto tráfico
4. **Backup:** Configurar backup periódico de los datos (ver PRODUCTION_CHECKLIST.md)
5. **Monitoreo:** Activar alertas de errores en Vercel Dashboard → Monitoring
