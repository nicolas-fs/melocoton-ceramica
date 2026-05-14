import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstado, obtenerPedidoPorId } from '@/lib/pedidos';
import { actualizarStock, obtenerProductoPorId } from '@/lib/productos';
import { verificarYAlertarStock } from '@/lib/stockAlertas';

// ============================================================
// WEBHOOK DE MERCADO PAGO — Melocotón Cerámica
//
// Configurar en: mercadopago.com.ar/developers → tu app → Webhooks
// URL: https://tu-dominio.vercel.app/api/mp-webhook
// Evento: payment
// ============================================================

async function obtenerPagoMP(pagoId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${pagoId}`, {
    headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`MP API ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== 'payment') {
      return NextResponse.json({ ok: true, mensaje: 'Evento ignorado' });
    }

    const pagoId = data?.id;
    if (!pagoId) return NextResponse.json({ error: 'Sin payment ID' }, { status: 400 });

    const pago      = await obtenerPagoMP(String(pagoId));
    const pedidoId  = pago.external_reference;

    console.log(`[MP Webhook] payment ${pagoId} → status: ${pago.status}, pedido: ${pedidoId}`);

    if (!pedidoId) return NextResponse.json({ ok: true });

    switch (pago.status) {
      case 'approved': {
        // 1. Marcar pedido como pagado
        await actualizarEstado(pedidoId, 'pagado');

        // 2. Descontar stock de cada item y verificar alertas
        const pedido = await obtenerPedidoPorId(pedidoId);
        if (pedido) {
          for (const item of pedido.items) {
            const resultado = await actualizarStock(item.productoId, -item.cantidad);

            // 3. Verificar si el stock quedó bajo y enviar alerta
            const producto = await obtenerProductoPorId(item.productoId);
            if (producto) {
              await verificarYAlertarStock({
                id:        producto.id,
                titulo:    producto.titulo,
                stock:     resultado.stockActual,
                categoria: producto.categoria,
              });
            }
          }
        }
        break;
      }
      case 'rejected':
      case 'cancelled':
        await actualizarEstado(pedidoId, 'cancelado');
        break;
      case 'in_process':
      case 'pending':
        console.log(`[MP Webhook] Pedido ${pedidoId} pendiente de acreditación`);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[MP Webhook]', err.message);
    return NextResponse.json({ ok: true, error: err.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Melocotón Cerámica MP Webhook activo ✓' });
}
