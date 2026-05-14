'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { formatearPrecio } from '@/lib/utils';

export default function CarritoPage() {
  const { items, quitarItem, actualizarCantidad, subtotal, total, vaciarCarrito } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-melocoton-50 flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <span className="text-7xl block mb-6">🛒</span>
          <h1 className="font-serif text-3xl text-tierra-800 mb-3">Tu carrito está vacío</h1>
          <p className="font-serif italic text-tierra-500 text-lg mb-8">Todavía no hay ninguna pieza esperándote.</p>
          <Link href="/catalogo" className="btn-primary text-base"><ShoppingBag className="w-4 h-4" /> Explorar catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      <div className="container-mel py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-tierra-900 mb-2">Tu carrito</h1>
          <p className="font-serif italic text-tierra-500">{items.length} {items.length === 1 ? 'pieza' : 'piezas'} seleccionadas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <article key={item.productoId} className="bg-white rounded-2xl p-5 shadow-sm border border-melocoton-100 flex gap-4">
                <Link href={`/producto/${item.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-crema-100">
                    <Image src={item.imagen || 'https://placehold.co/96x96/faecd8/b07040?text=🏺'} alt={item.titulo} width={96} height={96} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/producto/${item.slug}`}>
                    <h2 className="font-serif text-lg text-tierra-900 leading-snug hover:text-melocoton-600 transition-colors">{item.titulo}</h2>
                  </Link>
                  <p className="font-sans text-sm text-tierra-400 mt-0.5">Precio unitario: {formatearPrecio(item.precio)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)} className="w-8 h-8 rounded-full border border-melocoton-300 flex items-center justify-center hover:bg-melocoton-100 transition-colors"><Minus className="w-3 h-3 text-tierra-600" /></button>
                      <span className="font-sans font-medium text-tierra-900 w-6 text-center">{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)} className="w-8 h-8 rounded-full border border-melocoton-300 flex items-center justify-center hover:bg-melocoton-100 transition-colors"><Plus className="w-3 h-3 text-tierra-600" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-serif text-lg font-medium text-tierra-900">{formatearPrecio(item.precio * item.cantidad)}</p>
                      <button onClick={() => quitarItem(item.productoId)} className="p-1.5 rounded-lg hover:bg-red-50 text-tierra-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            <button onClick={vaciarCarrito} className="text-sm font-sans text-tierra-400 hover:text-red-400 transition-colors flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Vaciar carrito
            </button>
          </div>

          <aside>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 sticky top-24">
              <h2 className="font-serif text-xl text-tierra-900 mb-5">Resumen</h2>
              <div className="space-y-2 text-sm font-sans">
                {items.map(item => (
                  <div key={item.productoId} className="flex justify-between text-tierra-600">
                    <span className="truncate max-w-[180px]">{item.titulo} ×{item.cantidad}</span>
                    <span>{formatearPrecio(item.precio * item.cantidad)}</span>
                  </div>
                ))}
                <div className="border-t border-melocoton-100 pt-3 mt-3 flex justify-between text-tierra-600"><span>Envío</span><span className="text-tierra-400 text-xs">Se calcula en el checkout</span></div>
                <div className="border-t border-melocoton-200 pt-3 mt-3 flex justify-between font-semibold text-tierra-900 text-base">
                  <span>Total</span><span className="font-serif text-xl">{formatearPrecio(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full mt-6 text-center">
                Ir al checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/catalogo" className="block text-center text-sm text-tierra-400 hover:text-tierra-600 font-sans mt-3 transition-colors">Seguir comprando</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
