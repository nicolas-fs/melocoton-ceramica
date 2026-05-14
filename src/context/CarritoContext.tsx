'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CarritoContextType, ItemCarrito, Producto } from '@/types';
import toast from 'react-hot-toast';

export const COSTO_ENVIO = 3500;
const CarritoContext = createContext<CarritoContextType | null>(null);
const KEY = 'melocoton_carrito';

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [estaAbierto, setEstaAbierto] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const agregarItem = useCallback((producto: Producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.productoId === producto.id);
      if (existe) {
        if (existe.cantidad + cantidad > producto.stock) {
          toast.error(`Solo hay ${producto.stock} unidades disponibles`);
          return prev;
        }
        return prev.map(i => i.productoId === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i);
      }
      if (cantidad > producto.stock) {
        toast.error(`Solo hay ${producto.stock} unidades disponibles`);
        return prev;
      }
      return [...prev, { productoId: producto.id, titulo: producto.titulo, slug: producto.slug, imagen: producto.imagenes[0] || '', precio: producto.precio, cantidad }];
    });
    toast.success(`"${producto.titulo}" agregado al carrito 🛒`, {
      style: { background: '#faecd8', color: '#3e3025', borderRadius: '12px', border: '1px solid #e9b57a' },
    });
    setEstaAbierto(true);
  }, []);

  const quitarItem = useCallback((productoId: string) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId));
  }, []);

  const actualizarCantidad = useCallback((productoId: string, cantidad: number) => {
    if (cantidad <= 0) { quitarItem(productoId); return; }
    setItems(prev => prev.map(i => i.productoId === productoId ? { ...i, cantidad } : i));
  }, [quitarItem]);

  const vaciarCarrito = useCallback(() => {
    setItems([]);
    localStorage.removeItem(KEY);
  }, []);

  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const total = subtotal + (items.length > 0 ? COSTO_ENVIO : 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CarritoContext.Provider value={{
      items, agregarItem, quitarItem, actualizarCantidad, vaciarCarrito,
      total, subtotal, cantidadTotal,
      estaAbierto, abrirCarrito: () => setEstaAbierto(true), cerrarCarrito: () => setEstaAbierto(false),
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito(): CarritoContextType {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
}
