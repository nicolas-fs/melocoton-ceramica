# 🚀 Guía de Deploy — Melocotón Cerámica

Tiempo estimado: **20 minutos**

---

## PASO 1 — Preparar el código en GitHub

### 1.1 Instalar Git (si no lo tenés)
Descargá de https://git-scm.com/download/win e instalá con todo por defecto.

### 1.2 Crear cuenta en GitHub
Entrá a https://github.com y creá una cuenta gratuita.

### 1.3 Subir el proyecto
Abrí PowerShell en la carpeta `proyecto-final` y ejecutá:

```powershell
git init
git add .
git commit -m "Melocotón Cerámica v1.0"
```

Luego en GitHub: **New repository** → nombre: `melocoton-ceramica` → **Create repository**

Copiá los comandos que te da GitHub (parecidos a estos):
```powershell
git remote add origin https://github.com/TU-USUARIO/melocoton-ceramica.git
git branch -M main
git push -u origin main
```

---

## PASO 2 — Deploy en Vercel (hosting gratuito)

### 2.1 Crear cuenta en Vercel
Entrá a https://vercel.com → **Sign up with GitHub** → autorizá.

### 2.2 Importar el proyecto
1. En Vercel: **Add New → Project**
2. Buscá `melocoton-ceramica` → **Import**
3. Framework: **Next.js** (lo detecta solo)
4. **NO toques nada más todavía** — primero configurá las variables de entorno

### 2.3 Configurar variables de entorno en Vercel
En la misma pantalla, abrí **Environment Variables** y agregá estas:

| Variable | Valor | Dónde obtenerlo |
|---|---|---|
| `NEXTAUTH_SECRET` | texto aleatorio largo | https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | `https://TU-DOMINIO.vercel.app` | Lo sabés después del primer deploy |
| `ADMIN_USERNAME` | `admin` | Lo que quieras |
| `ADMIN_PASSWORD` | contraseña segura | Lo que quieras |
| `MP_ACCESS_TOKEN` | `TEST-xxx` o `APP_USR-xxx` | mercadopago.com.ar/developers |
| `NEXT_PUBLIC_URL` | `https://TU-DOMINIO.vercel.app` | Después del primer deploy |

Las opcionales (podés agregarlas después):
| Variable | Para qué sirve |
|---|---|
| `CALLMEBOT_PHONE` | WhatsApp cuando entra un pedido |
| `CALLMEBOT_APIKEY` | WhatsApp cuando entra un pedido |
| `ANTHROPIC_API_KEY` | Chatbot con IA real |
| `STOCK_ALERTA_UMBRAL` | Cuándo alertar stock bajo (default: 3) |

### 2.4 Hacer el primer deploy
Click en **Deploy** → esperá 2-3 minutos → ¡listo!

Vercel te da una URL tipo `melocoton-ceramica.vercel.app`.

---

## PASO 3 — Post-deploy (configuraciones finales)

### 3.1 Actualizar NEXTAUTH_URL y NEXT_PUBLIC_URL
En Vercel → tu proyecto → **Settings → Environment Variables**:
- Cambiá `NEXTAUTH_URL` a tu URL real: `https://melocoton-ceramica.vercel.app`
- Cambiá `NEXT_PUBLIC_URL` igual

Luego: **Deployments → Redeploy** para que tome los cambios.

### 3.2 Configurar webhook de Mercado Pago
1. Entrá a mercadopago.com.ar/developers
2. Tu aplicación → **Webhooks → Configurar**
3. URL: `https://TU-DOMINIO.vercel.app/api/mp-webhook`
4. Eventos: **payment**
5. Guardar

### 3.3 Probar el panel admin
Entrá a `https://TU-DOMINIO.vercel.app/admin-login` con tu usuario y contraseña.

### 3.4 Subir fotos de productos (opcional pero recomendado)
1. Registrate en https://cloudinary.com (gratis)
2. Subí las fotos en **Media Library → Upload**
3. Copiá la URL de cada foto
4. Pegá las URLs en el panel admin → Productos → editar cada producto

---

## PASO 4 — Dominio propio (opcional)

Si querés `melocotonceramica.com.ar`:
1. Comprá el dominio en NIC Argentina (https://nic.ar) o Donweb (~$2.000/año)
2. En Vercel → **Settings → Domains → Add**
3. Seguí las instrucciones para apuntar los DNS

---

## Checklist final antes de anunciar

- [ ] Panel admin funciona en `/admin-login`
- [ ] Crear al menos 1 producto con foto real
- [ ] Probar el checkout completo (usar tarjeta de prueba de MP)
- [ ] Configurar webhook de Mercado Pago
- [ ] Activar notificaciones de WhatsApp (CallMeBot)
- [ ] Subir fotos reales de productos
- [ ] Actualizar número de WhatsApp en `src/lib/utils.ts`
- [ ] Activar cuenta de Instagram: @melocoton.ceramica

---

## Solución de problemas comunes

**El build falla:**
```
Revisá que todas las variables de entorno estén cargadas en Vercel
Vercel → Settings → Environment Variables
```

**No puedo entrar al admin:**
```
URL correcta: tu-dominio.vercel.app/admin-login (no /admin/login)
Verificá ADMIN_USERNAME y ADMIN_PASSWORD en Vercel
```

**Los pagos no funcionan:**
```
En modo TEST: usá tarjeta 4509 9535 6623 3704, venc 11/25, CVV 123
Para producción: cambiá MP_ACCESS_TOKEN a APP_USR-...
```

**El webhook de MP no recibe eventos:**
```
Verificá que la URL esté exactamente así:
https://TU-DOMINIO.vercel.app/api/mp-webhook
```
