# CHANGELOG — Melocotón Cerámica

## [2.0.0] — Migración a PostgreSQL con Prisma

### Problema que se resuelve
Los productos agregados, editados o eliminados desde el panel admin no se persistían entre deploys. El proyecto usaba un array en memoria (`let _db: Producto[] = []`) en `src/lib/productos.ts` que se reiniciaba con cada restart del servidor de Vercel.

---

### Archivos nuevos

#### `prisma/schema.prisma`
Schema de Prisma con modelos para:
- `Producto` — todos los campos del catálogo
- `Pedido` + `ItemPedido` — historial de ventas
- `ConsultaMayorista` — formularios de mayoristas

#### `prisma/seed.ts`
Script de inicialización que inserta los 12 productos iniciales en la base de datos. Es **idempotente** (no duplica si ya existen).
```bash
npm run db:seed
```

#### `src/lib/prisma.ts`
Singleton del cliente Prisma para Next.js. Evita múltiples instancias en desarrollo por el hot reload.

---

### Archivos modificados

#### `src/lib/productos.ts`
**Antes:** Array en memoria `let _db: Producto[] = []`. Los cambios se perdían al reiniciar.  
**Después:** Todas las funciones (`obtenerProductos`, `crearProducto`, `actualizarProducto`, `eliminarProducto`, `actualizarStock`, `setStock`, `aplicarDescuento`, `quitarDescuento`) usan Prisma para leer y escribir en PostgreSQL.

#### `src/lib/pedidos.ts`
**Antes:** Array en memoria `let _db: Pedido[] = []`.  
**Después:** Todas las funciones usan Prisma. Los pedidos persisten entre deploys.

#### `src/app/api/mayorista/route.ts`
**Antes:** Array en memoria.  
**Después:** Guarda consultas mayoristas en la tabla `consultas_mayorista` de PostgreSQL.

#### `src/app/api/stock/route.ts`
Actualizado para usar `setStock()` de Prisma en lugar del array en memoria.

#### `src/app/api/pedidos/route.ts`
Actualizado para leer desde PostgreSQL.

#### `src/app/api/pedidos/[id]/route.ts`
Actualizado para leer/escribir en PostgreSQL.

#### `package.json`
Agregadas dependencias:
- `@prisma/client: ^5.14.0`
- `prisma: ^5.14.0` (devDependency)

Agregados scripts:
- `db:push` → sincronizar schema con la DB
- `db:studio` → explorador visual de datos
- `db:seed` → cargar productos iniciales
- `postinstall` → `prisma generate` (necesario en Vercel)

#### `.env.local` / `.env.example`
Agregada variable `DATABASE_URL` para la conexión a PostgreSQL.

#### `next.config.js`
Agregado `serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']` para compatibilidad con Prisma en Server Components.

---

### Lo que NO cambió

- La lógica de seguridad (rate limiting, sanitización, verificación de precios, firma webhook MP)
- La estructura de carpetas del proyecto
- Los endpoints de API (mismas URLs, misma autenticación con NextAuth)
- El panel de administración (misma UI, ahora con datos reales persistentes)
- Las páginas del frontend (catálogo, galería, checkout, etc.)
- La configuración de NextAuth

---

### Pasos para activar en producción

#### 1. Crear base de datos en Neon (gratis)
```
1. Ir a https://neon.tech → crear cuenta
2. New Project → nombre: melocoton-ceramica
3. Copiar el "Connection string" (empieza con postgresql://...)
```

#### 2. Configurar variable de entorno
```bash
# En .env.local (desarrollo):
DATABASE_URL=postgresql://user:pass@host:5432/melocoton?sslmode=require

# En Vercel (producción):
# Settings → Environment Variables → DATABASE_URL
```

#### 3. Sincronizar el schema
```bash
npx prisma db push
```

#### 4. Cargar productos iniciales
```bash
npm run db:seed
```

#### 5. Hacer deploy en Vercel
```bash
git add .
git commit -m "Migración a PostgreSQL con Prisma"
git push
```
Vercel ejecuta `prisma generate` automáticamente (via `postinstall`).

---

### Seguridad mantenida
- ✅ Verificación de precios en servidor (HAL-01)
- ✅ Firma webhook Mercado Pago HMAC-SHA256 (HAL-02)
- ✅ Sanitización HTML contra XSS (HAL-03)
- ✅ Rate limiting en login/checkout/mayorista (HAL-04)
- ✅ Bcrypt para contraseña admin (HAL-05)
