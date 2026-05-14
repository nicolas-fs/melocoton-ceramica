'use client';

import { useState, useEffect } from 'react';
import { Producto, Categoria } from '@/types';
import { formatearPrecio, generarSlug } from '@/lib/utils';
import { CATEGORIAS } from '../../../../data/productos';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, Check,
  Star, Package, Minus, Tag, Search,
  ChevronUp, ChevronDown, Eye,
} from 'lucide-react';

// ── Control de stock inline ───────────────────────────────
function StockInline({ producto, onUpdate }: { producto: Producto; onUpdate: (id: string, stock: number) => void }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(producto.stock);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (valor === producto.stock) { setEditando(false); return; }
    setGuardando(true);
    try {
      const r = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: producto.id, stock: valor }),
      });
      if (!r.ok) throw new Error();
      onUpdate(producto.id, valor);
      toast.success(`Stock actualizado: ${valor} unidades`);
      setEditando(false);
    } catch {
      toast.error('Error al actualizar stock');
    } finally { setGuardando(false); }
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button onClick={() => setValor(v => Math.max(0, v - 1))}
                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-tierra-600">
          <Minus className="w-3 h-3" />
        </button>
        <input type="number" value={valor}
               onChange={e => setValor(Math.max(0, Number(e.target.value)))}
               className="w-12 text-center text-sm border border-melocoton-300 rounded-lg px-1 py-1 focus:outline-none focus:ring-1 focus:ring-melocoton-400"
               min={0} autoFocus
               onKeyDown={e => {
                 if (e.key === 'Enter') guardar();
                 if (e.key === 'Escape') { setEditando(false); setValor(producto.stock); }
               }} />
        <button onClick={() => setValor(v => v + 1)}
                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-tierra-600">
          <Plus className="w-3 h-3" />
        </button>
        <button onClick={guardar} disabled={guardando}
                className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 disabled:opacity-50">
          <Check className="w-3 h-3" />
        </button>
        <button onClick={() => { setEditando(false); setValor(producto.stock); }}
                className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditando(true)}
      title="Click para editar stock"
      className={`font-sans text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 ${
        producto.stock === 0 ? 'bg-red-100 text-red-600 hover:ring-red-300' :
        producto.stock <= 3 ? 'bg-yellow-100 text-yellow-700 hover:ring-yellow-300' :
        'bg-green-100 text-green-700 hover:ring-green-300'
      }`}
    >
      {producto.stock === 0 ? '⚠ Sin stock' : `${producto.stock} und.`}
    </button>
  );
}

