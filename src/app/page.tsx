import Link from 'next/link';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { obtenerProductos } from '@/lib/productos';
import { TESTIMONIOS } from '../../data/productos';
import ProductGrid from '@/components/shop/ProductGrid';
import PromoBanner from '@/components/ui/PromoBanner';
import HeroGrid from '@/components/home/HeroGrid';
import { GALERIA } from '../../data/galeria';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [todos, destacados] = await Promise.all([
    obtenerProductos(),
    obtenerProductos({ destacado: true }),
  ]);

  const hayPromos = todos.some(p => p.enPromocion);
  const cantidadPromos = todos.filter(p => p.enPromocion).length;
  return (
    <>
      {hayPromos && (
        <PromoBanner
          mensaje={`${cantidadPromos} ${cantidadPromos === 1 ? 'producto con descuento' : 'productos con descuento'}`}
          enlace="/catalogo?promo=true"
          etiqueta="Ver ofertas"
        />
      )}

      <HeroGrid />
