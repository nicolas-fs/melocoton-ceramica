import { NextRequest, NextResponse } from 'next/server';
import { crearPedido } from '@/lib/pedidos';
import { notificarNuevoPedido } from '@/lib/notificaciones';
import { ItemCarrito, DatosCliente, MetodoPago } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      cliente,
      items,
      metodoPago,
      subtotal,
      costoEnvio = 0,
      total,
      opcionEnvio,
    } = await req.json() as {
      cliente:      DatosCliente;
      items:        ItemCarrito[];
      metodoPago:   MetodoPago;
      subtotal:     number;
      costoEnvio:   number;
      total:        number;
      opcionEnvio?: string;
    };

    // Validaciones básicas
    if (!items?.length)   return NextResponse.json({ error: 'Carrito vacío' },      { status: 400 });
    if (!cliente?.email)  return NextResponse.json({ error: 'Email requerido' },    { status: 400 });
    if (!cliente?.nombre) return NextResponse.json({ error: 'Nombre requerido' },   { status: 400 });

    // Crear el pedido en la base de datos
    const pedido = await crearPedido({
      cliente,
      items: items.map(i => ({
        productoId:    i.productoId,
        titulo:        i.titulo,
        cantidad:      i.cantidad,
        precioUnitario: i.precio,
      })),
      subtotal,
      costoEnvio,
      total,
      metodoPago,
      opcionEnvio,  // ← "Correo Argentino Clásico", "Retiro en Carlos Paz", etc.
    });

    // Disparar notificaciones en background — no bloquean la respuesta
    notificarNuevoPedido(pedido).catch(err =>
      console.error('[Checkout] Error en notificaciones:', err)
    );

    // ── MERCADO PAGO ──────────────────────────────────────
    if (metodoPago === 'mercadopago') {
      const accessToken = process.env.MP_ACCESS_TOKEN;

      if (!accessToken) {
        // Sin token de MP → confirmación directa (modo demo)
        return NextResponse.json({ pedidoId: pedido.id });
      }

      try {
        const { MercadoPagoConfig, Preference } = await import('mercadopago');
        const mpClient  = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(mpClient);

        const result = await preference.create({
          body: {
            items: items.map(i => ({
              id:         i.productoId,
              title:      i.titulo,
              quantity:   i.cantidad,
              unit_price: i.precio,
              currency_id: 'ARS',
            })),
            payer: {
              name:  cliente.nombre,
              email: cliente.email,
              phone: { number: cliente.telefono },
              address: {
                street_name: cliente.direccion,
                city:        cliente.ciudad,
                zip_code:    cliente.codigoPostal,
              },
            },
            back_urls: {
              success: `${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/checkout/confirmacion?pedidoId=${pedido.id}&metodo=mercadopago`,
              failure: `${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/checkout?error=pago_fallido`,
              pending: `${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/checkout/confirmacion?pedidoId=${pedido.id}&metodo=pendiente`,
            },
            auto_return:          'approved' as const,
            external_reference:   pedido.id,
            statement_descriptor: 'MELOCOTON CERAMICA',
            notification_url:     `${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000')}/api/mp-webhook`,
          },
        });

        return NextResponse.json({
          pedidoId: pedido.id,
          urlPago:  result.init_point,
        });

      } catch (mpErr: any) {
        console.error('[Checkout] Error Mercado Pago:', mpErr.message);
        // Si MP falla, confirmamos el pedido igual
        return NextResponse.json({ pedidoId: pedido.id });
      }
    }

    // ── TRANSFERENCIA ─────────────────────────────────────
    return NextResponse.json({
      pedidoId: pedido.id,
      mensaje:  'Pedido creado. En minutos te enviamos los datos bancarios por WhatsApp.',
    });

  } catch (err: any) {
    console.error('[Checkout]', err);
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 });
  }
}