// ── Modal crear/editar ────────────────────────────────────
function ProductoModal({ producto, onGuardar, onCerrar, guardando }: {
  producto?: Producto;
  onGuardar: (datos: any) => Promise<void>;
  onCerrar: () => void;
  guardando: boolean;
}) {
  const [f, setF] = useState({
    titulo:          producto?.titulo          ?? '',
    descripcionCorta:producto?.descripcionCorta?? '',
    descripcion:     producto?.descripcion     ?? '',
    precio:          producto?.precio          ?? 0,
    stock:           producto?.stock           ?? 0,
    categoria:       (producto?.categoria      ?? 'tazas') as Categoria,
    imagenes:        producto?.imagenes?.join('\n') ?? '',
    etiquetas:       producto?.etiquetas?.join(', ') ?? '',
    destacado:       producto?.destacado       ?? false,
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));
  const [preview, setPreview] = useState<string | null>(f.imagenes.split('\n')[0]?.trim() || null);

  function handleImageChange(val: string) {
    set('imagenes', val);
    const first = val.split('\n')[0]?.trim();
    setPreview(first || null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.titulo.trim()) { toast.error('El título es obligatorio'); return; }
    if (Number(f.precio) <= 0) { toast.error('El precio debe ser mayor a 0'); return; }
    await onGuardar({
      ...f,
      precio: Number(f.precio),
      stock: Number(f.stock),
      imagenes: f.imagenes.split('\n').map((s: string) => s.trim()).filter(Boolean),
      etiquetas: f.etiquetas.split(',').map((s: string) => s.trim()).filter(Boolean),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-auto bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-xl text-tierra-900">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Título + slug preview */}
          <div>
            <label className="form-label">Título *</label>
            <input value={f.titulo} onChange={e => set('titulo', e.target.value)}
                   className="form-input" placeholder='Ej: Taza "Lo estás haciendo bien"' required />
            {f.titulo && (
              <p className="font-sans text-xs text-tierra-400 mt-1">
                URL: /producto/<strong>{generarSlug(f.titulo)}</strong>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Precio (ARS) *</label>
              <input type="number" value={f.precio} onChange={e => set('precio', e.target.value)}
                     className="form-input" min={0} step={500} required />
              {Number(f.precio) > 0 && (
                <p className="font-sans text-xs text-melocoton-600 mt-1">{formatearPrecio(Number(f.precio))}</p>
              )}
            </div>
            <div>
              <label className="form-label">Stock</label>
              <input type="number" value={f.stock} onChange={e => set('stock', e.target.value)}
                     className="form-input" min={0} />
              <p className="font-sans text-xs text-tierra-400 mt-1">
                {Number(f.stock) === 0 ? '⚠ Sin stock' : Number(f.stock) <= 3 ? '⚠ Stock bajo' : '✓ OK'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Categoría</label>
              <select value={f.categoria} onChange={e => set('categoria', e.target.value)} className="form-input">
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="dest" checked={f.destacado}
                     onChange={e => set('destacado', e.target.checked)}
                     className="w-4 h-4 accent-melocoton-400" />
              <label htmlFor="dest" className="font-sans text-sm text-tierra-700 cursor-pointer">
                ✨ Mostrar en la home
              </label>
            </div>
          </div>

          <div>
            <label className="form-label">Descripción corta (para las tarjetas)</label>
            <textarea value={f.descripcionCorta} onChange={e => set('descripcionCorta', e.target.value)}
                      className="form-input resize-none" rows={2}
                      placeholder="Una línea que resuma la pieza." />
          </div>

          <div>
            <label className="form-label">Descripción completa</label>
            <textarea value={f.descripcion} onChange={e => set('descripcion', e.target.value)}
                      className="form-input resize-none font-mono text-xs" rows={4}
                      placeholder="Usá **negrita** para resaltar. Párrafos separados por línea en blanco." />
          </div>

          {/* Imágenes con preview */}
          <div>
            <label className="form-label">URL de imagen principal</label>
            <div className="flex gap-3">
              <textarea value={f.imagenes} onChange={e => handleImageChange(e.target.value)}
                        className="form-input resize-none font-mono text-xs flex-1" rows={2}
                        placeholder="https://res.cloudinary.com/tu-cloud/image/upload/foto.jpg&#10;(una URL por línea para múltiples fotos)" />
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" referrerPolicy="no-referrer"
                     className="w-20 h-20 rounded-xl object-cover border border-melocoton-200 flex-shrink-0"
                     onError={() => setPreview(null)} />
              )}
            </div>
            <p className="font-sans text-xs text-tierra-400 mt-1">
              💡 Subí las fotos a{' '}
              <a href="https://cloudinary.com" target="_blank" rel="noopener" className="text-melocoton-600 hover:underline">
                Cloudinary
              </a>{' '}
              (gratis) y pegá la URL acá para que no expiren.
            </p>
          </div>

          <div>
            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input value={f.etiquetas} onChange={e => set('etiquetas', e.target.value)}
                   className="form-input" placeholder="regalo, frases, personalizable, mascotas" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={guardando} className="btn-primary flex-1">
              <Check className="w-4 h-4" />
              {guardando ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button type="button" onClick={onCerrar} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
type OrdenCol = 'titulo' | 'precio' | 'stock' | 'categoria';

export default function AdminProductosPage() {
  const [productos, setProductos]   = useState<Producto[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [modal, setModal]           = useState(false);
  const [editando, setEditando]     = useState<Producto | undefined>();
  const [guardando, setGuardando]   = useState(false);
  const [busqueda, setBusqueda]     = useState('');
  const [orden, setOrden]           = useState<OrdenCol>('stock');
  const [asc, setAsc]               = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const r = await fetch('/api/productos');
      const d = await r.json();
      setProductos(d.data || []);
    } catch { toast.error('Error al cargar productos'); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, []);

  async function guardar(datos: any) {
    setGuardando(true);
    try {
      const url = editando ? `/api/productos/${editando.id}` : '/api/productos';
      const r = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!r.ok) throw new Error();
      toast.success(editando ? '✓ Producto actualizado' : '✓ Producto creado');
      setModal(false);
      cargar();
    } catch { toast.error('Error al guardar'); }
    finally { setGuardando(false); }
  }

  async function eliminar(id: string, titulo: string) {
    if (!confirm(`¿Eliminar "${titulo}"? No se puede deshacer.`)) return;
    try {
      await fetch(`/api/productos/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      setProductos(p => p.filter(x => x.id !== id));
    } catch { toast.error('Error al eliminar'); }
  }

  function updateStock(id: string, stock: number) {
    setProductos(p => p.map(x => x.id === id ? { ...x, stock } : x));
  }

  function cambiarOrden(col: OrdenCol) {
    if (orden === col) setAsc(a => !a);
    else { setOrden(col); setAsc(true); }
  }

  const filtrados = productos
    .filter(p =>
      !busqueda ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      let va: any = a[orden], vb: any = b[orden];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return asc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const sinStock = productos.filter(p => p.stock === 0).length;

  const Th = ({ col, label }: { col: OrdenCol; label: string }) => (
    <th
      className="font-sans text-xs text-tierra-400 uppercase tracking-wide px-4 py-3 cursor-pointer hover:text-tierra-700 select-none whitespace-nowrap"
      onClick={() => cambiarOrden(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {orden === col ? (asc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
      </span>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-tierra-900">Productos</h1>
          <p className="font-sans text-sm text-tierra-500 mt-1">
            {productos.length} productos
            {sinStock > 0 && <span className="text-red-500 ml-2">· {sinStock} sin stock</span>}
          </p>
        </div>
        <button onClick={() => { setEditando(undefined); setModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tierra-400" />
        <input
          type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          className="form-input pl-9 text-sm"
        />
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-tierra-200 mx-auto mb-3" />
          <p className="font-serif text-lg text-tierra-500">
            {busqueda ? 'No hay resultados.' : 'No hay productos todavía.'}
          </p>
          {!busqueda && (
            <button onClick={() => { setEditando(undefined); setModal(true); }} className="btn-primary mt-4">
              Crear el primero
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="font-sans text-xs text-tierra-400 uppercase tracking-wide px-4 py-3 text-left">Producto</th>
                  <Th col="precio" label="Precio" />
                  <Th col="stock" label="Stock" />
                  <Th col="categoria" label="Categoría" />
                  <th className="font-sans text-xs text-tierra-400 uppercase tracking-wide px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Producto */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-melocoton-50 relative">
                          {p.imagenes[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imagenes[0]} alt={p.titulo}
                                 referrerPolicy="no-referrer"
                                 className="w-full h-full object-cover"
                                 onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : null}
                          <div className="absolute inset-0 flex items-center justify-center text-lg text-melocoton-300">🏺</div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-medium text-tierra-900 truncate max-w-[200px]">{p.titulo}</p>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {p.destacado && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-melocoton-500">
                                <Star className="w-3 h-3 fill-melocoton-400" /> Destacado
                              </span>
                            )}
                            {p.enPromocion && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-purple-600 bg-purple-50 px-1.5 rounded-full">
                                <Tag className="w-3 h-3" /> {p.descuentoPorcentaje}% off
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-serif text-sm text-tierra-900">{formatearPrecio(p.precio)}</p>
                      {p.precioOriginal && (
                        <p className="font-sans text-xs text-tierra-400 line-through">{formatearPrecio(p.precioOriginal)}</p>
                      )}
                    </td>

                    {/* Stock — editable inline */}
                    <td className="px-4 py-3">
                      <StockInline producto={p} onUpdate={updateStock} />
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-sans text-xs text-tierra-500 capitalize">{p.categoria}</span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/producto/${p.slug}`} target="_blank" rel="noopener"
                           className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-tierra-400 transition-colors"
                           title="Ver en sitio">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => { setEditando(p); setModal(true); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-400 transition-colors"
                                title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => eliminar(p.id, p.titulo)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                                title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <p className="font-sans text-xs text-tierra-400">
              💡 Hacé click en el badge de stock para editarlo directamente · Hacé click en las columnas para ordenar
            </p>
          </div>
        </div>
      )}

      {modal && (
        <ProductoModal
          producto={editando}
          onGuardar={guardar}
          onCerrar={() => setModal(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}
