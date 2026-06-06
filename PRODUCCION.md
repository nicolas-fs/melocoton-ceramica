# 🚀 Guía de Producción — Melocotón Cerámica
# Tiempo estimado: 45 minutos

Seguí este orden exacto. No saltees pasos.

---

## PARTE 1 — GitHub (10 minutos)
### Dónde va a vivir el código

**¿Por qué GitHub?**
Vercel (el hosting) lee el código desde GitHub. Cada vez que hagás un cambio,
se actualiza automáticamente la página.

### Paso 1.1 — Crear cuenta
→ Abrí https://github.com
→ Click en "Sign up"
→ Completá email, contraseña, nombre de usuario

### Paso 1.2 — Crear repositorio
→ Una vez adentro, click en el botón verde "New" (arriba a la izquierda)
→ Repository name: `melocoton-ceramica`
→ Dejalo en "Private" (para que nadie más vea el código)
→ Click "Create repository"
→ Copiá la URL que te da (algo como: https://github.com/TU-USUARIO/melocoton-ceramica.git)

### Paso 1.3 — Instalar Git en tu computadora
→ Bajalo de: https://git-scm.com/download/win
→ Instalalo con todo por defecto (Next, Next, Next...)
→ Reiniciá la computadora

### Paso 1.4 — Subir el código
Abrí PowerShell en la carpeta `proyecto-final` y ejecutá estos comandos
UNO POR UNO (copiá, pegá, Enter):

```
git init
git add .
git commit -m "Melocoton Ceramica v1.0"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/melocoton-ceramica.git
git push -u origin main
```

⚠️  Reemplazá TU-USUARIO por tu nombre de usuario de GitHub
⚠️  Te va a pedir usuario y contraseña de GitHub

Si todo salió bien: entrá a github.com/TU-USUARIO/melocoton-ceramica
y deberías ver todos los archivos del proyecto.

---

## PARTE 2 — Mercado Pago (10 minutos)
### Para cobrar online

### Paso 2.1 — Activar cuenta de vendedor
→ Entrá a mercadopago.com.ar
→ Iniciá sesión con la cuenta de tu cliente (o creá una nueva)
→ Si aún no está verificada, completá los datos de la cuenta

### Paso 2.2 — Crear la aplicación
→ Andá a: mercadopago.com.ar/developers/panel
→ Click en "Crear aplicación"
→ Nombre: `Melocotón Cerámica`
→ ¿Para qué la usás?: "Pagos online"
→ Producto: "CheckoutPro"
→ Guardá

### Paso 2.3 — Obtener el Access Token
→ Dentro de tu aplicación → "Credenciales"
→ Verás dos secciones: PRUEBA y PRODUCCIÓN

Para PRUEBA (mientras configurás):
→ Copiá "Access Token" que empieza con TEST-

Para PRODUCCIÓN (para cobrar de verdad):
→ Completá los datos del negocio que te piden
→ Copiá "Access Token" que empieza con APP_USR-

Guardá ese token, lo vas a necesitar en el paso 4.

---

## PARTE 3 — WhatsApp automático (5 minutos)
### Para recibir el aviso de cada pedido

### Paso 3.1 — Activar CallMeBot
→ En el celular donde querés recibir los avisos:
→ Guardá el número +34 644 44 17 19 como contacto "CallMeBot"
→ Mandales este mensaje exacto por WhatsApp:
   "I allow callmebot to send me messages"
→ En 2 minutos te responden con tu APIKEY (un número)
→ Anotá esa apikey

### Paso 3.2 — Tu número de WhatsApp
El formato es: 549 + código de área sin el 0 + número sin el 15

Ejemplos:
- Carlos Paz (0354) → 5493542XXXXXXX
- Córdoba Capital (0351) → 5493515XXXXXXX
- Buenos Aires (011) → 54911XXXXXXXX

---

## PARTE 4 — Email de comprobantes (5 minutos)
### Para que los clientes reciban su comprobante

### Paso 4.1 — Crear cuenta en Resend
→ Andá a: resend.com
→ Click "Sign Up" → usá tu email
→ Es GRATIS hasta 3.000 emails por mes

### Paso 4.2 — Verificar tu dominio (si tenés)
Si tenés un dominio propio (ej: melocotonceramica.com.ar):
→ Resend → Domains → Add Domain
→ Seguí las instrucciones de DNS que te dan
→ Los emails van a salir desde: pedidos@melocotonceramica.com.ar

Si NO tenés dominio propio todavía:
→ Podés mandar desde el dominio que te da Resend
→ Los emails van a salir desde: onboarding@resend.dev
→ Funciona igual, solo que no se ve tan profesional
→ Lo podés cambiar después

### Paso 4.3 — Obtener la API Key
→ Resend → API Keys → Create API Key
→ Nombre: `Melocotón Cerámica`
→ Copiá la key que empieza con re_

---

## PARTE 5 — Vercel (el hosting gratuito) (10 minutos)
### Acá va a vivir la página

### Paso 5.1 — Crear cuenta
→ Andá a: vercel.com
→ Click "Sign Up"
→ Elegí "Continue with GitHub" → autorizá

### Paso 5.2 — Importar el proyecto
→ Click "Add New → Project"
→ Buscá "melocoton-ceramica" → click "Import"
→ Framework: Next.js (lo detecta solo)
→ ¡¡¡NO HAGAS DEPLOY TODAVÍA!!! Primero configurá las variables

### Paso 5.3 — Cargar las variables de entorno
Abrí la sección "Environment Variables" y cargá estas UNA POR UNA:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VARIABLES OBLIGATORIAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: NEXTAUTH_SECRET
Value: (generá uno en https://generate-secret.vercel.app/32 y copialo)

Name: NEXTAUTH_URL
Value: https://melocoton-ceramica.vercel.app
(esta URL la sabés después del primer deploy — por ahora poné esta)

Name: NEXT_PUBLIC_URL
Value: https://melocoton-ceramica.vercel.app
(igual que la anterior)

Name: ADMIN_USERNAME
Value: admin

Name: ADMIN_PASSWORD
Value: (elegí una contraseña segura, ej: Mel0c0ton2024!)

Name: MP_ACCESS_TOKEN
Value: (el token de Mercado Pago que copiaste en el Paso 2.3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VARIABLES OPCIONALES (podés agregarlas después)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: CALLMEBOT_PHONE
Value: (tu número en formato 549XXXXXXXXXX)

Name: CALLMEBOT_APIKEY
Value: (la apikey que te mandó CallMeBot)

Name: RESEND_API_KEY
Value: (la key de Resend que empieza con re_)

Name: EMAIL_FROM
Value: Melocotón Cerámica <pedidos@melocotonceramica.com.ar>
(o si no tenés dominio: Melocotón Cerámica <onboarding@resend.dev>)

Name: EMAIL_ADMIN
Value: (el email donde querés recibir copia de cada pedido)

Name: STOCK_ALERTA_UMBRAL
Value: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Paso 5.4 — Hacer el deploy
→ Click "Deploy"
→ Esperá 3-5 minutos (verás logs en pantalla)
→ Si aparece ✓ "Congratulations!" → ¡éxito!
→ Vercel te da una URL tipo: melocoton-ceramica.vercel.app

### Paso 5.5 — Actualizar las URLs
Ahora que sabés la URL real:
→ Vercel → tu proyecto → Settings → Environment Variables
→ Editá NEXTAUTH_URL y NEXT_PUBLIC_URL con la URL real
→ Volvé a Deployments → click en los tres puntos → Redeploy

---

## PARTE 6 — Dominio propio (opcional pero recomendado)
### Para que sea melocotonceramica.com.ar en vez de melocoton-ceramica.vercel.app

### Opción A — NIC Argentina (más barato, .com.ar)
→ Andá a: nic.ar
→ Buscá "melocotonceramica"
→ Costo: ~$4.000 ARS por año
→ Necesitás CUIT/CUIL para registrar

### Opción B — Namecheap (fácil, .com internacional)
→ Andá a: namecheap.com
→ Buscá "melocotonceramica"
→ Costo: ~USD 10-15 por año
→ Más fácil de configurar, acepta tarjeta

### Cómo conectar el dominio a Vercel
1. En Vercel → tu proyecto → Settings → Domains
2. Click "Add" → escribí tu dominio (ej: melocotonceramica.com.ar)
3. Vercel te da dos registros DNS (tipo A o CNAME)
4. Entrás al panel de NIC o Namecheap → DNS Settings
5. Agregás esos registros
6. Esperás entre 10 minutos y 24 horas
7. ¡Tu dominio apunta a la página!

---

## PARTE 7 — Configurar el webhook de Mercado Pago
### Para que los pagos se confirmen automáticamente

Una vez que el sitio está online:
→ mercadopago.com.ar/developers → tu aplicación
→ Webhooks → Configurar
→ URL: https://TU-DOMINIO/api/mp-webhook
→ Eventos: seleccioná "payment"
→ Guardar

---

## PARTE 8 — Verificación final

Probá cada cosa en este orden:

☐ 1. Abrí https://TU-DOMINIO — ¿Carga la home?
☐ 2. Andá a /admin-login — ¿Podés entrar con tu usuario y contraseña?
☐ 3. Agregá un producto desde /admin/productos
☐ 4. Hacé una compra de prueba (con tarjeta de test de MP):
      Número: 4509 9535 6623 3704
      Vencimiento: 11/25
      CVV: 123
      Nombre: APRO (para que se apruebe)
☐ 5. ¿Llegó el WhatsApp con el detalle del pedido?
☐ 6. ¿Llegó el email de comprobante al cliente?
☐ 7. Cargá un número de tracking en /admin/pedidos
☐ 8. ¿Llegó el WhatsApp y email con el tracking?

---

## Ayuda rápida — Errores comunes

### "Build failed" en Vercel
→ Verificá que todas las variables obligatorias estén cargadas
→ En Vercel: Settings → Environment Variables

### "No puedo entrar al admin"
→ URL correcta: tu-sitio.com/admin-login (sin /admin/ adelante)
→ Credenciales están en las variables ADMIN_USERNAME y ADMIN_PASSWORD

### "Los pagos no se aprueban"
→ En modo prueba: el token empieza con TEST-
→ Para cobrar de verdad: el token empieza con APP_USR-
→ El webhook debe estar configurado en el panel de MP

### "No llegan los WhatsApp"
→ Verificá que CALLMEBOT_PHONE tenga el formato 549XXXXXXXXXX (sin + ni espacios)
→ Verificá que mandaste el mensaje de activación a CallMeBot
→ La apikey es un número de 6 cifras

### "No llegan los emails"
→ Verificá que RESEND_API_KEY empiece con re_
→ Si estás en pruebas: el email de destino debe estar verificado en Resend
→ En producción: el dominio debe estar verificado

---

## Checklist de variables para Vercel

Copiá y completá esto antes de hacer el deploy:

NEXTAUTH_SECRET     = [generar en generate-secret.vercel.app/32]
NEXTAUTH_URL        = https://TU-DOMINIO.vercel.app
NEXT_PUBLIC_URL     = https://TU-DOMINIO.vercel.app
ADMIN_USERNAME      = admin
ADMIN_PASSWORD      = [tu contraseña segura]
MP_ACCESS_TOKEN     = [TEST-xxx o APP_USR-xxx de Mercado Pago]
CALLMEBOT_PHONE     = 549[tu número]
CALLMEBOT_APIKEY    = [la apikey que te mandó CallMeBot]
RESEND_API_KEY      = re_[tu key de Resend]
EMAIL_FROM          = Melocotón Cerámica <pedidos@TU-DOMINIO>
EMAIL_ADMIN         = [tu email donde recibís copias]
STOCK_ALERTA_UMBRAL = 3
