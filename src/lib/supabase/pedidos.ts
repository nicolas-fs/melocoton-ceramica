import { createServerClient } from './client';
import { Pedido, DatosCliente, EstadoPedido, MetodoPago } from '@/types';

function rowToPedido(row: any): Pedido {
  return {
    id:               row.id,
    fecha:            row.fecha,
    cliente: {
      nombre:       row.cliente_nombre,
      email:        row.cliente_email,
      telefono:     row.cliente_telefono,
      direccion:    row.cliente_direccion,
      ciudad:       row.cliente_ciudad,
      provincia:    row.cliente_provincia,
      codigoPostal: row.cliente_cp,
      notas:        row.cliente_notas ?? undefined,
    },
    items:            row.items ?? [],
    subtotal:         Number(row.subtotal),
    costoEnvio:       Number(row.costo_envio),
    total:            Number(row.total),
    estado:           row.estado as EstadoPedido,
    metodoPago:       row.metodo_pago as MetodoPago,
    idTransaccionMP:  row.id_transaccion_mp ?? undefined,
    idPreferenciaMP:  row.id_preferencia_mp ?? undefined,
  };
}

export async function obtenerPedidosSB(): Promise<Pedido[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from('pedidos')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) throw new Error(`[SB] obtenerPedidos: ${error.message}`);
  return (data ?? []).map(rowToPedido);
}

export async function obtenerPedidoPorIdSB(id: string): Promise<Pedido | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToPedido(data);
}

export async function crearPedidoSB(
  datos: Omit<Pedido, 'id' | 'fecha' | 'estado'>
): Promise<Pedido> {
  const db = createServerClient();
  const { data, error } = await db
    .from('pedidos')
    .insert({
      cliente_nombre:    datos.cliente.nombre,
      cliente_email:     datos.cliente.email,
      cliente_telefono:  datos.cliente.telefono,
      cliente_direccion: datos.cliente.direccion,
      cliente_ciudad:    datos.cliente.ciudad,
      cliente_provincia: datos.cliente.provincia,
      cliente_cp:        datos.cliente.codigoPostal,
      cliente_notas:     datos.cliente.notas ?? null,
      items:             datos.items,
      subtotal:          datos.subtotal,
      costo_envio:       datos.costoEnvio,
      total:             datos.total,
      metodo_pago:       datos.metodoPago,
    })
    .select()
    .single();

  if (error) throw new Error(`[SB] crearPedido: ${error.message}`);
  return rowToPedido(data);
}

export async function actualizarEstadoSB(
  id: string,
  estado: EstadoPedido
): Promise<Pedido | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from('pedidos')
    .update({ estado })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return rowToPedido(data);
}

export async function actualizarTransaccionMPSB(
  pedidoId: string,
  idTransaccion: string
): Promise<void> {
  const db = createServerClient();
  await db.from('pedidos').update({
    id_transaccion_mp: idTransaccion,
    estado: 'pagado',
  }).eq('id', pedidoId);
}

// ── Métricas para el dashboard ────────────────────────────
export async function obtenerResumenVentasSB() {
  const db = createServerClient();
  const { data } = await db
    .from('resumen_ventas')
    .select('*')
    .limit(12);
  return data ?? [];
}
