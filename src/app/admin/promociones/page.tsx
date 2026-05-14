'use client';

import { useState, useEffect } from 'react';
import { Promocion, Producto } from '@/types';
import { formatearPrecio } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, X, Tag, ToggleLeft, ToggleRight, Trash2, Percent } from 'lucide-react';

// ── Modal crear promoción ─────────────────────────────────
function ModalPromocion({
  productos,
  onGuardar,
  onCerrar,
  guardando,
}: {
  productos: Producto[];
  onGuardar: (datos: any) => Promise<void>;
  onCerrar: () => void;
  guardando: boolean;
}) {
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState(10);
  const [seleccion, setSeleccion] = useState<'todos' | 'categoria' | 'individual'>('todos');
  const [categoria, setCategoria] = useState('tazas');
  const [productosIds, setProductosIds] = useState<string[]>([]);
  const [fechaFin, setFechaFin] = useState('');

  const categorias = [...new Set(productos.map(p => p.categoria))];

  function toggleProducto(id: string) {
    setProductosIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function calcularIds(): string[] {
    if (seleccion === 'todos') return [];
    if (seleccion === 'categoria') return productos.filter(p => p.categoria === categoria).map(p => p.id);
    return productosIds;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (porcentaje < 1 || porcentaje > 90) { toast.error('El descuento debe ser entre 1% y 90%'); return; }
    const ids = calcularIds();
    if (seleccion === 'individual' && ids.length === 0) {
      toast.error('Seleccioná al menos un producto');
      return;
    }
    await onGuardar({
      nombre,
      porcentaje,
      productosIds: ids,
      activa: true,
      fechaInicio: new Date().toISOString(),
      fechaFin: fechaFin || undefined,
    });
  }

  // Preview de productos afectados
  const afectados = seleccion === 'todos'
    ? productos
    : seleccion === 'categoria'
      ? productos.filter(p => p.categoria === categoria)
      : productos.filter(p => productosIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-auto bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-melocoton-500" />
            <h2 className="font-serif text-xl text-tierra-900">Nueva promoción</h2>
          </div>
          <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="form-label">Nombre de la promoción *</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="form-input"
              placeholder='Ej: "Promo Invierno 20% off" o "Liquidación tazones"'
              required
            />
          </div>

          {/* Porcentaje */}
          <div>
            <label className="form-label">Descuento *</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={porcentaje}
                  onChange={e => setPorcentaje(Number(e.target.value))}
                  className="form-input pr-10"
                  min={1}
                  max={90}
                  required
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tierra-400" />
              </div>
              <div className="flex gap-2">
                {[10, 15, 20, 25, 30].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPorcentaje(n)}
                    className={`px-3 py-2 rounded-lg text-sm font-sans font-medium transition-colors
                      ${porcentaje === n ? 'bg-melocoton-400 text-white' : 'bg-melocoton-50 text-melocoton-700 hover:bg-melocoton-100'}`}
                  >
                    {n}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* A qué aplica */}
          <div>
            <label className="form-label">¿A qué productos aplica? *</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { id: 'todos', label: 'Todos los\nproductos' },
                { id: 'categoria', label: 'Una\ncategoría' },
                { id: 'individual', label: 'Seleccionar\nuno a uno' },
              ].map(op => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setSeleccion(op.id as any)}
                  className={`p-3 rounded-xl border-2 text-sm font-sans font-medium whitespace-pre-line transition-all
                    ${seleccion === op.id ? 'border-melocoton-400 bg-melocoton-50 text-melocoton-700' : 'border-gray-200 text-tierra-600 hover:border-melocoton-200'}`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {/* Selector de categoría */}
            {seleccion === 'categoria' && (
              <div className="flex flex-wrap gap-2">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoria(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-sans capitalize transition-colors
                      ${categoria === cat ? 'bg-melocoton-400 text-white' : 'bg-gray-100 text-tierra-600 hover:bg-melocoton-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Selector individual */}
            {seleccion === 'individual' && (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin border border-gray-200 rounded-xl p-3">
                {productos.map(p => (
                  <label key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={productosIds.includes(p.id)}
                      onChange={() => toggleProducto(p.id)}
                      className="w-4 h-4 accent-melocoton-400"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-tierra-900 truncate">{p.titulo}</p>
                      <p className="font-sans text-xs text-tierra-400">{formatearPrecio(p.precio)} · stock: {p.stock}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Fecha de fin (opcional) */}
          <div>
            <label className="form-label">Fecha de fin (opcional)</label>
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="font-sans text-xs text-tierra-400 mt-1">Si no ponés fecha, la promo dura hasta que la desactivés manualmente.</p>
          </div>

          {/* Preview */}
          {afectados.length > 0 && (
            <div className="bg-melocoton-50 rounded-xl p-4 border border-melocoton-200">
              <p className="font-sans text-sm font-semibold text-tierra-800 mb-2">
                Vista previa — {afectados.length} {afectados.length === 1 ? 'producto' : 'productos'} afectados:
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
                {afectados.map(p => {
                  const nuevo = Math.round(p.precio * (1 - porcentaje / 100));
                  return (
                    <div key={p.id} className="flex items-center justify-between">
                      <p className="font-sans text-xs text-tierra-700 truncate flex-1 mr-2">{p.titulo}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-sans text-xs text-tierra-400 line-through">{formatearPrecio(p.precio)}</span>
                        <span className="font-sans text-xs font-bold text-green-600">{formatearPrecio(nuevo)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={guardando} className="btn-primary flex-1">
              {guardando ? 'Creando...' : `✓ Activar promoción (${porcentaje}% off)`}
            </button>
            <button type="button" onClick={onCerrar} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
export default function AdminPromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const [rP, rProd] = await Promise.all([
        fetch('/api/promociones'),
        fetch('/api/productos'),
      ]);
      const [dP, dProd] = await Promise.all([rP.json(), rProd.json()]);
      setPromociones(dP.data || []);
      setProductos(dProd.data || []);
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(datos: any) {
    setGuardando(true);
    try {
      const r = await fetch('/api/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!r.ok) throw new Error();
      toast.success('¡Promoción creada y activa! 🏷️');
      setModal(false);
      cargar();
    } catch {
      toast.error('Error al crear la promoción');
    } finally {
      setGuardando(false);
    }
  }

  async function toggle(id: string) {
    try {
      const r = await fetch(`/api/promociones/${id}`, { method: 'PATCH' });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setPromociones(prev => prev.map(p => p.id === id ? d.data : p));
      toast.success(d.data.activa ? 'Promoción activada ✓' : 'Promoción desactivada');
    } catch {
      toast.error('Error al actualizar');
    }
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Los precios volverán a ser los originales.`)) return;
    try {
      await fetch(`/api/promociones/${id}`, { method: 'DELETE' });
      setPromociones(prev => prev.filter(p => p.id !== id));
      toast.success('Promoción eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  }

  const activas   = promociones.filter(p => p.activa);
  const inactivas = promociones.filter(p => !p.activa);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-tierra-900">Promociones</h1>
          <p className="font-sans text-sm text-tierra-500 mt-1">
            {activas.length} activa{activas.length !== 1 ? 's' : ''} · {promociones.length} en total
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva promoción
        </button>
      </div>

      {/* Promociones activas */}
      {activas.length > 0 && (
        <div className="mb-8">
          <h2 className="font-sans text-sm font-semibold text-tierra-600 uppercase tracking-wide mb-3">
            🟢 Activas ahora
          </h2>
          <div className="space-y-3">
            {activas.map(p => (
              <PromoCard key={p.id} promo={p} productos={productos} onToggle={toggle} onEliminar={eliminar} />
            ))}
          </div>
        </div>
      )}

      {/* Promociones inactivas */}
      {inactivas.length > 0 && (
        <div className="mb-8">
          <h2 className="font-sans text-sm font-semibold text-tierra-600 uppercase tracking-wide mb-3">
            ⚪ Inactivas
          </h2>
          <div className="space-y-3">
            {inactivas.map(p => (
              <PromoCard key={p.id} promo={p} productos={productos} onToggle={toggle} onEliminar={eliminar} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!cargando && promociones.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Tag className="w-12 h-12 text-tierra-200 mx-auto mb-3" />
          <p className="font-serif text-lg text-tierra-500 mb-2">No hay promociones todavía.</p>
          <p className="font-sans text-sm text-tierra-400 mb-6">Creá una promo para aplicar descuentos a tus productos al instante.</p>
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Crear primera promoción
          </button>
        </div>
      )}

      {cargando && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ModalPromocion
          productos={productos}
          onGuardar={guardar}
          onCerrar={() => setModal(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}

// ── Tarjeta de promoción ──────────────────────────────────
function PromoCard({
  promo,
  productos,
  onToggle,
  onEliminar,
}: {
  promo: Promocion;
  productos: Producto[];
  onToggle: (id: string) => void;
  onEliminar: (id: string, nombre: string) => void;
}) {
  const afectados = promo.productosIds.length === 0
    ? productos.length
    : promo.productosIds.length;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 transition-all
      ${promo.activa ? 'border-green-200' : 'border-gray-100 opacity-70'}`}>

      {/* Badge de descuento */}
      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0
        ${promo.activa ? 'bg-green-50' : 'bg-gray-100'}`}>
        <span className={`font-serif text-2xl font-bold leading-none ${promo.activa ? 'text-green-600' : 'text-gray-400'}`}>
          {promo.porcentaje}%
        </span>
        <span className={`font-sans text-[10px] uppercase tracking-wide ${promo.activa ? 'text-green-500' : 'text-gray-400'}`}>
          off
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-tierra-900 truncate">{promo.nombre}</p>
        <p className="font-sans text-xs text-tierra-500 mt-0.5">
          Aplica a {afectados} {afectados === 1 ? 'producto' : 'productos'}
          {promo.productosIds.length === 0 ? ' (todos)' : ''}
        </p>
        {promo.fechaFin && (
          <p className="font-sans text-xs text-tierra-400 mt-0.5">
            Vence: {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' }).format(new Date(promo.fechaFin))}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggle(promo.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors
            ${promo.activa
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-melocoton-100 hover:text-melocoton-700'
            }`}
        >
          {promo.activa
            ? <><ToggleRight className="w-4 h-4" /> Activa</>
            : <><ToggleLeft className="w-4 h-4" /> Inactiva</>
          }
        </button>
        <button
          onClick={() => onEliminar(promo.id, promo.nombre)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
