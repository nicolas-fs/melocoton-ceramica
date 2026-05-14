import Link from 'next/link';
import { obtenerProductos } from '@/lib/productos';
import { obtenerPedidos } from '@/lib/pedidos';
import { formatearPrecio, formatearFecha, infoEstadoPedido } from '@/lib/utils';
import {
  Package, ShoppingBag, TrendingUp, Clock,
  AlertTriangle, Tag, ArrowRight, Plus,
} from 'lucide-react';

export default async function AdminPage() {
  const [productos, pedidos] = await Promise.all([
    obtenerProductos(),
    obtenerPedidos(),
  ]);

  const pendientes   = pedidos.filter(p => p.estado === 'pendiente').length;
  const pagados      = pedidos.filter(p => p.estado === 'pagado').length;
  const totalVendido = pedidos
    .filter(p => ['pagado','enviado','entregado'].includes(p.estado))
    .reduce((a, p) => a + p.total, 0);
  const sinStock  = productos.filter(p => p.stock === 0);
  const stockBajo = productos.filter(p => p.stock > 0 && p.stock <= 3);
  const enPromo   = productos.filter(p => p.enPromocion).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-tierra-900">Dashboard</h1>
        <p className="font-sans text-sm text-tierra-500 mt-1">Bienvenida al panel de Melocotón Cerámica ✨</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { titulo: 'Pendientes',    valor: pendientes,              icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/admin/pedidos' },
          { titulo: 'Pagados hoy',   valor: pagados,                 icon: ShoppingBag,   color: 'text-green-600',  bg: 'bg-green-50',  link: '/admin/pedidos' },
          { titulo: 'Total vendido', valor: formatearPrecio(totalVendido), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/pedidos' },
          { titulo: 'Sin stock',     valor: sinStock.length,         icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50',    link: '/admin/productos' },
        ].map(({ titulo, valor, icon: Icon, color, bg, link }) => (
          <Link key={titulo} href={link}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="font-sans text-xs text-tierra-500 uppercase tracking-wide mb-1">{titulo}</p>
            <p className="font-serif text-2xl text-tierra-900 font-medium">{valor}</p>
          </Link>
        ))}
      </div>

      {/* Alertas */}
      {(sinStock.length > 0 || stockBajo.length > 0 || enPromo > 0) && (
        <div className="space-y-2">
          {sinStock.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="font-sans text-sm text-red-700 flex-1">
                <strong>{sinStock.length} {sinStock.length === 1 ? 'producto' : 'productos'} sin stock:</strong>{' '}
                {sinStock.slice(0, 3).map(p => p.titulo).join(', ')}{sinStock.length > 3 ? '...' : ''}
              </p>
              <Link href="/admin/productos" className="font-sans text-xs text-red-600 hover:underline font-medium flex-shrink-0">
                Reponer →
              </Link>
            </div>
          )}
          {stockBajo.length > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
              <Package className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p className="font-sans text-sm text-yellow-700 flex-1">
                <strong>{stockBajo.length} {stockBajo.length === 1 ? 'producto' : 'productos'} con stock bajo</strong> (3 unidades o menos)
              </p>
              <Link href="/admin/productos" className="font-sans text-xs text-yellow-600 hover:underline font-medium flex-shrink-0">
                Ver →
              </Link>
            </div>
          )}
          {enPromo > 0 && (
            <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
              <Tag className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <p className="font-sans text-sm text-purple-700 flex-1">
                <strong>{enPromo} {enPromo === 1 ? 'producto' : 'productos'}</strong> con promoción activa
              </p>
              <Link href="/admin/promociones" className="font-sans text-xs text-purple-600 hover:underline font-medium flex-shrink-0">
                Ver promos →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Acciones rápidas */}
      <div>
        <h2 className="font-sans text-sm font-semibold text-tierra-600 uppercase tracking-widest mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/productos?nuevo=1', label: 'Nuevo producto',   icon: Plus,        color: 'bg-melocoton-50 border-melocoton-200 text-melocoton-700' },
            { href: '/admin/pedidos',           label: 'Ver pedidos',      icon: ShoppingBag, color: 'bg-green-50 border-green-200 text-green-700' },
            { href: '/admin/promociones',       label: 'Crear promoción',  icon: Tag,         color: 'bg-purple-50 border-purple-200 text-purple-700' },
            { href: '/',                        label: 'Ver el sitio',     icon: ArrowRight,  color: 'bg-blue-50 border-blue-200 text-blue-700' },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border font-sans text-sm font-medium transition-all hover:shadow-sm ${color}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-sans font-semibold text-tierra-900">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-xs text-melocoton-600 hover:text-melocoton-700 flex items-center gap-1 font-sans">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {pedidos.length === 0 ? (
            <p className="font-sans text-sm text-tierra-400 text-center py-10">Aún no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {pedidos.slice(0, 6).map(p => {
                const info = infoEstadoPedido(p.estado);
                return (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-sans ${info.bgColor} ${info.color}`}>
                      {info.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-tierra-900 truncate">{p.cliente.nombre}</p>
                      <p className="font-sans text-xs text-tierra-400">{p.cliente.ciudad} · {formatearFecha(p.fecha)}</p>
                    </div>
                    <p className="font-serif text-sm text-tierra-900 flex-shrink-0">{formatearPrecio(p.total)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Estado del stock — ordenado por urgencia */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-sans font-semibold text-tierra-900">Estado del stock</h2>
            <Link href="/admin/productos" className="text-xs text-melocoton-600 hover:text-melocoton-700 flex items-center gap-1 font-sans">
              Gestionar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {[...productos]
              .sort((a, b) => a.stock - b.stock)
              .slice(0, 8)
              .map(p => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-tierra-900 truncate">{p.titulo}</p>
                    <p className="font-sans text-xs text-tierra-400 capitalize">
                      {p.categoria}{p.enPromocion ? ' · 🏷️ en promo' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${
                      p.stock === 0 ? 'bg-red-100 text-red-600' :
                      p.stock <= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.stock === 0 ? 'Sin stock' : `${p.stock} und.`}
                    </span>
                    <p className="font-serif text-xs text-tierra-400 mt-0.5">{formatearPrecio(p.precio)}</p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
