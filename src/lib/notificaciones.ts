// ============================================================
// NOTIFICACIONES — Melocotón Cerámica
//
// Al confirmarse una compra se disparan en paralelo:
//   1. WhatsApp a la artesana (CallMeBot, gratis)
//      → Lista de piezas a armar, datos del comprador, dirección de envío
//
//   2. Email de comprobante al cliente (Resend, gratis hasta 3.000/mes)
//      → HTML con resumen del pedido, número de pedido, próximos pasos
//
// Variables en .env.local:
//   CALLMEBOT_PHONE=549XXXXXXXXXX   ← tu celular
//   CALLMEBOT_APIKEY=XXXXXX
//   RESEND_API_KEY=re_XXXXXXXX
//   EMAIL_FROM=pedidos@melocotonceramica.com.ar  ← dominio verificado en Resend
//   EMAIL_ADMIN=tu@email.com                     ← donde recibís copia del pedido
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
// Recibe el mensaje en su celular con todo lo que necesita
// para armar y despachar el paquete.

export async function enviarWhatsAppArtesana(pedido: Pedido): Promise<void> {
  const phone  = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.log('[WhatsApp] Sin configurar. Para activar:\n  1. Guardá +34 644 44 17 19 como CallMeBot\n  2. Mandales: "I allow callmebot to send me messages"\n  3. Agregá CALLMEBOT_PHONE y CALLMEBOT_APIKEY al .env.local');
    // Imprimir en consola igual para que se vea en los logs de Vercel
    _logPedidoConsola(pedido);
    return;
  }

  const idCorto = pedido.id.slice(-6).toUpperCase();

  // Lista de piezas a armar — el corazón del mensaje
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

  // Enviar copia al WhatsApp del dueño (ADMIN_WHATSAPP)
  // Diferente al CALLMEBOT_PHONE que puede ser cualquier número
  const adminPhone = process.env.ADMIN_WHATSAPP;
  if (adminPhone && adminPhone !== phone) {
    const resumenAdmin = [
      `🍑 *VENTA CONFIRMADA #${idCorto}*`,
      `👤 ${pedido.cliente.nombre}`,
      `💰 *${formatearPrecio(pedido.total)}* (${pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'})`,
      `📦 ${pedido.items.map(i => `${i.titulo} ×${i.cantidad}`).join(' | ')}`,
      `🔗 ${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? ''}/admin/pedidos`,
    ].join('\n');  // ← CORREGIDO: antes tenía un salto de línea literal
    try {
      const adminUrl = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(resumenAdmin)}&apikey=${apikey}`;
      await fetch(adminUrl, { signal: AbortSignal.timeout(10_000) });
      console.log(`[WhatsApp Admin] ✓ Copia enviada a ${adminPhone}`);
    } catch { /* no bloquear */ }
  }
}

// ── 2. EMAIL DE COMPROBANTE AL CLIENTE ────────────────────
// HTML bonito con los colores de la marca, número de pedido,
// resumen de compra y próximos pasos.

export async function enviarEmailComprobante(pedido: Pedido): Promise<void> {
  const apiKey    = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM  ?? 'Melocotón Cerámica <pedidos@melocotonceramica.com.ar>';
  const emailAdmin = process.env.EMAIL_ADMIN;

  if (!apiKey) {
    console.log('[Email] RESEND_API_KEY no configurada. Para activar:\n  1. Registrate en resend.com (gratis)\n  2. Verificá tu dominio\n  3. Agregá RESEND_API_KEY al .env.local');
    return;
  }

  const idCorto = pedido.id.slice(-6).toUpperCase();
  const html    = generarHTMLComprobante(pedido, idCorto);

  // a) Email al cliente con su comprobante
  const payloadCliente = {
    from:    emailFrom,
    to:      pedido.cliente.email,
    subject: `✨ Tu pedido #${idCorto} fue recibido — Melocotón Cerámica`,
    html,
    reply_to: emailAdmin ?? emailFrom,
  };

  // b) Copia interna para la artesana (sin el HTML bonito, solo los datos)
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

    // Enviar ambos en paralelo
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

