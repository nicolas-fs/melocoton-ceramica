'use client';
import { useState, useEffect, useRef } from 'react';
import { Producto, Categoria } from '@/types';
import { formatearPrecio, generarSlug } from '@/lib/utils';
import { CATEGORIAS } from '../../../../data/productos';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, Check,
  Star, Package, Minus, Tag, Search,
  ChevronUp, ChevronDown, Eye, Upload,
} from 'lucide-react';

// ── Control de stock inline ───────────────────────────────
function StockInline({ producto, onUpdate }: { producto: Producto; onUpdate: (id: string, stock: number) => void }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor]       = useState(producto.stock);
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
      toast.success(`Stock: ${valor} unidades`);
      setEditando(false);
    } catch { toast.error('Error al actualizar stock'); }
    finally { setGuardando(false); }
  }
  if (editando) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button onClick={() => setValor(v => Math.max(0, v - 1))}
                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100">
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
                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100">
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
    <button onClick={() => setEditando(true)} title="Click para editar stock"
            className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 ${
              producto.stock === 0 ? 'bg-red-100 text-red-600 hover:ring-red-300' :
              producto.stock <= 3 ? 'bg-yellow-100 text-yellow-700 hover:ring-yellow-300' :
              'bg-green-100 text-green-700 hover:ring-green-300'
            }`}>
      {producto.stock === 0 ? 'Sin stock' : `${producto.stock} und.`}
    </button>
  );
}

// ── Compresión de imagen en el navegador ─────────────────
function comprimirImagen(file: File, maxPx = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
          else                { width  = Math.round(width  * maxPx / height); height = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Componente de upload de una imagen ───────────────────
function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo JPG, PNG o WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Max 10 MB.');
      return;
    }
    comprimirImagen(file, 1200, 0.82).then(b64 => {
      onChange(b64);
      setPreview(b64);
    });
  }

  function clear() {
    setPreview(null);
    onChange('');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex gap-3 items-start">
        <label
          htmlFor={`img-${label}`}
          className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-melocoton-300 rounded-xl cursor-pointer hover:border-melocoton-500 hover:bg-melocoton-50 transition-all"
        >
          <Upload className="w-5 h-5 text-melocoton-400 mb-1" />
          <p className="text-xs text-tierra-600 font-medium">Elegir foto</p>
          <p className="text-xs text-tierra-400">JPG, PNG o WebP</p>
          <input
            id={`img-${label}`}
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        {preview && (
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa" className="w-20 h-20 rounded-xl object-cover border-2 border-melocoton-200" onError={() => setPreview(null)} />
            <button type="button" onClick={clear}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 font-bold">
              x
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <details className="mt-1.5">
        <summary className="text-xs text-tierra-400 cursor-pointer hover:text-tierra-600 select-none">O pegar una URL</summary>
        <input
          type="text"
          value={value.startsWith('data:') ? '' : value}
          onChange={e => { onChange(e.target.value.trim()); setPreview(e.target.value.trim() || null); }}
          className="form-input text-xs mt-1.5"
          placeholder="https://res.cloudinary.com/..."
        />
      </details>
    </div>
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
    titulo:           producto?.titulo           ?? '',
    descripcionCorta: producto?.descripcionCorta ?? '',
    descripcion:      producto?.descripcion      ?? '',
    precio:           producto?.precio           ?? 0,
    stock:            producto?.stock            ?? 0,
    categoria:        (producto?.categoria       ?? 'tazas') as Categoria,
    imagen1:          producto?.imagenes?.[0]    ?? '',
    imagen2:          producto?.imagenes?.[1]    ?? '',
    etiquetas:        producto?.etiquetas?.join(', ') ?? '',
    destacado:        producto?.destacado        ?? false,
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.titulo.trim()) { toast.error('El titulo es obligatorio'); return; }
    if (Number(f.precio) <= 0) { toast.error('El precio debe ser mayor a 0'); return; }
    const imagenes = [f.imagen1, f.imagen2].filter(Boolean);
    await onGuardar({
      ...f,
      precio:    Number(f.precio),
      stock:     Number(f.stock),
      imagenes,
      etiquetas: f.etiquetas.split(',').map((s: string) => s.trim()).filter(Boolean),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-auto bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl text-tierra-900 font-semibold">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Titulo */}
          <div>
            <label className="form-label">Titulo *</label>
            <input value={f.titulo} onChange={e => set('titulo', e.target.value)}
                   className="form-input" placeholder='Taza "Lo estas haciendo bien"' required />
            {f.titulo && (
              <p className="text-xs text-tierra-400 mt-1">URL: /producto/{generarSlug(f.titulo)}</p>
            )}
          </div>
          {/* Precio + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Precio (ARS) *</label>
              <input type="number" value={f.precio} onChange={e => set('precio', e.target.value)}
                     className="form-input" min={0} step={500} required />
              {Number(f.precio) > 0 && (
                <p className="text-xs mt-1" style={{ color: '#E8654A' }}>{formatearPrecio(Number(f.precio))}</p>
              )}
            </div>
            <div>
              <label className="form-label">Stock</label>
              <input type="number" value={f.stock} onChange={e => set('stock', e.target.value)}
                     className="form-input" min={0} />
              <p className="text-xs text-tierra-400 mt-1">
                {Number(f.stock) === 0 ? 'Sin stock' : Number(f.stock) <= 3 ? 'Stock bajo' : 'Disponible'}
              </p>
            </div>
          </div>
          {/* Categoria + Destacado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Categoria</label>
              <select value={f.categoria} onChange={e => set('categoria', e.target.value)} className="form-input">
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="dest" checked={f.destacado}
                     onChange={e => set('destacado', e.target.checked)}
                     className="w-4 h-4 accent-melocoton-400" />
              <label htmlFor="dest" className="text-sm text-tierra-700 cursor-pointer">
                Mostrar en la home
              </label>
            </div>
          </div>
          {/* Descripcion corta */}
          <div>
            <label className="form-label">Descripcion corta</label>
            <textarea value={f.descripcionCorta} onChange={e => set('descripcionCorta', e.target.value)}
                      className="form-input resize-none" rows={2}
                      placeholder="Una linea que resuma la pieza." />
          </div>
          {/* Descripcion completa */}
          <div>
            <label className="form-label">Descripcion completa</label>
            <textarea value={f.descripcion} onChange={e => set('descripcion', e.target.value)}
                      className="form-input resize-none text-xs" rows={4}
                      placeholder="Usa **negrita** para resaltar." />
          </div>
          {/* FOTOS — ahora con 2 campos */}
          <div className="space-y-3">
            <div className="bg-melocoton-50 border border-melocoton-100 rounded-xl px-4 py-3">
              <p className="text-xs text-melocoton-700 font-medium mb-1">Galeria de fotos</p>
              <p className="text-xs text-tierra-500">Subi 2 fotos para mostrar la pieza desde distintos angulos. La primera es la principal, la segunda aparece al pasar el mouse o al deslizar en el celular.</p>
            </div>
            <ImageUploader
              label="Foto principal (frente de la pieza) *"
              value={f.imagen1}
              onChange={v => set('imagen1', v)}
            />
            <ImageUploader
              label="Foto secundaria (atras o detalle) — opcional"
              value={f.imagen2}
              onChange={v => set('imagen2', v)}
            />
          </div>
          {/* Etiquetas */}
          <div>
            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input value={f.etiquetas} onChange={e => set('etiquetas', e.target.value)}
                   className="form-input" placeholder="regalo, frases, personalizable" />
          </div>
          {/* Botones */}
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

// ── PAGINA PRINCIPAL ──────────────────────────────────────
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
      const url    = editando ? `/api/productos/${editando.id}` : '/api/productos';
      const method = editando ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!r.ok) throw new Error();
      toast.success(editando ? 'Producto actualizado' : 'Producto creado');
      setModal(false);
      cargar();
    } catch { toast.error('Error al guardar'); }
    finally { setGuardando(false); }
  }

  async function eliminar(id: string, titulo: string) {
    if (!confirm(`Eliminar "${titulo}"? No se puede deshacer.`)) return;
    try {
      await fetch(`/api/productos/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      setProductos(p => p.filter(x => x.id !== id));
    } catch { toast.error('Error al eliminar'); }
  }

  function updateStock(id: string, stock: number) {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
  }

  function cambiarOrden(col: OrdenCol) {
    if (orden === col) setAsc(a => !a);
    else { setOrden(col); setAsc(true); }
  }

  const filtrados = productos
    .filter(p => !busqueda ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      let va: any = a[orden], vb: any = b[orden];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return asc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const sinStock = productos.filter(p => p.stock === 0).length;

  const Th = ({ col, label }: { col: OrdenCol; label: string }) => (
    <th className="text-xs text-tierra-400 uppercase tracking-wide px-4 py-3 cursor-pointer hover:text-tierra-700 select-none whitespace-nowrap text-left"
        onClick={() => cambiarOrden(col)}>
      <span className="flex items-center gap-1">
        {label}
        {orden === col ? (asc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
      </span>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl text-tierra-900 font-semibold">Productos</h1>
          <p className="text-sm text-tierra-500 mt-1">
            {productos.length} productos
            {sinStock > 0 && <span className="text-red-500 ml-2">· {sinStock} sin stock</span>}
          </p>
        </div>
        <button
          onClick={() => { setEditando(undefined); setModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
          style={{ backgroundColor: '#E8654A', minWidth: '160px', justifyContent: 'center' }}
        >
          <Plus className="w-5 h-5" />
          Agregar producto
        </button>
      </div>
      {/* Busqueda */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tierra-400" />
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
               placeholder="Buscar por nombre o categoria..."
               className="form-input pl-9 text-sm" />
      </div>
      {/* Tabla */}
      {cargando ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-tierra-200 mx-auto mb-3" />
          <p className="text-lg text-tierra-500">
            {busqueda ? 'No hay resultados.' : 'No hay productos todavia.'}
          </p>
          {!busqueda && (
            <button onClick={() => { setEditando(undefined); setModal(true); }} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> Agregar el primero
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="text-xs text-tierra-400 uppercase tracking-wide px-4 py-3 text-left">Producto</th>
                  <Th col="precio" label="Precio" />
                  <Th col="stock" label="Stock" />
                  <Th col="categoria" label="Categoria" />
                  <th className="text-xs text-tierra-400 uppercase tracking-wide px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-melocoton-50">
                          {p.imagenes[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imagenes[0]} alt={p.titulo} className="w-full h-full object-cover"
                                 onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : null}
                          {/* Indicador de segunda foto */}
                          {p.imagenes[1] && (
                            <span className="absolute bottom-0 right-0 bg-melocoton-500 text-white text-[9px] px-1 rounded-tl font-bold">2</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-tierra-900 truncate max-w-[200px]">{p.titulo}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-tierra-900 font-medium">{formatearPrecio(p.precio)}</p>
                      {p.precioOriginal && (
                        <p className="text-xs text-tierra-400 line-through">{formatearPrecio(p.precioOriginal)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockInline producto={p} onUpdate={updateStock} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-tierra-500 capitalize">{p.categoria}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/producto/${p.slug}`} target="_blank" rel="noopener"
                           className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-tierra-400"
                           title="Ver en sitio">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => { setEditando(p); setModal(true); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-400"
                                title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => eliminar(p.id, p.titulo)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"
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
            <p className="text-xs text-tierra-400">
              Click en el badge de stock para editarlo · Los productos con 2 fotos muestran el badge naranja
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
