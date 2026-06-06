// ============================================================
// PEDIDOS — Capa de datos con Prisma (PostgreSQL)
// ============================================================

import { Pedido, EstadoPedido } from '@/types';
import prisma from './prisma';

// Convertir registro Prisma → tipo Pedido de la app
function mapPrismaToPedido(p: any): Pedido {
  return {
    id:            p.id,
    estado:        p.estado as EstadoPedido,
    metodoPago:    p.metodoPago as any,
    subtotal:      p.subtotal,
    costoEnvio:    p.costoEnvio,
    total:         p.total,
    opcionEnvio:   p.opcionEnvio ?? undefined,
    trackingCorreo: p.trackingCorreo ?? undefined,
    idTransaccionMP: p.idTransaccionMP ?? undefined,
    idPreferenciaMP: p.idPreferenciaMP ?? undefined,
    fecha:         p.creadoEn.toISOString(),
    cliente: {
      nombre:       p.clienteNombre,
      email:        p.clienteEmail,
      telefono:     p.clienteTelefono,
      direccion:    p.clienteDireccion,
      ciudad:       p.clienteCiudad,
      provincia:    p.clienteProvincia,
      codigoPostal: p.clienteCodigoPostal,
      notas:        p.clienteNotas ?? undefined,
    },
    items: (p.items ?? []).map((i: any) => ({
      productoId:     i.productoId,
      titulo:         i.titulo,
      cantidad:       i.cantidad,
      precioUnitario: i.precioUnitario,
    })),
  };
}

// ── LECTURA ───────────────────────────────────────────────

export async function obtenerPedidos(): Promise<Pedido[]> {
  const rows = await prisma.pedido.findMany({
    include: { items: true },
    orderBy: { creadoEn: 'desc' },
  });
  return rows.map(mapPrismaToPedido);
}

export async function obtenerPedidoPorId(id: string): Promise<Pedido | null> {
  const p = await prisma.pedido.findUnique({
    where: { id },
    include: { items: true },
  });
  return p ? mapPrismaToPedido(p) : null;
}

// ── ESCRITURA ─────────────────────────────────────────────

export async function crearPedido(datos: {
  cliente: Pedido['cliente'];
  items: Array<{ productoId: string; titulo: string; cantidad: number; precioUnitario: number }>;
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string;
  opcionEnvio?: string;
}): Promise<Pedido> {
  const p = await prisma.pedido.create({
    data: {
      estado:              'pendiente',
      metodoPago:          datos.metodoPago,
      subtotal:            datos.subtotal,
      costoEnvio:          datos.costoEnvio,
      total:               datos.total,
      opcionEnvio:         datos.opcionEnvio ?? null,
      clienteNombre:       datos.cliente.nombre,
      clienteEmail:        datos.cliente.email,
      clienteTelefono:     datos.cliente.telefono,
      clienteDireccion:    datos.cliente.direccion,
      clienteCiudad:       datos.cliente.ciudad,
      clienteProvincia:    datos.cliente.provincia,
      clienteCodigoPostal: datos.cliente.codigoPostal,
      clienteNotas:        datos.cliente.notas ?? null,
      items: {
        create: datos.items.map(i => ({
          productoId:     i.productoId,
          titulo:         i.titulo,
          cantidad:       i.cantidad,
          precioUnitario: i.precioUnitario,
        })),
      },
    },
    include: { items: true },
  });
  return mapPrismaToPedido(p);
}

export async function actualizarEstado(
  id: string,
  estado: EstadoPedido,
): Promise<Pedido | null> {
  try {
    const p = await prisma.pedido.update({
      where: { id },
      data: { estado },
      include: { items: true },
    });
    return mapPrismaToPedido(p);
  } catch {
    return null;
  }
}

export async function cargarTracking(
  id: string,
  trackingCorreo: string,
): Promise<Pedido | null> {
  try {
    const pedido = await prisma.pedido.findUnique({ where: { id } });
    const p = await prisma.pedido.update({
      where: { id },
      data: {
        trackingCorreo,
        estado: pedido?.estado === 'pagado' ? 'enviado' : undefined,
      },
      include: { items: true },
    });
    return mapPrismaToPedido(p);
  } catch {
    return null;
  }
}

// Export _db alias for legacy compatibility (webhook uses it)
export const _db: any[] = [];