// ── HTML COMPROBANTE CLIENTE ──────────────────────────────

function generarHTMLComprobante(pedido: Pedido, idCorto: string): string {
  const itemsHTML = pedido.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3d4ac;font-family:Georgia,serif;font-size:15px;color:#3e3025;">
        ${item.titulo}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f3d4ac;text-align:center;font-family:sans-serif;font-size:14px;color:#7a634a;">
        ×${item.cantidad}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f3d4ac;text-align:right;font-family:Georgia,serif;font-size:15px;color:#3e3025;white-space:nowrap;">
        ${formatearPrecio(item.precioUnitario * item.cantidad)}
      </td>
    </tr>
  `).join('');

  const pasosSiguientes = pedido.metodoPago === 'transferencia'
    ? `<p style="margin:0 0 12px;color:#3e3025;font-size:15px;">📲 En los próximos minutos te enviamos los datos bancarios por WhatsApp al <strong>${pedido.cliente.telefono}</strong>.</p>
       <p style="margin:0;color:#3e3025;font-size:15px;">Una vez que confirmemos el pago, comenzamos a preparar tu pedido con amor. 🍑</p>`
    : `<p style="margin:0 0 12px;color:#3e3025;font-size:15px;">✅ Tu pago fue procesado correctamente.</p>
       <p style="margin:0;color:#3e3025;font-size:15px;">Ya estamos preparando tus piezas para enviarlas. Te avisamos cuando esté en camino. 🍑</p>`;

  const opcionEnvioTexto = pedido.costoEnvio === 0
    ? 'Retiro en Carlos Paz (gratis)'
    : `Correo Argentino${pedido.opcionEnvio ? ` — ${pedido.opcionEnvio}` : ''}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Tu pedido en Melocotón Cerámica</title>
</head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#3e3025;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:28px;color:#faecd8;letter-spacing:1px;">Melocotón</p>
              <p style="margin:0;font-size:11px;letter-spacing:4px;color:#e9b57a;text-transform:uppercase;">Cerámica Artesanal</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #f3d4ac;border-top:none;">

              <!-- Saludo -->
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#3e3025;">
                ¡Hola, ${pedido.cliente.nombre.split(' ')[0]}! 🍑
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#7a634a;line-height:1.6;">
                Recibimos tu pedido. Cada pieza que hacemos tiene nuestra huella — esperamos que la tuya te traiga muchas mañanas hermosas.
              </p>

              <!-- Número de pedido -->
              <div style="background:#fdf8f3;border:2px solid #e9b57a;border-radius:12px;padding:16px 20px;margin-bottom:28px;text-align:center;">
                <p style="margin:0 0 4px;font-size:12px;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">Número de pedido</p>
                <p style="margin:0;font-family:Georgia,serif;font-size:28px;color:#c06930;letter-spacing:4px;font-weight:bold;">#${idCorto}</p>
              </div>

              <!-- Items -->
              <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">Tus piezas</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${itemsHTML}
                <tr>
                  <td style="padding:12px 0 4px;font-size:13px;color:#957d5e;">Subtotal</td>
                  <td></td>
                  <td style="padding:12px 0 4px;text-align:right;font-size:13px;color:#957d5e;">${formatearPrecio(pedido.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#957d5e;">Envío</td>
                  <td></td>
                  <td style="padding:4px 0;text-align:right;font-size:13px;color:#957d5e;">${pedido.costoEnvio === 0 ? 'Gratis' : formatearPrecio(pedido.costoEnvio)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-family:Georgia,serif;font-size:18px;color:#3e3025;font-weight:bold;">Total</td>
                  <td></td>
                  <td style="padding:12px 0 0;text-align:right;font-family:Georgia,serif;font-size:22px;color:#c06930;font-weight:bold;">${formatearPrecio(pedido.total)}</td>
                </tr>
              </table>

              <!-- Envío y pago -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td width="48%" style="background:#fdf8f3;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:11px;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">Método de pago</p>
                    <p style="margin:0;font-size:15px;color:#3e3025;">${nombreMetodoPago(pedido.metodoPago)}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#fdf8f3;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 8px;font-size:11px;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">Opción de envío</p>
                    <p style="margin:0;font-size:15px;color:#3e3025;">${opcionEnvioTexto}</p>
                  </td>
                </tr>
              </table>

              <!-- Dirección -->
              <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:11px;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">📍 Dirección de entrega</p>
                <p style="margin:0;font-size:15px;color:#3e3025;line-height:1.6;">
                  ${pedido.cliente.direccion}<br>
                  ${pedido.cliente.ciudad}, ${pedido.cliente.provincia} (CP ${pedido.cliente.codigoPostal})
                </p>
              </div>

              <!-- Próximos pasos -->
              <div style="background:#faecd8;border-radius:12px;padding:20px;margin-bottom:28px;border-left:4px solid #e9b57a;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">¿Qué sigue ahora?</p>
                ${pasosSiguientes}
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="https://wa.me/${process.env.CALLMEBOT_PHONE ?? '5493541000000'}?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20pedido%20%23${idCorto}"
                   style="display:inline-block;background:#3e3025;color:#faecd8;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:1px;">
                  💬 Consultar por WhatsApp
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#b09a7a;text-align:center;line-height:1.6;">
                Podés responder este email si tenés alguna duda.<br>
                Gracias por confiar en nuestro trabajo hecho a mano. 🤍
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:14px;color:#957d5e;">Melocotón Cerámica</p>
              <p style="margin:0;font-size:12px;color:#b09a7a;">Villa Carlos Paz, Córdoba · @melocoton.ceramica</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── HTML INTERNO PARA LA ARTESANA ─────────────────────────

function generarHTMLAdmin(pedido: Pedido, idCorto: string): string {
  const itemsHTML = pedido.items.map(i =>
    `<li style="margin-bottom:8px;font-size:15px;"><strong>${i.titulo}</strong> × ${i.cantidad} = ${formatearPrecio(i.precioUnitario * i.cantidad)}</li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;padding:24px;background:#fdf8f3;">
  <h2 style="color:#c06930;font-family:Georgia,serif;">📦 Nuevo pedido #${idCorto}</h2>

  <h3 style="color:#3e3025;">Piezas a preparar</h3>
  <ul>${itemsHTML}</ul>

  <h3 style="color:#3e3025;">Cliente</h3>
  <p><strong>Nombre:</strong> ${pedido.cliente.nombre}<br>
  <strong>Email:</strong> ${pedido.cliente.email}<br>
  <strong>Teléfono:</strong> ${pedido.cliente.telefono}<br>
  <strong>Dirección:</strong> ${pedido.cliente.direccion}, ${pedido.cliente.ciudad}, ${pedido.cliente.provincia} (CP ${pedido.cliente.codigoPostal})<br>
  ${pedido.cliente.notas ? `<strong>Notas:</strong> ${pedido.cliente.notas}<br>` : ''}
  <strong>Envío:</strong> ${pedido.opcionEnvio ?? 'Sin especificar'}</p>

  <h3 style="color:#3e3025;">Totales</h3>
  <p>Subtotal: ${formatearPrecio(pedido.subtotal)}<br>
  Envío: ${pedido.costoEnvio === 0 ? 'Gratis (retiro)' : formatearPrecio(pedido.costoEnvio)}<br>
  <strong>Total: ${formatearPrecio(pedido.total)}</strong><br>
  Pago: ${nombreMetodoPago(pedido.metodoPago)}<br>
  Estado: ${nombreEstado(pedido.estado)}</p>

  <p><a href="${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/admin/pedidos" style="color:#c06930;">Ver en el panel admin →</a></p>
</body>
</html>`;
}

// ── LOG DE CONSOLA (fallback sin configuración) ────────────

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

// ── FUNCIÓN PRINCIPAL — llama a las dos notificaciones ────

export async function notificarNuevoPedido(pedido: Pedido): Promise<void> {
  // Corren en paralelo — si una falla, la otra igual se envía
  await Promise.allSettled([
    enviarWhatsAppArtesana(pedido).catch(err =>
      console.error('[notificar] WhatsApp falló:', err.message)
    ),
    enviarEmailComprobante(pedido).catch(err =>
      console.error('[notificar] Email falló:', err.message)
    ),
  ]);
}


// ── 3. TRACKING AL CLIENTE (WhatsApp + Email) ─────────────
// Se dispara cuando la artesana carga el número de seguimiento
// desde el panel admin → Pedidos → botón "📦 Cargar tracking"

export async function enviarTrackingCliente(pedido: Pedido, trackingCorreo: string): Promise<void> {
  const idCorto = pedido.id.slice(-6).toUpperCase();
  const urlSeguimiento = `https://www.correoargentino.com.ar/formularios/e-commerce/${trackingCorreo}`;

  await Promise.allSettled([

    // WhatsApp al cliente
    (async () => {
      const phone  = process.env.CALLMEBOT_PHONE;
      const apikey = process.env.CALLMEBOT_APIKEY;
      if (!phone || !apikey) {
        console.log(`[Tracking WhatsApp] Sin configurar. Tracking: ${trackingCorreo}`);
        return;
      }

      const piezas = pedido.items.map(i => `  📦 ${i.titulo} ×${i.cantidad}`).join('\n');

      const mensaje = [
        `🍑 *¡Tu pedido está en camino!*`,
        ``,
        `Hola ${pedido.cliente.nombre.split(' ')[0]} 👋`,
        `Tu pedido *#${idCorto}* fue despachado por Correo Argentino.`,
        ``,
        `━━━━━━━━━━━━━━━━━━━`,
        `📋 *TU PEDIDO*`,
        `━━━━━━━━━━━━━━━━━━━`,
        piezas,
        ``,
        `💰 Total: ${formatearPrecio(pedido.total)}`,
        ``,
        `━━━━━━━━━━━━━━━━━━━`,
        `🔍 *SEGUIMIENTO*`,
        `━━━━━━━━━━━━━━━━━━━`,
        `Número: *${trackingCorreo}*`,
        ``,
        `Seguí tu paquete en:`,
        urlSeguimiento,
        ``,
        `━━━━━━━━━━━━━━━━━━━`,
        `📍 Se entrega en:`,
        `${pedido.cliente.direccion}`,
        `${pedido.cliente.ciudad}, ${pedido.cliente.provincia}`,
        ``,
        `¡Gracias por confiar en nuestro trabajo hecho a mano! 🤍`,
        `@melocoton.ceramica`,
      ].join('\n');

      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${pedido.cliente.telefono.replace(/\D/g,'')}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
        console.log(`[Tracking WA] ${res.ok ? '✓' : 'Error'} → ${pedido.cliente.telefono}`);
      } catch (err: any) {
        console.error('[Tracking WA] Error:', err.message);
      }
    })(),

    // Email al cliente con el tracking
    (async () => {
      const apiKey    = process.env.RESEND_API_KEY;
      const emailFrom = process.env.EMAIL_FROM ?? 'Melocotón Cerámica <pedidos@melocotonceramica.com.ar>';
      if (!apiKey) {
        console.log(`[Tracking Email] Sin configurar. Tracking: ${trackingCorreo}`);
        return;
      }

      const html = generarHTMLTracking(pedido, idCorto, trackingCorreo, urlSeguimiento);

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            from:    emailFrom,
            to:      pedido.cliente.email,
            subject: `📦 Tu pedido #${idCorto} está en camino — Melocotón Cerámica`,
            html,
          }),
          signal: AbortSignal.timeout(15_000),
        });
        console.log(`[Tracking Email] ${res.ok ? '✓' : 'Error'} → ${pedido.cliente.email}`);
      } catch (err: any) {
        console.error('[Tracking Email] Error:', err.message);
      }
    })(),
  ]);
}

