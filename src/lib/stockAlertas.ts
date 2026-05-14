// ============================================================
// ALERTAS DE STOCK — Melocotón Cerámica
//
// Se ejecuta automáticamente cuando:
// 1. Se procesa un pago (webhook de MP)
// 2. Se actualiza el stock manualmente desde el admin
//
// Canales disponibles:
// A) WhatsApp via CallMeBot (gratis, mismo sistema que los pedidos)
// B) Email via Resend (opcional)
//
// Variables en .env.local:
//   CALLMEBOT_PHONE=549XXXXXXXXXX
//   CALLMEBOT_APIKEY=XXXXXX
//   STOCK_ALERTA_UMBRAL=3   (opcional, default = 3 unidades)
// ============================================================

interface ProductoBasico {
  id: string;
  titulo: string;
  stock: number;
  categoria: string;
}

// Umbral configurable — si el stock llega a este número o menos, se envía alerta
const UMBRAL_DEFAULT = Number(process.env.STOCK_ALERTA_UMBRAL ?? 3);

export async function verificarYAlertarStock(producto: ProductoBasico): Promise<void> {
  const umbral = UMBRAL_DEFAULT;

  // Solo alertar si el stock es bajo pero no cero (para cero hay otro aviso)
  if (producto.stock > umbral) return;

  const phone  = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  const emoji   = producto.stock === 0 ? '🔴' : '🟡';
  const estado  = producto.stock === 0 ? 'SIN STOCK' : `STOCK BAJO (${producto.stock} unidades)`;

  const mensaje = `${emoji} *ALERTA DE STOCK — Melocotón Cerámica*

Producto: *${producto.titulo}*
Categoría: ${producto.categoria}
Stock actual: *${producto.stock} unidades*
Estado: ${estado}

${producto.stock === 0
  ? '⚠️ Este producto no se puede vender. Reponer urgente.'
  : `⚠️ Quedan pocas unidades. Umbral de alerta: ${umbral}`
}

🔗 Gestionar: ${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/admin/productos`;

  // Loguear siempre en consola (visible en Vercel logs)
  console.warn(`[STOCK ALERTA] ${producto.titulo}: ${producto.stock} unidades`);

  if (!phone || !apikey) return; // sin configurar, solo log

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
    const res = await fetch(url);
    if (res.ok) {
      console.log(`[STOCK ALERTA] WhatsApp enviado ✓ para ${producto.titulo}`);
    }
  } catch (err) {
    console.error('[STOCK ALERTA] Error al enviar WhatsApp:', err);
  }
}

// Verificar múltiples productos de una vez (útil post-checkout)
export async function verificarStockMultiple(
  productos: ProductoBasico[]
): Promise<void> {
  for (const p of productos) {
    await verificarYAlertarStock(p);
  }
}
