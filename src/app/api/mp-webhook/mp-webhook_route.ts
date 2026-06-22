import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { actualizarEstado, obtenerPedidoPorId } from '@/lib/pedidos';
import { actualizarStock, obtenerProductoPorId } from '@/lib/productos';
import { verificarYAlertarStock } from '@/lib/stockAlertas';
import { enviarTrackingCliente } from '@/lib/notificaciones';

// ============================================================
// WEBHOOK DE MERCADO PAGO — Melocotón Cerámica
// FIX: Al aprobarse el pago, actualiza estado a "pagado" automaticamente
// ============================================================

function verificarFirmaMP(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[MP Webhook] MERCADO_PAGO_WEBHOOK_SECRET no configurado — omitiendo verificación');
    return true;
  }

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (!xSignature || !xRequestId) {
    console.warn('[MP Webhook] Headers x-signature o x-request-id ausentes');
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map(p => p.split('=') as [string, string])
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];

  if (!ts || !v1) {
    console.warn('[MP Webhook] Formato de x-signature inválido');
    return false;
  }

  const dataId = new URL(req.url).searchParams.get('data.id') || '';
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expected = createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  if (v1 !== expected) {
    console.error(`[MP Webhook] Firma inválida. expected=${expected.substring(0,8)}... got=${v1.substring(0,8)}...`);
    return false;
  }

  return true;
}

async function obtenerPagoMP(pagoId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${pagoId}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`MP API ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verificarFirmaMP(req, rawBody)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const { type, data } = body;

    if (type !== 'payment') {
      return NextResponse.json({ ok: true, mensaje: 'Evento ignorado' });
    }

    const pagoId = data?.id;
    if (!pagoId) return NextResponse.json({ error: 'Sin payment ID' }, { status: 400 });

    const pago     = await obtenerPagoMP(String(pagoId));
    const pedidoId = pago.external_reference;

    console.log(`[MP Webhook] payment ${pagoId} → status: ${pago.status}, pedido: ${pedidoId}`);

    if (!pedidoId) return NextResponse.json({ ok: true });

    switch (pago.status) {
      case 'approved': {
        // FIX: Actualizar estado a "pagado" automaticamente cuando MP aprueba
        await actualizarEstado(pedidoId, 'pagado');
        console.log(`[MP Webhook] Pedido ${pedidoId} → PAGADO automaticamente`);

        const pedido = await obtenerPedidoPorId(pedidoId);
        if (pedido) {
          // Descontar stock de cada producto
          for (const item of pedido.items) {
            const resultado = await actualizarStock(item.productoId, -item.cantidad);
            const producto  = await obtenerProductoPorId(item.productoId);
            if (producto) {
              await verificarYAlertarStock({
                id:        producto.id,
                titulo:    producto.titulo,
                stock:     resultado.stockActual,
                categoria: producto.categoria,
              });
            }
          }
          console.log(`[MP Webhook] Stock actualizado para pedido ${pedidoId}`);
        }
        break;
      }
      case 'rejected':
      case 'cancelled':
        await actualizarEstado(pedidoId, 'cancelado');
        console.log(`[MP Webhook] Pedido ${pedidoId} → CANCELADO`);
        break;
      case 'in_process':
      case 'pending':
        console.log(`[MP Webhook] Pedido ${pedidoId} pendiente de acreditación`);
        break;
      default:
        console.log(`[MP Webhook] Estado no manejado: ${pago.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[MP Webhook] Error:', err.message);
    return NextResponse.json({ ok: true, error: 'Error interno' });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Melocotón Cerámica MP Webhook activo ✓' });
}
