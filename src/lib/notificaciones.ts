// ============================================================
// NOTIFICACIONES â€” MelocotÃ³n CerÃ¡mica
// ============================================================

import { Pedido } from '@/types';
import { formatearPrecio } from './utils';

// â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ 1. WHATSAPP A LA ARTESANA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    .map(i => `  ðŸ“¦ ${i.titulo}\n     Cantidad: *${i.cantidad}*\n     Precio unitario: ${formatearPrecio(i.precioUnitario)}`)
    .join('\n\n');

  const mensaje = [
    `ðŸ‘ *NUEVO PEDIDO #${idCorto}*`,
    ``,
    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`,
    `ðŸ“‹ *PIEZAS A PREPARAR*`,
    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`,
    piezas,
    ``,
    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`,
    `ðŸ“¬ *DATOS DE ENVÃO*`,
    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`,
    `ðŸ‘¤ ${pedido.cliente.nombre}`,
    `ðŸ“ ${pedido.cliente.direccion}`,
    `    ${pedido.cliente.ciudad}, ${pedido.cliente.provincia}`,
    `    CP: ${pedido.cliente.codigoPostal}`,
    `ðŸ“± ${pedido.cliente.telefono}`,
    `ðŸ“§ ${pedido.cliente.email}`,
    pedido.opcionEnvio ? `ðŸšš EnvÃ­o: ${pedido.opcionEnvio}` : '',
    pedido.cliente.notas ? `ðŸ“ Nota: "${pedido.cliente.notas}"` : '',
    ``,
    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`,
    `ðŸ’° *RESUMEN*`,
    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`,
    `Subtotal: ${formatearPrecio(pedido.subtotal)}`,
    `EnvÃ­o: ${pedido.costoEnvio === 0 ? 'Retiro en local (gratis)' : formatearPrecio(pedido.costoEnvio)}`,
    `*TOTAL: ${formatearPrecio(pedido.total)}*`,
    `ðŸ’³ Pago: ${nombreMetodoPago(pedido.metodoPago)}`,
    `Estado: ${nombreEstado(pedido.estado)}`,
    ``,
    `ðŸ”— Ver en admin: ${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/admin/pedidos`,
  ].filter(l => l !== null && l !== undefined).join('\n');

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (res.ok) {
      console.log(`[WhatsApp] âœ“ Enviado a ${phone} â€” Pedido #${idCorto}`);
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
      `ðŸ‘ *VENTA CONFIRMADA #${idCorto}*`,
      `ðŸ‘¤ ${pedido.cliente.nombre}`,
      `ðŸ’° *${formatearPrecio(pedido.total)}* (${pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'})`,
      `ðŸ“¦ ${pedido.items.map(i => `${i.titulo} Ã—${i.cantidad}`).join(' | ')}`,
      `ðŸ”— ${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? ''}/admin/pedidos`,
    ].join('\n');  // â† Â¡ESTA ES LA LÃNEA CORREGIDA!
    try {
      const adminUrl = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(resumenAdmin)}&apikey=${apikey}`;
      await fetch(adminUrl, { signal: AbortSignal.timeout(10_000) });
      console.log(`[WhatsApp Admin] âœ“ Copia enviada a ${adminPhone}`);
    } catch { /* no bloquear */ }
  }
}

// â”€â”€ 2. EMAIL DE COMPROBANTE AL CLIENTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function enviarEmailComprobante(pedido: Pedido): Promise<void> {
  const apiKey    = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM  ?? 'MelocotÃ³n CerÃ¡mica <pedidos@melocotonceramica.com.ar>';
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
    subject: `âœ¨ Tu pedido #${idCorto} fue recibido â€” MelocotÃ³n CerÃ¡mica`,
    html,
    reply_to: emailAdmin ?? emailFrom,
  };

  const payloadAdmin = emailAdmin ? {
    from:    emailFrom,
    to:      emailAdmin,
    subject: `ðŸ“¦ Nuevo pedido #${idCorto} de ${pedido.cliente.nombre}`,
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
        console.log(`[Email] âœ“ Enviado a ${destino}`);
      } else {
        const error = r.status === 'rejected' ? r.reason : `HTTP ${r.value.status}`;
        console.warn(`[Email] Error enviando a ${destino}:`, error);
      }
    });
  } catch (err: any) {
    console.error('[Email] Error general:', err.message);
  }
}

// â”€â”€ RESTO DE FUNCIONES (sin cambios) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generarHTMLComprobante(pedido: Pedido, idCorto: string): string {
  // ... (el HTML largo que ya tenÃ­as, no lo modifiquÃ©)
  return '';
}

function generarHTMLAdmin(pedido: Pedido, idCorto: string): string {
  // ... (el HTML interno)
  return '';
}

function _logPedidoConsola(pedido: Pedido): void {
  const idCorto = pedido.id.slice(-6).toUpperCase();
  console.log(`
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“¦ NUEVO PEDIDO #${idCorto}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
PIEZAS:
${pedido.items.map(i => `  â€¢ ${i.titulo} Ã—${i.cantidad}`).join('\n')}

CLIENTE: ${pedido.cliente.nombre}
TEL: ${pedido.cliente.telefono}
DIRECCIÃ“N: ${pedido.cliente.direccion}, ${pedido.cliente.ciudad}
CP: ${pedido.cliente.codigoPostal}

TOTAL: ${formatearPrecio(pedido.total)}
PAGO: ${pedido.metodoPago}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  `);
}

export async function notificarNuevoPedido(pedido: Pedido): Promise<void> {
  await Promise.allSettled([
    enviarWhatsAppArtesana(pedido).catch(err => console.error('[notificar] WhatsApp fallÃ³:', err.message)),
    enviarEmailComprobante(pedido).catch(err => console.error('[notificar] Email fallÃ³:', err.message)),
  ]);
}

// â”€â”€ 3. TRACKING AL CLIENTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function enviarTrackingCliente(pedido: Pedido, trackingCorreo: string): Promise<void> {
  // ... (cÃ³digo de tracking, sin cambios)
}

