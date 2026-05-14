'use client';

import { useState, useEffect } from 'react';
import { Pedido, EstadoPedido } from '@/types';
import { formatearPrecio, formatearFecha, infoEstadoPedido, getLinkWhatsApp } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronUp, ShoppingBag, Search,
  MessageCircle, Package, Truck, Send, X, Check,
} from 'lucide-react';

const ESTADOS: EstadoPedido[] = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const ESTADO_SIGUIENTE: Record<EstadoPedido, EstadoPedido | null> = {
  pendiente: 'pagado', pagado: 'enviado', enviado: 'entregado', entregado: null, cancelado: null,
};

// ── Modal de tracking ─────────────────────────────────────
function ModalTracking({
  pedido,
  onGuardar,
  onCerrar,
}: {
  pedido: Pedido;
  onGuardar: (id: string, tracking: string) => Promise<void>;
  onCerrar: () => void;
}) {
  const [tracking, setTracking] = useState(pedido.trackingCorreo ?? '');
  const [guardando, setGuardando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tracking.trim()) { toast.error('Ingresá el número de tracking'); return; }
    setGuardando(true);
    await onGuardar(pedido.id, tracking.trim());
    setGuardando(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-melocoton-500" />
            <h2 className="font-serif text-xl text-tierra-900">Cargar número de seguimiento</h2>
          </div>
          <button onClick={onCerrar} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="bg-melocoton-50 rounded-xl p-4 border border-melocoton-100">
            <p className="font-sans text-sm text-tierra-700 font-medium mb-1">📦 Pedido de {pedido.cliente.nombre}</p>
            <p className="font-sans text-xs text-tierra-500">{pedido.items.map(i => `${i.titulo} ×${i.cantidad}`).join(' · ')}</p>
            <p className="font-sans text-xs text-tierra-500 mt-1">
              📍 {pedido.cliente.direccion}, {pedido.cliente.ciudad} (CP {pedido.cliente.codigoPostal})
            </p>
          </div>

          <div>
            <label className="form-label">Número de seguimiento de Correo Argentino *</label>
            <input
              value={tracking}
              onChange={e => setTracking(e.target.value.toUpperCase().replace(/\s/g, ''))}
              className="form-input font-mono text-lg tracking-widest"
              placeholder="RR123456789AR"
              autoFocus
              required
            />
            <p className="font-sans text-xs text-tierra-400 mt-1.5">
              Lo encontrás en el recibo de Correo Argentino al despachar el paquete.
              Formato típico: 2 letras + 9 números + 2 letras (ej: RR123456789AR)
            </p>
          </div>

          {tracking && (
            <a
              href={`https://www.correoargentino.com.ar/formularios/e-commerce/${tracking}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-melocoton-600 hover:underline font-sans"
            >
              🔍 Verificar número en Correo Argentino →
            </a>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="font-sans text-xs text-amber-700 leading-relaxed">
              <strong>Al guardar:</strong> le enviamos automáticamente a <strong>{pedido.cliente.nombre}</strong> un
              WhatsApp y un email con el número de seguimiento y el link para rastrear el paquete. El estado del pedido
              pasará a <strong>Enviado</strong>.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={guardando} className="btn-primary flex-1">
              {guardando
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Notificando...</>
                : <><Send className="w-4 h-4" /> Guardar y notificar al cliente</>
              }
            </button>
            <button type="button" onClick={onCerrar} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Fila expandible de pedido ─────────────────────────────
function FilaPedido({
  pedido,
  onCambiarEstado,
  onCargarTracking,
}: {
  pedido: Pedido;
  onCambiarEstado: (id: string, estado: EstadoPedido) => Promise<void>;
  onCargarTracking: (pedido: Pedido) => void;
}) {
  const [open, setOpen]         = useState(false);
  const [cargando, setCargando] = useState(false);
  const info      = infoEstadoPedido(pedido.estado);
  const siguiente = ESTADO_SIGUIENTE[pedido.estado];

  async function avanzar() {
    if (!siguiente) return;
    setCargando(true);
    await onCambiarEstado(pedido.id, siguiente);
    setCargando(false);
  }

  async function cambiar(estado: EstadoPedido) {
    setCargando(true);
    await onCambiarEstado(pedido.id, estado);
    setCargando(false);
  }

  const waCliente = getLinkWhatsApp(
    `Hola ${pedido.cliente.nombre}! Te escribimos de Melocotón Cerámica sobre tu pedido #${pedido.id.slice(-6).toUpperCase()}.`
  );

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      pedido.estado === 'pendiente' ? 'border-yellow-200' :
      pedido.estado === 'pagado'    ? 'border-green-200' :
      pedido.estado === 'enviado'   ? 'border-blue-200' :
      pedido.estado === 'cancelado' ? 'border-red-100 opacity-60' :
      'border-gray-100'
    }`}>

      {/* Fila principal */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-sans font-medium ${info.bgColor} ${info.color}`}>
          {info.label}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-semibold text-tierra-900 truncate">{pedido.cliente.nombre}</p>
          <p className="font-sans text-xs text-tierra-400">
            {pedido.items.length} {pedido.items.length === 1 ? 'pieza' : 'piezas'} ·
            {pedido.cliente.ciudad} · {formatearFecha(pedido.fecha)}
          </p>
        </div>

        {/* Tracking badge */}
        {pedido.trackingCorreo && (
          <span className="hidden sm:flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-mono flex-shrink-0">
            <Truck className="w-3 h-3" /> {pedido.trackingCorreo}
          </span>
        )}

        <div className="hidden sm:block text-right flex-shrink-0">
          <p className="font-serif text-base text-tierra-900">{formatearPrecio(pedido.total)}</p>
          <p className="font-sans text-xs text-tierra-400 capitalize">{pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'}</p>
        </div>

        {/* Avanzar estado rápido */}
        {siguiente && (
          <button
            onClick={e => { e.stopPropagation(); avanzar(); }}
            disabled={cargando}
            className="flex-shrink-0 hidden md:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-melocoton-50 text-melocoton-700 border border-melocoton-200 hover:bg-melocoton-100 transition-colors font-sans font-medium disabled:opacity-50"
          >
            → {infoEstadoPedido(siguiente).label}
          </button>
        )}

        {open ? <ChevronUp className="w-4 h-4 text-tierra-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-tierra-400 flex-shrink-0" />}
      </div>

      {/* Detalle expandido */}
      {open && (
        <div className="border-t border-gray-100 px-4 py-5 space-y-5 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Datos del cliente */}
            <div>
              <p className="font-sans text-xs font-semibold text-tierra-400 uppercase tracking-wide mb-2">Cliente</p>
              <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-1.5 font-sans text-sm text-tierra-700">
                <p><strong>{pedido.cliente.nombre}</strong></p>
                <p>📧 {pedido.cliente.email}</p>
                <p>📱 {pedido.cliente.telefono}</p>
                <p>📍 {pedido.cliente.direccion}</p>
                <p className="text-tierra-500">{pedido.cliente.ciudad}, {pedido.cliente.provincia} (CP {pedido.cliente.codigoPostal})</p>
                {pedido.cliente.notas && (
                  <p className="text-melocoton-700 bg-melocoton-50 rounded-lg px-3 py-1.5 text-xs mt-2">
                    📝 {pedido.cliente.notas}
                  </p>
                )}
              </div>
            </div>

            {/* Items y totales */}
            <div>
              <p className="font-sans text-xs font-semibold text-tierra-400 uppercase tracking-wide mb-2">Piezas del pedido</p>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="space-y-2 mb-3">
                  {pedido.items.map((item, i) => (
                    <div key={i} className="flex justify-between gap-2 font-sans text-sm">
                      <span className="text-tierra-700 truncate flex-1">
                        <span className="font-medium">{item.titulo}</span>
                        <span className="text-tierra-400 ml-1">×{item.cantidad}</span>
                      </span>
                      <span className="text-tierra-900 flex-shrink-0 font-medium">{formatearPrecio(item.precioUnitario * item.cantidad)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-tierra-400 font-sans">
                    <span>Subtotal</span><span>{formatearPrecio(pedido.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-tierra-400 font-sans">
                    <span>Envío {pedido.opcionEnvio ? `(${pedido.opcionEnvio})` : ''}</span>
                    <span>{pedido.costoEnvio === 0 ? 'Gratis' : formatearPrecio(pedido.costoEnvio)}</span>
                  </div>
                  <div className="flex justify-between font-semibold font-sans text-base text-tierra-900 pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span className="font-serif text-lg">{formatearPrecio(pedido.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking de Correo Argentino */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-sans text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Seguimiento Correo Argentino
                </p>
                {pedido.trackingCorreo ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-lg font-bold text-blue-700">{pedido.trackingCorreo}</span>
                    <a
                      href={`https://www.correoargentino.com.ar/formularios/e-commerce/${pedido.trackingCorreo}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline font-sans"
                    >
                      Ver seguimiento →
                    </a>
                  </div>
                ) : (
                  <p className="font-sans text-sm text-blue-600">Sin número de tracking todavía.</p>
                )}
              </div>
              <button
                onClick={() => onCargarTracking(pedido)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-sans font-medium"
              >
                <Truck className="w-4 h-4" />
                {pedido.trackingCorreo ? 'Actualizar tracking' : '+ Cargar tracking'}
              </button>
            </div>
            {!pedido.trackingCorreo && (
              <p className="font-sans text-xs text-blue-500 mt-2">
                Al cargar el número, se notifica automáticamente al cliente por WhatsApp y email.
              </p>
            )}
          </div>

          {/* Cambiar estado */}
          <div>
            <p className="font-sans text-xs font-semibold text-tierra-400 uppercase tracking-wide mb-2">Estado del pedido</p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map(estado => {
                const i = infoEstadoPedido(estado);
                const actual = estado === pedido.estado;
                return (
                  <button key={estado} onClick={() => cambiar(estado)} disabled={cargando}
                          className={`text-xs px-3 py-1.5 rounded-full font-sans font-medium transition-all ${
                            actual
                              ? `${i.bgColor} ${i.color} ring-2 ring-offset-1 ring-current`
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}>
                    {actual && <Check className="w-3 h-3 inline mr-1" />}
                    {i.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-2">
            <a href={waCliente} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-sans font-medium transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp al cliente
            </a>
            <span className="text-xs text-tierra-400 bg-gray-100 px-3 py-2 rounded-xl font-mono">
              #{pedido.id.slice(-8).toUpperCase()}
            </span>
            {pedido.idTransaccionMP && (
              <span className="text-xs text-tierra-400 bg-gray-100 px-3 py-2 rounded-xl font-mono">
                MP: {pedido.idTransaccionMP}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
export default function AdminPedidosPage() {
  const [pedidos, setPedidos]       = useState<Pedido[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [filtro, setFiltro]         = useState<EstadoPedido | ''>('');
  const [busqueda, setBusqueda]     = useState('');
  const [modalTracking, setModal]   = useState<Pedido | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const r = await fetch('/api/pedidos');
      const d = await r.json();
      setPedidos(d.data || []);
    } catch { toast.error('Error al cargar pedidos'); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, []);

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    try {
      const r = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!r.ok) throw new Error();
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
      toast.success(`Estado: ${infoEstadoPedido(estado).label}`);
    } catch { toast.error('Error al actualizar'); }
  }

  async function guardarTracking(id: string, trackingCorreo: string) {
    try {
      const r = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCorreo }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, trackingCorreo, estado: 'enviado' } : p));
      setModal(null);
      toast.success('✓ Tracking guardado. Cliente notificado por WhatsApp y email.');
    } catch (err: any) { toast.error(err.message || 'Error al guardar'); }
  }

  let filtrados = filtro ? pedidos.filter(p => p.estado === filtro) : pedidos;
  if (busqueda) {
    const q = busqueda.toLowerCase();
    filtrados = filtrados.filter(p =>
      p.cliente.nombre.toLowerCase().includes(q) ||
      p.cliente.email.toLowerCase().includes(q) ||
      p.cliente.ciudad.toLowerCase().includes(q) ||
      p.trackingCorreo?.toLowerCase().includes(q)
    );
  }

  const conteo = (estado: EstadoPedido) => pedidos.filter(p => p.estado === estado).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-tierra-900">Pedidos</h1>
          <p className="font-sans text-sm text-tierra-500 mt-1">
            {filtrados.length} {filtrados.length === 1 ? 'pedido' : 'pedidos'}
            {filtro && ` · ${infoEstadoPedido(filtro).label}`}
          </p>
        </div>
        <button onClick={cargar} className="btn-ghost text-sm">↻ Actualizar</button>
      </div>

      {/* Búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tierra-400" />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                 placeholder="Buscar cliente, ciudad, tracking..."
                 className="form-input pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFiltro('')}
                  className={`text-xs px-3 py-1.5 rounded-full font-sans transition-colors ${!filtro ? 'bg-tierra-900 text-white' : 'bg-white text-tierra-600 border border-gray-200 hover:bg-gray-50'}`}>
            Todos ({pedidos.length})
          </button>
          {ESTADOS.map(estado => {
            const c = conteo(estado);
            if (c === 0) return null;
            const i = infoEstadoPedido(estado);
            return (
              <button key={estado} onClick={() => setFiltro(estado)}
                      className={`text-xs px-3 py-1.5 rounded-full font-sans transition-colors ${
                        filtro === estado ? `${i.bgColor} ${i.color} font-medium` : 'bg-white text-tierra-600 border border-gray-200 hover:bg-gray-50'
                      }`}>
                {i.label} ({c})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de pedidos */}
      {cargando ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag className="w-12 h-12 text-tierra-200 mx-auto mb-3" />
          <p className="font-serif text-lg text-tierra-500">
            {busqueda ? 'No hay resultados.' : filtro ? `No hay pedidos con estado "${infoEstadoPedido(filtro).label}".` : 'Todavía no hay pedidos.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(p => (
            <FilaPedido
              key={p.id}
              pedido={p}
              onCambiarEstado={cambiarEstado}
              onCargarTracking={setModal}
            />
          ))}
        </div>
      )}

      {/* Modal tracking */}
      {modalTracking && (
        <ModalTracking
          pedido={modalTracking}
          onGuardar={guardarTracking}
          onCerrar={() => setModal(null)}
        />
      )}
    </div>
  );
}
