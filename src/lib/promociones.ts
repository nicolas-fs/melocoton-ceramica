import { Promocion } from '@/types';
import { generarId } from './utils';
import { aplicarDescuento, quitarDescuento } from './productos';

let _db: Promocion[] = [];

export async function obtenerPromociones(): Promise<Promocion[]> {
  return [..._db].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export async function crearPromocion(datos: Omit<Promocion, 'id' | 'creadoEn'>): Promise<Promocion> {
  const nueva: Promocion = { ...datos, id: generarId(), creadoEn: new Date().toISOString() };
  _db.push(nueva);
  if (nueva.activa) {
    await aplicarDescuento(nueva.productosIds, nueva.porcentaje);
  }
  return nueva;
}

export async function togglePromocion(id: string): Promise<Promocion | null> {
  const p = _db.find(p => p.id === id);
  if (!p) return null;
  p.activa = !p.activa;
  if (p.activa) {
    await aplicarDescuento(p.productosIds, p.porcentaje);
  } else {
    await quitarDescuento(p.productosIds);
  }
  return p;
}

export async function eliminarPromocion(id: string): Promise<boolean> {
  const i = _db.findIndex(p => p.id === id);
  if (i === -1) return false;
  if (_db[i].activa) await quitarDescuento(_db[i].productosIds);
  _db.splice(i, 1);
  return true;
}
