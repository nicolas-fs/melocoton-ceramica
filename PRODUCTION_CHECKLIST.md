# ✅ Checklist de Producción — Melocotón Cerámica

Completar en orden. Marcar cada ítem antes del lanzamiento.

---

## BLOQUE 1 — Variables de entorno en Vercel

Ir a: Vercel → tu proyecto → Settings → Environment Variables

- [ ] `NEXTAUTH_SECRET` — generado en https://generate-secret.vercel.app/32
- [ ] `NEXTAUTH_URL` — URL completa del sitio (ej: https://melocoton-ceramica.vercel.app)
- [ ] `NEXT_PUBLIC_URL` — igual que NEXTAUTH_URL
- [ ] `SITE_URL` — igual que NEXTAUTH_URL (versión server-only)
- [ ] `ADMIN_USERNAME` — nombre de usuario del panel admin
- [ ] `ADMIN_PASSWORD` — contraseña segura (mínimo 12 caracteres)
- [ ] `MP_ACCESS_TOKEN` — token de Mercado Pago (TEST- para prueba, APP_USR- para producción)
- [ ] `MERCADO_PAGO_WEBHOOK_SECRET` — string aleatorio para validar webhooks
- [ ] `CALLMEBOT_PHONE` — número en formato 549XXXXXXXXXX
- [ ] `CALLMEBOT_APIKEY` — apikey de CallMeBot
- [ ] `ADMIN_WHATSAPP` — número de Ignacio en formato 549XXXXXXXXXX
- [ ] `RESEND_API_KEY` — key de Resend (re_...)
- [ ] `EMAIL_FROM` — remitente verificado en Resend
- [ ] `EMAIL_ADMIN` — email de Ignacio para copias
- [ ] `STOCK_ALERTA_UMBRAL` — 3 (o el número que prefieran)

---

## BLOQUE 2 — Mercado Pago

- [ ] Cuenta de MP verificada con datos del negocio
- [ ] Aplicación creada en mercadopago.com.ar/developers
- [ ] **Modo PRUEBA:** Access Token empieza con TEST-
- [ ] **Modo PRODUCCIÓN:** Access Token empieza con APP_USR-
- [ ] Webhook configurado en MP:
  - URL: `https://TU-DOMINIO/api/mp-webhook`
  - Evento: `payment`
- [ ] Flujo de pago probado con tarjeta de prueba:
  - Número: `4509 9535 6623 3704`
  - Vencimiento: cualquier fecha futura
  - CVV: `123`
  - Nombre: `APRO` (para que se apruebe)
- [ ] Verificado que al aprobar un pago el pedido cambia a "pagado"
- [ ] Verificado flujo de pago rechazado (nombre: `OTHE`)
- [ ] Verificado flujo de pago pendiente (nombre: `CONT`)

---

## BLOQUE 3 — Notificaciones

### WhatsApp (CallMeBot)
- [ ] Contacto "CallMeBot" (+34 644 44 17 19) guardado en el celular
- [ ] Mensaje de activación enviado: "I allow callmebot to send me messages"
- [ ] Apikey recibida y cargada en `CALLMEBOT_APIKEY`
- [ ] `CALLMEBOT_PHONE` configurado (número que recibe notificaciones de pedidos)
- [ ] `ADMIN_WHATSAPP` configurado con el número de Ignacio
- [ ] Prueba: hacer un pedido de prueba y verificar que llega el WhatsApp
- [ ] Verificado que llega el resumen de venta al WhatsApp de Ignacio

### Email (Resend)
- [ ] Cuenta creada en resend.com
- [ ] Dominio verificado (o usar dominio de Resend para empezar)
- [ ] API Key generada y cargada en `RESEND_API_KEY`
- [ ] `EMAIL_FROM` configurado con remitente verificado
- [ ] `EMAIL_ADMIN` configurado con el email de Ignacio
- [ ] Prueba: hacer un pedido y verificar que el cliente recibe el email
- [ ] Verificar que el email llega a la bandeja principal (no spam)

---

## BLOQUE 4 — Correo Argentino (Tracking)

- [ ] Entrar al panel admin: `/admin-login`
- [ ] Ir a un pedido de prueba → abrir detalle → "Cargar tracking"
- [ ] Ingresar número de prueba (ej: `RR123456789AR`)
- [ ] Verificar que el pedido pasa a estado "Enviado"
- [ ] Verificar que el cliente recibe WhatsApp con el número de tracking
- [ ] Verificar que el cliente recibe email con botón "Seguir mi paquete"
- [ ] Verificar que el link de seguimiento abre Correo Argentino correctamente

---

## BLOQUE 5 — Panel Admin

- [ ] Acceso verificado en `/admin-login`
- [ ] **Productos:** crear producto de prueba → editarlo → eliminarlo
- [ ] **Stock:** click en badge de stock → editar inline → guardar
- [ ] **Pedidos:** cambiar estado de un pedido → verificar que se actualiza
- [ ] **Promociones:** crear promoción → activar → verificar en catálogo → desactivar
- [ ] **Dashboard:** verificar que las alertas de stock bajo aparecen correctamente

---

## BLOQUE 6 — Frontend

- [ ] Home carga correctamente
- [ ] Catálogo muestra todos los productos
- [ ] Galería carga (las imágenes de Instagram pueden tardar)
- [ ] Agregar producto al carrito funciona
- [ ] Checkout completo funciona end-to-end
- [ ] Confirmación de pedido se muestra correctamente
- [ ] Chatbot responde (con o sin API key)
- [ ] Botón de WhatsApp flotante funciona
- [ ] Página de contacto funciona

---

## BLOQUE 7 — SEO y Performance

- [ ] `robots.txt` accesible en `/robots.txt`
- [ ] `sitemap.xml` accesible en `/sitemap.xml`
- [ ] Panel admin NO indexado (verificar con `X-Robots-Tag: noindex`)
- [ ] Imágenes de productos cargadas (Cloudinary o locales)
- [ ] Logo visible en navbar y footer
- [ ] Sitio responsive en móvil (verificar en Chrome DevTools)
- [ ] Lighthouse score > 70 en Performance, > 90 en Accessibility

---

## BLOQUE 8 — Seguridad

- [ ] `.env.local` NO subido a GitHub (verificar en github.com/tu-repo)
- [ ] `.env.production.example` subido SIN valores reales
- [ ] `NEXTAUTH_SECRET` diferente al de desarrollo
- [ ] `ADMIN_PASSWORD` cambiada del valor por defecto
- [ ] Headers de seguridad activos (verificar en https://securityheaders.com)

---

## BLOQUE 9 — Backup

El proyecto usa datos en memoria (se pierden al reiniciar). Para producción real:

- [ ] Configurar Supabase con el schema en `supabase/schema.sql`
- [ ] Activar los repositorios en `src/lib/supabase/`
- [ ] O implementar script de backup periódico si se quedan con in-memory

---

## BLOQUE 10 — Entrega al cliente

- [ ] URL del sitio entregada a Ignacio
- [ ] Credenciales del admin entregadas de forma segura (no por email)
- [ ] Instrucciones para cambiar contraseña entregadas
- [ ] PRODUCCION.md entregado con toda la guía
- [ ] Número de WhatsApp actualizado en `src/lib/utils.ts`

---

## 🎉 Go-live

Cuando todos los bloques estén completos, el sitio está listo para recibir clientes.

**URL de producción:** https://melocoton-ceramica.vercel.app  
**Panel admin:** https://melocoton-ceramica.vercel.app/admin-login
