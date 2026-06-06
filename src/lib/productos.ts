// ============================================================
// PRODUCTOS — Capa de datos con Prisma (PostgreSQL)
// Migrado desde array en memoria para persistencia real.
// ============================================================

import { Producto, Categoria } from '@/types';
import { generarSlug, generarId } from './utils';
import prisma from './prisma';

// ── Convertir registro Prisma → tipo Producto de la app ───
function mapPrismaToProducto(p: any): Producto {
  return {
    id:                  p.id,
    titulo:              p.titulo,
    slug:                p.slug,
    descripcion:         p.descripcion,
    descripcionCorta:    p.descripcionCorta,
    precio:              p.precio,
    precioOriginal:      p.precioOriginal ?? undefined,
    enPromocion:         p.enPromocion,
    descuentoPorcentaje: p.descuentoPorcentaje ?? undefined,
    imagenes:            p.imagenes,
    stock:               p.stock,
    categoria:           p.categoria as Categoria,
    destacado:           p.destacado,
    etiquetas:           p.etiquetas,
    creadoEn:            p.creadoEn.toISOString(),
    actualizadoEn:       p.actualizadoEn.toISOString(),
  };
}

// ── LECTURA ───────────────────────────────────────────────

export async function obtenerProductos(filtros?: {
  categoria?: Categoria;
  destacado?: boolean;
  busqueda?: string;
}): Promise<Producto[]> {
  const where: any = {};
  if (filtros?.categoria) where.categoria = filtros.categoria;
  if (filtros?.destacado !== undefined) where.destacado = filtros.destacado;
  if (filtros?.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    where.OR = [
      { titulo:          { contains: q, mode: 'insensitive' } },
      { descripcionCorta:{ contains: q, mode: 'insensitive' } },
    ];
  }
  const rows = await prisma.producto.findMany({ where, orderBy: { creadoEn: 'desc' } });
  return rows.map(mapPrismaToProducto);
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto | null> {
  const p = await prisma.producto.findUnique({ where: { slug } });
  return p ? mapPrismaToProducto(p) : null;
}

export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
  const p = await prisma.producto.findUnique({ where: { id } });
  return p ? mapPrismaToProducto(p) : null;
}

export async function obtenerRelacionados(
  productoId: string,
  categoria: Categoria,
  limite = 4,
): Promise<Producto[]> {
  const rows = await prisma.producto.findMany({
    where: { id: { not: productoId }, categoria },
    take: limite,
    orderBy: { destacado: 'desc' },
  });
  return rows.map(mapPrismaToProducto);
}

// ── ESCRITURA ─────────────────────────────────────────────

export async function crearProducto(
  datos: Omit<Producto, 'id' | 'slug' | 'creadoEn' | 'actualizadoEn'>
): Promise<Producto> {
  const slug = generarSlug(datos.titulo);
  const p = await prisma.producto.create({
    data: {
      titulo:              datos.titulo,
      slug,
      descripcion:         datos.descripcion,
      descripcionCorta:    datos.descripcionCorta,
      precio:              datos.precio,
      precioOriginal:      datos.precioOriginal ?? null,
      enPromocion:         datos.enPromocion ?? false,
      descuentoPorcentaje: datos.descuentoPorcentaje ?? null,
      imagenes:            datos.imagenes,
      stock:               datos.stock,
      categoria:           datos.categoria,
      destacado:           datos.destacado,
      etiquetas:           datos.etiquetas ?? [],
    },
  });
  return mapPrismaToProducto(p);
}

export async function actualizarProducto(
  id: string,
  datos: Partial<Producto>,
): Promise<Producto | null> {
  try {
    const update: any = { ...datos };
    if (datos.titulo) update.slug = generarSlug(datos.titulo);
    delete update.id;
    delete update.creadoEn;
    delete update.actualizadoEn;
    const p = await prisma.producto.update({ where: { id }, data: update });
    return mapPrismaToProducto(p);
  } catch {
    return null;
  }
}

export async function eliminarProducto(id: string): Promise<boolean> {
  try {
    await prisma.producto.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── STOCK ─────────────────────────────────────────────────

export async function actualizarStock(
  id: string,
  cantidad: number,
): Promise<{ ok: boolean; stockActual: number }> {
  try {
    const actual = await prisma.producto.findUnique({ where: { id }, select: { stock: true } });
    if (!actual) return { ok: false, stockActual: 0 };
    const nuevoStock = Math.max(0, actual.stock + cantidad);
    await prisma.producto.update({ where: { id }, data: { stock: nuevoStock } });
    return { ok: true, stockActual: nuevoStock };
  } catch {
    return { ok: false, stockActual: 0 };
  }
}

export async function setStock(
  id: string,
  stockNuevo: number,
): Promise<{ ok: boolean; stockActual: number }> {
  try {
    const stock = Math.max(0, stockNuevo);
    await prisma.producto.update({ where: { id }, data: { stock } });
    return { ok: true, stockActual: stock };
  } catch {
    return { ok: false, stockActual: 0 };
  }
}

// ── PROMOCIONES ───────────────────────────────────────────

export async function aplicarDescuento(
  ids: string[],
  porcentaje: number,
): Promise<number> {
  const factor = 1 - porcentaje / 100;
  const where = ids.length > 0 ? { id: { in: ids } } : {};
  const productos = await prisma.producto.findMany({ where });
  let actualizados = 0;
  for (const p of productos) {
    const precioOriginal = p.precioOriginal ?? p.precio;
    await prisma.producto.update({
      where: { id: p.id },
      data: {
        precioOriginal,
        precio:              Math.round(precioOriginal * factor),
        enPromocion:         true,
        descuentoPorcentaje: porcentaje,
      },
    });
    actualizados++;
  }
  return actualizados;
}

export async function quitarDescuento(ids: string[]): Promise<number> {
  const where = ids.length > 0 ? { id: { in: ids } } : {};
  const productos = await prisma.producto.findMany({ where, select: { id: true, precioOriginal: true } });
  let actualizados = 0;
  for (const p of productos) {
    if (!p.precioOriginal) continue;
    await prisma.producto.update({
      where: { id: p.id },
      data: {
        precio:              p.precioOriginal,
        precioOriginal:      null,
        enPromocion:         false,
        descuentoPorcentaje: null,
      },
    });
    actualizados++;
  }
  return actualizados;
}
