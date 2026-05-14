import { Producto, Categoria } from '@/types';
import { generarSlug, generarId } from './utils';
import { PRODUCTOS } from '../../data/productos';

// Base de datos en memoria (migrar a Prisma/Supabase cuando estés lista)
let _db: Producto[] = [...PRODUCTOS];

// ── LECTURA ───────────────────────────────────────────────

export async function obtenerProductos(filtros?: {
  categoria?: Categoria;
  destacado?: boolean;
  busqueda?: string;
}): Promise<Producto[]> {
  let r = [..._db];
  if (filtros?.categoria) r = r.filter(p => p.categoria === filtros.categoria);
  if (filtros?.destacado !== undefined) r = r.filter(p => p.destacado === filtros.destacado);
  if (filtros?.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    r = r.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.descripcionCorta.toLowerCase().includes(q)
    );
  }
  return r;
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto | null> {
  return _db.find(p => p.slug === slug) ?? null;
}

export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  return _db.find(p => p.id === id) ?? null;
}

export async function obtenerRelacionados(
  productoId: string,
  categoria: Categoria,
  limite = 4
): Promise<Producto[]> {
  return _db.filter(p => p.id !== productoId && p.categoria === categoria).slice(0, limite);
}

// ── ESCRITURA ─────────────────────────────────────────────

export async function crearProducto(
  datos: Omit<Producto, 'id' | 'slug' | 'creadoEn' | 'actualizadoEn'>
): Promise<Producto> {
  const nuevo: Producto = {
    ...datos,
    id: generarId(),
    slug: generarSlug(datos.titulo),
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };
  _db.push(nuevo);
  return nuevo;
}

export async function actualizarProducto(
  id: string,
  datos: Partial<Producto>
): Promise<Producto | null> {
  const i = _db.findIndex(p => p.id === id);
  if (i === -1) return null;
  if (datos.titulo && datos.titulo !== _db[i].titulo) {
    datos.slug = generarSlug(datos.titulo);
  }
  _db[i] = { ..._db[i], ...datos, actualizadoEn: new Date().toISOString() };
  return _db[i];
}

export async function eliminarProducto(id: string): Promise<boolean> {
  const i = _db.findIndex(p => p.id === id);
  if (i === -1) return false;
  _db.splice(i, 1);
  return true;
}

// ── STOCK ─────────────────────────────────────────────────

/**
 * Modifica el stock de un producto.
 * @param cantidad Negativo para descontar (ventas), positivo para reponer.
 */
export async function actualizarStock(
  id: string,
  cantidad: number
): Promise<{ ok: boolean; stockActual: number }> {
  const p = _db.find(p => p.id === id);
  if (!p) return { ok: false, stockActual: 0 };
  p.stock = Math.max(0, p.stock + cantidad);
  p.actualizadoEn = new Date().toISOString();
  return { ok: true, stockActual: p.stock };
}

/**
 * Actualiza el stock directamente a un valor absoluto.
 * Útil para correcciones manuales desde el admin.
 */
export async function setStock(
  id: string,
  stockNuevo: number
): Promise<{ ok: boolean; stockActual: number }> {
  const p = _db.find(p => p.id === id);
  if (!p) return { ok: false, stockActual: 0 };
  p.stock = Math.max(0, stockNuevo);
  p.actualizadoEn = new Date().toISOString();
  return { ok: true, stockActual: p.stock };
}

// ── PRECIOS Y PROMOCIONES ─────────────────────────────────

/**
 * Aplica un descuento porcentual a uno o más productos.
 * @param ids Array de IDs de productos. Si está vacío, aplica a todos.
 * @param porcentaje Número entre 1 y 99.
 */
export async function aplicarDescuento(
  ids: string[],
  porcentaje: number
): Promise<number> {
  const factor = 1 - porcentaje / 100;
  let actualizados = 0;

  for (const p of _db) {
    if (ids.length === 0 || ids.includes(p.id)) {
      // Guardar precio original si no existe
      if (!p.precioOriginal) p.precioOriginal = p.precio;
      p.precio = Math.round(p.precioOriginal * factor);
      p.enPromocion = true;
      p.descuentoPorcentaje = porcentaje;
      p.actualizadoEn = new Date().toISOString();
      actualizados++;
    }
  }
  return actualizados;
}

/**
 * Quita el descuento y restaura el precio original.
 */
export async function quitarDescuento(ids: string[]): Promise<number> {
  let actualizados = 0;
  for (const p of _db) {
    if (ids.length === 0 || ids.includes(p.id)) {
      if (p.precioOriginal) {
        p.precio = p.precioOriginal;
        p.precioOriginal = undefined;
        p.enPromocion = false;
        p.descuentoPorcentaje = undefined;
        p.actualizadoEn = new Date().toISOString();
        actualizados++;
      }
    }
  }
  return actualizados;
}
