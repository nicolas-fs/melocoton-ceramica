// ============================================================
// NOTIFICACIONES — Melocotón Cerámica
// ============================================================

import { Pedido } from '@/types';
import { formatearPrecio } from './utils';

// ── HELPERS ───────────────────────────────────────────────

function nombreMetodoPago(metodo: string): string {
  return metodo === 'mercadopago' ? 'Mercado Pago' : 'Transferencia bancaria';
}

function nombreEstado(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'Pendiente de pago',
    pagado:    'Pago confirmado',
    enviado:   'En camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return map[estado] ?? estado;
}

// ── 1. WHATSAPP A LA ARTESANA ─────────────────────────────

export async function enviarWhatsAppArtesana(pedido: Pedido): Promise<void> {
  const phone  = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.log('[WhatsApp] Sin configurar.');
    _logPedidoConsola(pedido);
    return;
  }

  const idCorto = pedido.id.slice(-6).toUpperCase();
  const piezas = pedido.items
    .map(i => `  📦 ${i.titulo}\n     Cantidad: *${i.cantidad}*\n     Precio unitario: ${formatearPrecio(i.precioUnitario)}`)
    .join('\n\n');

  const mensaje = [
    `🍑 *NUEVO PEDIDO #${idCorto}*`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *PIEZAS A PREPARAR*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    piezas,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📬 *DATOS DE ENVÍO*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 ${pedido.cliente.nombre}`,
    `📍 ${pedido.cliente.direccion}`,
    `    ${pedido.cliente.ciudad}, ${pedido.cliente.provincia}`,
    `    CP: ${pedido.cliente.codigoPostal}`,
    `📱 ${pedido.cliente.telefono}`,
    `📧 ${pedido.cliente.email}`,
    pedido.opcionEnvio ? `🚚 Envío: ${pedido.opcionEnvio}` : '',
    pedido.cliente.notas ? `📝 Nota: "${pedido.cliente.notas}"` : '',
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *RESUMEN*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Subtotal: ${formatearPrecio(pedido.subtotal)}`,
    `Envío: ${pedido.costoEnvio === 0 ? 'Retiro en local (gratis)' : formatearPrecio(pedido.costoEnvio)}`,
    `*TOTAL: ${formatearPrecio(pedido.total)}*`,
    `💳 Pago: ${nombreMetodoPago(pedido.metodoPago)}`,
    `Estado: ${nombreEstado(pedido.estado)}`,
    ``,
    `🔗 Ver en admin: ${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/admin/pedidos`,
  ].filter(l => l !== null && l !== undefined).join('\n');

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (res.ok) {
      console.log(`[WhatsApp] ✓ Enviado a ${phone} — Pedido #${idCorto}`);
    } else {
      const texto = await res.text().catch(() => '');
      console.warn(`[WhatsApp] Error ${res.status}:`, texto);
    }
  } catch (err: any) {
    console.error('[WhatsApp] Error de red:', err.message);
  }

  const adminPhone = process.env.ADMIN_WHATSAPP;
  if (adminPhone && adminPhone !== phone) {
    const resumenAdmin = [
      `🍑 *VENTA CONFIRMADA #${idCorto}*`,
      `👤 ${pedido.cliente.nombre}`,
      `💰 *${formatearPrecio(pedido.total)}* (${pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'})`,
      `📦 ${pedido.items.map(i => `${i.titulo} ×${i.cantidad}`).join(' | ')}`,
      `🔗 ${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? ''}/admin/pedidos`,
    ].join('\n');  // ← ¡ESTA ES LA LÍNEA CORREGIDA!
    try {
      const adminUrl = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(resumenAdmin)}&apikey=${apikey}`;
      await fetch(adminUrl, { signal: AbortSignal.timeout(10_000) });
      console.log(`[WhatsApp Admin] ✓ Copia enviada a ${adminPhone}`);
    } catch { /* no bloquear */ }
  }
}

// ── 2. EMAIL DE COMPROBANTE AL CLIENTE ────────────────────

export async function enviarEmailComprobante(pedido: Pedido): Promise<void> {
  const apiKey    = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM  ?? 'Melocotón Cerámica <pedidos@melocotonceramica.com.ar>';
  const emailAdmin = process.env.EMAIL_ADMIN;

  if (!apiKey) {
    console.log('[Email] RESEND_API_KEY no configurada.');
    return;
  }

  const idCorto = pedido.id.slice(-6).toUpperCase();
  const html    = generarHTMLComprobante(pedido, idCorto);

  const payloadCliente = {
    from:    emailFrom,
    to:      pedido.cliente.email,
    subject: `✨ Tu pedido #${idCorto} fue recibido — Melocotón Cerámica`,
    html,
    reply_to: emailAdmin ?? emailFrom,
  };

  const payloadAdmin = emailAdmin ? {
    from:    emailFrom,
    to:      emailAdmin,
    subject: `📦 Nuevo pedido #${idCorto} de ${pedido.cliente.nombre}`,
    html:    generarHTMLAdmin(pedido, idCorto),
  } : null;

  try {
    const headers = {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    const promesas = [
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers,
        body:    JSON.stringify(payloadCliente),
        signal:  AbortSignal.timeout(15_000),
      }),
    ];

    if (payloadAdmin) {
      promesas.push(
        fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers,
          body:    JSON.stringify(payloadAdmin),
          signal:  AbortSignal.timeout(15_000),
        })
      );
    }

    const resultados = await Promise.allSettled(promesas);

    resultados.forEach((r, i) => {
      const destino = i === 0 ? pedido.cliente.email : emailAdmin;
      if (r.status === 'fulfilled' && r.value.ok) {
        console.log(`[Email] ✓ Enviado a ${destino}`);
      } else {
        const error = r.status === 'rejected' ? r.reason : `HTTP ${r.value.status}`;
        console.warn(`[Email] Error enviando a ${destino}:`, error);
      }
    });
  } catch (err: any) {
    console.error('[Email] Error general:', err.message);
  }
}

// ── RESTO DE FUNCIONES (sin cambios) ─────────────────────

function generarHTMLComprobante(pedido: Pedido, idCorto: string): string {
  // ... (el HTML largo que ya tenías, no lo modifiqué)
  return '';
}

function generarHTMLAdmin(pedido: Pedido, idCorto: string): string {
  // ... (el HTML interno)
  return '';
}

function _logPedidoConsola(pedido: Pedido): void {
  const idCorto = pedido.id.slice(-6).toUpperCase();
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NUEVO PEDIDO #${idCorto}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PIEZAS:
${pedido.items.map(i => `  • ${i.titulo} ×${i.cantidad}`).join('\n')}

CLIENTE: ${pedido.cliente.nombre}
TEL: ${pedido.cliente.telefono}
DIRECCIÓN: ${pedido.cliente.direccion}, ${pedido.cliente.ciudad}
CP: ${pedido.cliente.codigoPostal}

TOTAL: ${formatearPrecio(pedido.total)}
PAGO: ${pedido.metodoPago}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

export async function notificarNuevoPedido(pedido: Pedido): Promise<void> {
  await Promise.allSettled([
    enviarWhatsAppArtesana(pedido).catch(err => console.error('[notificar] WhatsApp falló:', err.message)),
    enviarEmailComprobante(pedido).catch(err => console.error('[notificar] Email falló:', err.message)),
  ]);
}

// ── 3. TRACKING AL CLIENTE ─────────────────────────────

export async function enviarTrackingCliente(pedido: Pedido, trackingCorreo: string): Promise<void> {
  // ... (código de tracking, sin cambios)
}
