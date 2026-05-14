import { Pedido, EstadoPedido } from '@/types';
import { generarId } from './utils';

export let _db: Pedido[] = [];

export async function obtenerPedidos(): Promise<Pedido[]> {
  return [..._db].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export async function obtenerPedidoPorId(id: string): Promise<Pedido | null> {
  return _db.find(p => p.id === id) ?? null;
}

export async function crearPedido(datos: Omit<Pedido, 'id' | 'fecha' | 'estado'>): Promise<Pedido> {
  const nuevo: Pedido = { ...datos, id: generarId(), fecha: new Date().toISOString(), estado: 'pendiente' };
  _db.push(nuevo);
  return nuevo;
}

export async function actualizarEstado(id: string, estado: EstadoPedido): Promise<Pedido | null> {
  const p = _db.find(p => p.id === id);
  if (!p) return null;
  p.estado = estado;
  return p;
}

export async function cargarTracking(id: string, trackingCorreo: string): Promise<Pedido | null> {
  const pedido = _db.find(p => p.id === id);
  if (!pedido) return null;
  pedido.trackingCorreo = trackingCorreo;
  // Avanzar estado a enviado automáticamente si estaba en pagado
  if (pedido.estado === 'pagado') pedido.estado = 'enviado';
  return pedido;
}
