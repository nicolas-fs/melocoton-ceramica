'use client';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { formatearPrecio } from '@/lib/utils';

export default function CartSidebar() {
  const { items, estaAbierto, cerrarCarrito, quitarItem, actualizarCantidad, subtotal, total, cantidadTotal } = useCarrito();

  return (
    <>
      {estaAbierto && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={cerrarCarrito} />}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-melocoton-50 shadow-2xl flex flex-col transition-transform duration-300 ${estaAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-melocoton-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-melocoton-500" />
            <h2 className="font-serif text-xl text-tierra-900">Tu carrito {cantidadTotal > 0 && <span className="font-sans text-sm text-melocoton-500">({cantidadTotal})</span>}</h2>
          </div>
          <button onClick={cerrarCarrito} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-melocoton-200 transition-colors">
            <X className="w-4 h-4 text-tierra-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-5xl">🛒</span>
              <p className="font-serif text-lg text-tierra-600">Tu carrito está vacío</p>
              <button onClick={cerrarCarrito} className="btn-primary mt-2">Ver catálogo</button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(item => (
                <li key={item.productoId} className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-melocoton-100">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.imagen || 'https://placehold.co/64x64/faecd8/b07040?text=🏺'} alt={item.titulo} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-tierra-900 truncate leading-snug">{item.titulo}</p>
                    <p className="font-serif text-base text-melocoton-600 mt-0.5">{formatearPrecio(item.precio)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)} className="w-6 h-6 rounded-full border border-melocoton-300 flex items-center justify-center hover:bg-melocoton-100 transition-colors">
                        <Minus className="w-3 h-3 text-tierra-600" />
                      </button>
                      <span className="font-sans text-sm w-5 text-center text-tierra-900">{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)} className="w-6 h-6 rounded-full border border-melocoton-300 flex items-center justify-center hover:bg-melocoton-100 transition-colors">
                        <Plus className="w-3 h-3 text-tierra-600" />
                      </button>
                      <span className="ml-auto font-sans text-xs text-tierra-400">= {formatearPrecio(item.precio * item.cantidad)}</span>
                    </div>
                  </div>
                  <button onClick={() => quitarItem(item.productoId)} className="self-start p-1 rounded hover:bg-red-50 text-tierra-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-melocoton-200 bg-white space-y-3">
            <div className="space-y-1.5 text-sm font-sans">
              <div className="flex justify-between text-tierra-600"><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div>
              <div className="flex justify-between text-tierra-600"><span>Envío</span><span className="text-tierra-400 text-xs">Se calcula en el checkout</span></div>
              <div className="flex justify-between font-semibold text-tierra-900 text-base pt-2 border-t border-melocoton-100">
                <span>Total</span>
                <span className="font-serif text-lg">{formatearPrecio(total)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={cerrarCarrito} className="btn-primary w-full text-center">Ir al checkout</Link>
            <button onClick={cerrarCarrito} className="w-full text-center text-sm text-tierra-500 hover:text-tierra-700 font-sans transition-colors py-1">Seguir comprando</button>
          </div>
        )}
      </aside>
    </>
  );
}
