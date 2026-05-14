# 🍑 Entrega — Melocotón Cerámica
## Para: Ignacio | De: Tu equipo de desarrollo

---

¡Hola Ignacio! Tu tienda está lista. Acá te dejamos todo lo que necesitás para empezar.

---

## Tu tienda online

**URL:** https://melocoton-ceramica.vercel.app  
*(En cuanto tengas un dominio propio como melocotonceramica.com.ar lo conectamos en 10 minutos)*

---

## Panel de administración

**Dirección:** https://melocoton-ceramica.vercel.app/admin-login

```
Usuario:    admin
Contraseña: melocoton2024
```

> ⚠️ **Importante:** Cambiá esta contraseña apenas puedas entrar.
> Cómo hacerlo: avisanos y lo actualizamos en Vercel → Settings → Environment Variables → ADMIN_PASSWORD

---

## Desde el panel podés

- **📦 Productos** → Agregar, editar y eliminar productos. Subir fotos desde Cloudinary.
- **🛒 Pedidos** → Ver todos los pedidos, cambiar el estado y cargar el número de seguimiento de Correo Argentino.
- **🏷️ Promociones** → Crear descuentos por porcentaje para cualquier producto o categoría.
- **📊 Dashboard** → Ver alertas de stock bajo y resumen de ventas.

---

## Cómo funciona cuando alguien compra

1. El cliente elige sus piezas y hace el checkout
2. Paga con Mercado Pago o transferencia bancaria
3. **A vos te llega un WhatsApp** con las piezas a preparar y la dirección de envío
4. **Al cliente le llega un email** con el comprobante de compra
5. Cuando despachás el paquete en Correo Argentino, entrás al panel, abrís el pedido y cargás el número de seguimiento
6. **Al cliente le llega automáticamente** el número de tracking por WhatsApp y email para que siga su paquete

---

## Lo que probamos y funciona

- ✅ Flujo de compra completo con Mercado Pago (sandbox)
- ✅ Notificación de WhatsApp al recibir un pedido
- ✅ Email de comprobante al cliente
- ✅ Carga de número de tracking desde el admin
- ✅ Notificación de tracking al cliente (WhatsApp + email)
- ✅ Panel admin con productos, pedidos y promociones
- ✅ Sitio responsive en móvil y escritorio
- ✅ Galería con fotos de Instagram
- ✅ Chatbot de consultas
- ✅ Sistema de alertas de stock bajo

---

## Lo que falta configurar (para que funcione al 100%)

### Obligatorio para cobrar
1. **Mercado Pago en modo producción** — Entrá a mercadopago.com.ar/developers, activá las credenciales de producción y avisanos para actualizar el `MP_ACCESS_TOKEN`.

### Para las notificaciones
2. **WhatsApp (CallMeBot)** — Mandá "I allow callmebot to send me messages" al +34 644 44 17 19 y compartinos la apikey que te responden.
3. **Email (Resend)** — Registrate en resend.com y verificá tu dominio para que los emails salgan de pedidos@melocotonceramica.com.ar.

### Para las fotos
4. **Imágenes de productos** — Registrate en cloudinary.com (gratis), subí las fotos de tus piezas y cargá las URLs desde el panel admin.

---

## Si algo no funciona

1. Revisá el archivo `PRODUCCION.md` — tiene instrucciones paso a paso para cada cosa.
2. Revisá el `PRODUCTION_CHECKLIST.md` — tiene la lista de todo lo que hay que verificar.
3. Avisanos y lo miramos juntos.

---

## Seguridad implementada

- 🔒 Panel admin protegido con usuario y contraseña
- 🔒 Sesiones con expiración de 8 horas
- 🔒 Todas las variables sensibles fuera del código
- 🔒 Headers de seguridad HTTP configurados
- 🔒 El sitio no aparece en Google (el panel de admin)

---

¡Mucha suerte con la tienda, Ignacio! 🍑  
Cada pieza que vendas tiene la magia de lo hecho a mano.
