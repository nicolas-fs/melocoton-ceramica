// ============================================================
// REPOSITORIO DE PRODUCTOS CON SUPABASE
//
// Para activar: reemplazá src/lib/productos.ts con este archivo
// (o que productos.ts lo importe según si SUPABASE está configurado)
// ============================================================

import { createServerClient, supabase } from './client';
import { Producto, Categoria } from '@/types';
import { generarSlug } from '@/lib/utils';

// Convertir fila de Supabase → tipo Producto
function rowToProducto(row: any): Producto {
  return {
    id:                   row.id,
    titulo:               row.titulo,
    slug:                 row.slug,
    descripcion:          row.descripcion,
    descripcionCorta:     row.descripcion_corta,
    precio:               Number(row.precio),
    precioOriginal:       row.precio_original ? Number(row.precio_original) : undefined,
    enPromocion:          row.en_promocion,
    descuentoPorcentaje:  row.descuento_porcentaje ?? undefined,
    imagenes:             row.imagenes ?? [],
    stock:                row.stock,
    categoria:            row.categoria as Categoria,
    destacado:            row.destacado,
    etiquetas:            row.etiquetas ?? [],
    creadoEn:             row.creado_en,
    actualizadoEn:        row.actualizado_en,
  };
}

// Convertir tipo Producto → fila de Supabase
function productoToRow(p: Partial<Producto>) {
  const row: any = {};
  if (p.titulo              !== undefined) row.titulo               = p.titulo;
  if (p.slug                !== undefined) row.slug                 = p.slug;
  if (p.descripcion         !== undefined) row.descripcion          = p.descripcion;
  if (p.descripcionCorta    !== undefined) row.descripcion_corta    = p.descripcionCorta;
  if (p.precio              !== undefined) row.precio               = p.precio;
  if (p.precioOriginal      !== undefined) row.precio_original      = p.precioOriginal;
  if (p.enPromocion         !== undefined) row.en_promocion         = p.enPromocion;
  if (p.descuentoPorcentaje !== undefined) row.descuento_porcentaje = p.descuentoPorcentaje;
  if (p.imagenes            !== undefined) row.imagenes             = p.imagenes;
  if (p.stock               !== undefined) row.stock                = p.stock;
  if (p.categoria           !== undefined) row.categoria            = p.categoria;
  if (p.destacado           !== undefined) row.destacado            = p.destacado;
  if (p.etiquetas           !== undefined) row.etiquetas            = p.etiquetas;
  return row;
}

// ── LECTURA (pública) ─────────────────────────────────────

export async function obtenerProductosSB(filtros?: {
  categoria?: Categoria;
  destacado?: boolean;
  busqueda?: string;
  soloEnPromo?: boolean;
}): Promise<Producto[]> {
  let query = supabase.from('productos').select('*');

  if (filtros?.categoria)  query = query.eq('categoria', filtros.categoria);
  if (filtros?.destacado !== undefined) query = query.eq('destacado', filtros.destacado);
  if (filtros?.soloEnPromo) query = query.eq('en_promocion', true);
  if (filtros?.busqueda) {
    query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion_corta.ilike.%${filtros.busqueda}%`);
  }

  query = query.order('creado_en', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(`[SB] obtenerProductos: ${error.message}`);
  return (data ?? []).map(rowToProducto);
}

export async function obtenerProductoPorSlugSB(slug: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return rowToProducto(data);
}

export async function obtenerProductoPorIdSB(id: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToProducto(data);
}

export async function obtenerRelacionadosSB(
  productoId: string,
  categoria: Categoria,
  limite = 4
): Promise<Producto[]> {
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', categoria)
    .neq('id', productoId)
    .limit(limite);

  return (data ?? []).map(rowToProducto);
}

// ── ESCRITURA (solo server / admin) ──────────────────────

export async function crearProductoSB(
  datos: Omit<Producto, 'id' | 'slug' | 'creadoEn' | 'actualizadoEn'>
): Promise<Producto> {
  const db = createServerClient();
  const row = productoToRow({
    ...datos,
    slug: generarSlug(datos.titulo),
  });

  const { data, error } = await db
    .from('productos')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`[SB] crearProducto: ${error.message}`);
  return rowToProducto(data);
}

export async function actualizarProductoSB(
  id: string,
  datos: Partial<Producto>
): Promise<Producto | null> {
  const db = createServerClient();
  if (datos.titulo) datos.slug = generarSlug(datos.titulo);

  const { data, error } = await db
    .from('productos')
    .update(productoToRow(datos))
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return rowToProducto(data);
}

export async function eliminarProductoSB(id: string): Promise<boolean> {
  const db = createServerClient();
  const { error } = await db.from('productos').delete().eq('id', id);
  return !error;
}

export async function actualizarStockSB(
  id: string,
  delta: number
): Promise<{ ok: boolean; stockActual: number }> {
  const db = createServerClient();
  const { data, error } = await db.rpc('actualizar_stock', { p_id: id, p_delta: delta });
  if (error) return { ok: false, stockActual: 0 };
  return { ok: true, stockActual: data };
}

export async function setStockSB(
  id: string,
  stockNuevo: number
): Promise<{ ok: boolean; stockActual: number }> {
  const db = createServerClient();
  const { data, error } = await db
    .from('productos')
    .update({ stock: Math.max(0, stockNuevo) })
    .eq('id', id)
    .select('stock')
    .single();

  if (error) return { ok: false, stockActual: 0 };
  return { ok: true, stockActual: data.stock };
}

export async function aplicarDescuentoSB(
  ids: string[],
  porcentaje: number
): Promise<number> {
  const db = createServerClient();
  let query = db.from('productos').select('id, precio, precio_original');
  if (ids.length > 0) query = query.in('id', ids);

  const { data } = await query;
  if (!data) return 0;

  let actualizados = 0;
  for (const p of data) {
    const precioBase = p.precio_original ?? p.precio;
    const { error } = await db.from('productos').update({
      precio_original:      precioBase,
      precio:               Math.round(precioBase * (1 - porcentaje / 100)),
      en_promocion:         true,
      descuento_porcentaje: porcentaje,
    }).eq('id', p.id);
    if (!error) actualizados++;
  }
  return actualizados;
}

export async function quitarDescuentoSB(ids: string[]): Promise<number> {
  const db = createServerClient();
  let query = db.from('productos').select('id, precio_original').not('precio_original', 'is', null);
  if (ids.length > 0) query = query.in('id', ids);

  const { data } = await query;
  if (!data) return 0;

  let actualizados = 0;
  for (const p of data) {
    const { error } = await db.from('productos').update({
      precio:               p.precio_original,
      precio_original:      null,
      en_promocion:         false,
      descuento_porcentaje: null,
    }).eq('id', p.id);
    if (!error) actualizados++;
  }
  return actualizados;
}
