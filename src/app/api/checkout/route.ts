import { NextRequest, NextResponse } from 'next/server';
import { crearPedido } from '@/lib/pedidos';
import { obtenerProductoPorId } from '@/lib/productos';
import { notificarNuevoPedido } from '@/lib/notificaciones';
import { DatosCliente, MetodoPago } from '@/types';
import { checkRateLimit, getClientIp, RATE_LIMIT_CHECKOUT } from '@/lib/rateLimiter';

// ── Constante: costo de envío mínimo para validar ────────
const COSTO_ENVIO_MAX = 30_000; // ARS — rechazar si viene algo raro

export async function POST(req: NextRequest) {
 try {
 // ── HAL-04 FIX: Rate limiting en checkout ────────────
 const ip = getClientIp(req);
 const rl = checkRateLimit(, RATE_LIMIT_CHECKOUT.maxAttempts, RATE_LIMIT_CHECKOUT.windowMs, RATE_LIMIT_CHECKOUT.blockMs);
 if (!rl.allowed) {
 return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá más tarde.' }, { status: 429 });
 }

 const {
 cliente,
 items,
 metodoPago,
 costoEnvio = 0,
 opcionEnvio,
 } = await req.json() as {
 cliente: DatosCliente;
 items: Array<{ productoId: string; cantidad: number }>;
 metodoPago: MetodoPago;
 costoEnvio: number;
 opcionEnvio?: string;
 };

 // ── Validaciones básicas de entrada ───────────────────
 if (!items?.length)
 return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
 if (!cliente?.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
 return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
 if (!cliente?.nombre?.trim())
 return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
 if (!cliente?.telefono?.trim())
 return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 });
 if (costoEnvio < 0 || costoEnvio > COSTO_ENVIO_MAX)
 return NextResponse.json({ error: 'Costo de envío inválido' }, { status: 400 });

 // ── HAL-01 FIX: Verificar precios contra la base de datos ──
 // El cliente NO puede manipular precios — todos se leen del servidor
 const itemsVerificados = await Promise.all(
 items.map(async ({ productoId, cantidad }) => {
 if (!productoId || typeof cantidad !== 'number' || cantidad < 1 || cantidad > 99) {
 throw new Error(`Item inválido: productoId=${productoId}, cantidad=${cantidad}`);
 }

 const producto = await obtenerProductoPorId(productoId);
 if (!producto) throw new Error(`Producto no encontrado: ${productoId}`);
 if (producto.stock < cantidad) {
 throw new Error(`Stock insuficiente para "${producto.titulo}" (stock: ${producto.stock}, pedido: ${cantidad})`);
 }

 return {
 productoId,
 titulo: producto.titulo, // nombre del servidor
 cantidad,
 precioUnitario: producto.precio, // precio del SERVIDOR, no del cliente
 };
 })
 );

 // Recalcular totales en el servidor (nunca confiar en los del cliente)
 const subtotalVerificado = itemsVerificados.reduce(
 (sum, i) => sum + i.precioUnitario * i.cantidad, 0
 );
 const totalVerificado = subtotalVerificado + costoEnvio;

 // Crear el pedido con precios verificados
 const pedido = await crearPedido({
 cliente,
 items: itemsVerificados,
 subtotal: subtotalVerificado,
 costoEnvio,
 total: totalVerificado,
 metodoPago,
 opcionEnvio,
 });

 // Notificaciones en background
 notificarNuevoPedido(pedido).catch(err =>
 console.error('[Checkout] Error en notificaciones:', err)
 );

 // ── MERCADO PAGO ──────────────────────────────────────
 if (metodoPago === 'mercadopago') {
 const accessToken = process.env.MP_ACCESS_TOKEN;

 if (!accessToken) {
 return NextResponse.json({ pedidoId: pedido.id });
 }

 try {
 const { MercadoPagoConfig, Preference } = await import('mercadopago');
 const mpClient = new MercadoPagoConfig({ accessToken });
 const preference = new Preference(mpClient);

 const result = await preference.create({
 body: {
 // Usar itemsVerificados — precios del servidor
 items: itemsVerificados.map(i => ({
 id: i.productoId,
 title: i.titulo,
 quantity: i.cantidad,
 unit_price: i.precioUnitario, // precio verificado del servidor
 currency_id: 'ARS',
 })),
 payer: {
 name: cliente.nombre.trim().substring(0, 100),
 email: cliente.email.trim().toLowerCase(),
 phone: { number: cliente.telefono.replace(/\D/g, '').substring(0, 20) },
 address: {
 street_name: cliente.direccion?.trim().substring(0, 100),
 city: cliente.ciudad?.trim().substring(0, 50),
 zip_code: cliente.codigoPostal?.replace(/\D/g, '').substring(0, 10),
 },
 },
 back_urls: {
 success: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL}/checkout/confirmacion?pedidoId=${pedido.id}&metodo=mercadopago`,
 failure: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL}/checkout?error=pago_fallido`,
 pending: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL}/checkout/confirmacion?pedidoId=${pedido.id}&metodo=pendiente`,
 },
 auto_return: 'approved' as const,
 external_reference: pedido.id,
 statement_descriptor: 'MELOCOTON CERAMICA',
 notification_url: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL}/api/mp-webhook`,
 },
 });

 return NextResponse.json({
 pedidoId: pedido.id,
 urlPago: result.init_point,
 });
 } catch (mpErr: any) {
 console.error('[Checkout] Error Mercado Pago:', mpErr.message);
 return NextResponse.json({ pedidoId: pedido.id });
 }
 }

 // ── TRANSFERENCIA ─────────────────────────────────────
 return NextResponse.json({
 pedidoId: pedido.id,
 mensaje: 'Pedido creado. En minutos te enviamos los datos bancarios por WhatsApp.',
 });

 } catch (err: any) {
 console.error('[Checkout]', err.message);
 // No exponer detalles internos al cliente
 const esErrorDeNegocio = err.message?.includes('Stock insuficiente') ||
 err.message?.includes('Producto no encontrado') ||
 err.message?.includes('Item inválido');
 return NextResponse.json(
 { error: esErrorDeNegocio ? err.message : 'Error al procesar el pedido' },
 { status: esErrorDeNegocio ? 400 : 500 }
 );
 }
}
