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
<section id="catalogo" className="py-20 bg-melocoton-50">
        <div className="container-mel px-4">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">Lo que tenemos</p>
            <h2 className="section-title">Catalogo completo</h2>
            <p className="font-serif italic text-tierra-500 text-lg mt-2 max-w-md mx-auto">
              Cada pieza es unica. Si te enamoras de una, no la dejes ir.
            </p>
          </div>
          {destacados.length > 0 && (
            <div className="mb-16">
              <h3 className="font-serif text-2xl text-tierra-800 mb-6">Mas queridas</h3>
              <ProductGrid productos={destacados} columnas={3} />
            </div>
          )}
          <div>
            <h3 className="font-serif text-2xl text-tierra-800 mb-6">Todo el catalogo</h3>
            <ProductGrid productos={todos} columnas={3} />
          </div>
          <div className="text-center mt-12">
            <Link href="/catalogo" className="btn-primary text-base px-8 py-3">
              Ver catalogo con filtros
            </Link>
          </div>
        </div>
      </section>
