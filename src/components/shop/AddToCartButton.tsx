'use client';
import { ShoppingBag } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { Producto } from '@/types';

interface Props {
  producto: Producto;
  variant?: 'icon' | 'full';
}

export default function AddToCartButton({ producto, variant = 'icon' }: Props) {
  const { agregarItem } = useCarrito();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    agregarItem(producto);
  };

  if (variant === 'full') {
    return (
      <button onClick={handleClick} disabled={producto.stock === 0} className="btn-primary w-full text-base">
        <ShoppingBag className="w-5 h-5" />
        Agregar al carrito
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={producto.stock === 0}
      aria-label={`Agregar ${producto.titulo} al carrito`}
      className="w-9 h-9 rounded-full bg-melocoton-400 text-white flex items-center justify-center
                 hover:bg-melocoton-500 active:scale-95 transition-all duration-150
                 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <ShoppingBag className="w-4 h-4" />
    </button>
  );
}