function generarHTMLTracking(pedido: Pedido, idCorto: string, tracking: string, urlSeg: string): string {
  const itemsHTML = pedido.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3d4ac;font-family:Georgia,serif;font-size:15px;color:#3e3025;">${i.titulo}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3d4ac;text-align:center;font-size:14px;color:#7a634a;">×${i.cantidad}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3d4ac;text-align:right;font-family:Georgia,serif;font-size:15px;color:#3e3025;">${formatearPrecio(i.precioUnitario * i.cantidad)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#fdf8f3;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

      <tr><td style="background:#3e3025;border-radius:16px 16px 0 0;padding:28px;text-align:center;">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:26px;color:#faecd8;">Melocotón</p>
        <p style="margin:0;font-size:11px;letter-spacing:4px;color:#e9b57a;text-transform:uppercase;">Cerámica Artesanal</p>
      </td></tr>

      <tr><td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #f3d4ac;border-top:none;">

        <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;color:#3e3025;">¡Tu pedido está en camino! 📦</p>
        <p style="margin:0 0 28px;font-size:15px;color:#7a634a;line-height:1.6;">
          Hola ${pedido.cliente.nombre.split(' ')[0]}, despachamos tu pedido #${idCorto} y ya está viajando hacia vos.
        </p>

        <!-- Tracking destacado -->
        <div style="background:#3e3025;border-radius:16px;padding:24px;margin-bottom:28px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#e9b57a;letter-spacing:3px;text-transform:uppercase;">Número de seguimiento</p>
          <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;color:#faecd8;letter-spacing:4px;font-weight:bold;">${tracking}</p>
          <a href="${urlSeg}"
             style="display:inline-block;background:#e9b57a;color:#3e3025;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:1px;">
            🔍 Seguir mi paquete
          </a>
        </div>

        <!-- Dirección de entrega -->
        <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">📍 Se entrega en</p>
          <p style="margin:0;font-size:15px;color:#3e3025;line-height:1.7;">
            ${pedido.cliente.nombre}<br>
            ${pedido.cliente.direccion}<br>
            ${pedido.cliente.ciudad}, ${pedido.cliente.provincia} (CP ${pedido.cliente.codigoPostal})
          </p>
        </div>

        <!-- Detalle del pedido -->
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#957d5e;letter-spacing:2px;text-transform:uppercase;">Lo que pediste</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${itemsHTML}
          <tr>
            <td colspan="2" style="padding:12px 0 0;font-family:Georgia,serif;font-size:17px;color:#3e3025;font-weight:bold;">Total pagado</td>
            <td style="padding:12px 0 0;text-align:right;font-family:Georgia,serif;font-size:20px;color:#c06930;font-weight:bold;">${formatearPrecio(pedido.total)}</td>
          </tr>
        </table>

        <p style="margin:0 0 24px;font-size:14px;color:#7a634a;line-height:1.7;background:#faecd8;border-radius:12px;padding:16px 20px;">
          ⏱ El tiempo de entrega estimado es de <strong>5 a 10 días hábiles</strong> según tu ubicación.<br>
          Podés seguir el estado en <a href="${urlSeg}" style="color:#c06930;">correoweb.com.ar</a> con el número de arriba.
        </p>

        <p style="margin:0;font-size:13px;color:#b09a7a;text-align:center;">
          Gracias por confiar en nuestro trabajo hecho a mano. 🤍<br>
          <strong>@melocoton.ceramica</strong> · Villa Carlos Paz, Córdoba
        </p>

      </td></tr>

      <tr><td style="padding:20px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#957d5e;">Melocotón Cerámica · Carlos Paz, Córdoba</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}