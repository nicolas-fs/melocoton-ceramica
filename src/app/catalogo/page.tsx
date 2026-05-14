import { Metadata } from 'next';
import { obtenerProductos } from '@/lib/productos';
import { Categoria } from '@/types';
import { CATEGORIAS } from '../../../data/productos';
import ProductGrid from '@/components/shop/ProductGrid';
import CatalogoFiltros from '@/components/shop/CatalogoFiltros';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Explorá toda la colección de cerámica artesanal de Melocotón. Tazas, tazones, bowls, macetas y sets únicos.',
};

interface Props {
  searchParams: {
    categoria?: string;
    orden?: string;
    busqueda?: string;
    promo?: string;
  };
}

export default async function CatalogoPage({ searchParams }: Props) {
  const { categoria, orden, busqueda, promo } = searchParams;
  const catValida = CATEGORIAS.map(c => c.id).includes(categoria || '')
    ? (categoria as Categoria)
    : undefined;

  let productos = await obtenerProductos({ categoria: catValida, busqueda });

  // Filtrar solo productos en promoción
  if (promo === 'true') {
    productos = productos.filter(p => p.enPromocion);
  }

  // Ordenar
  if (orden === 'precio-asc')   productos = [...productos].sort((a, b) => a.precio - b.precio);
  else if (orden === 'precio-desc') productos = [...productos].sort((a, b) => b.precio - a.precio);
  else if (orden === 'destacados')  productos = [...productos].sort((a, b) => Number(b.destacado) - Number(a.destacado));
  else if (orden === 'descuento')   productos = [...productos].sort((a, b) => (b.descuentoPorcentaje || 0) - (a.descuentoPorcentaje || 0));

  const tituloCategoria = promo === 'true'
    ? '🏷️ En promoción'
    : catValida
      ? CATEGORIAS.find(c => c.id === catValida)?.nombre ?? 'Catálogo'
      : 'Todo el catálogo';

  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-crema-200 to-melocoton-50 py-16 border-b border-melocoton-200">
        <div className="container-mel text-center">
          <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ Hecho a mano ✦</p>
          <h1 className="section-title mb-4">Catálogo</h1>
          <p className="font-serif italic text-tierra-500 text-lg max-w-md mx-auto">
            Cada pieza es única. Si te enamorás de una, no la dejes ir.
          </p>
        </div>
      </div>

      <div className="container-mel py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <CatalogoFiltros
              categoriaActiva={categoria}
              ordenActivo={orden}
              busquedaActiva={busqueda}
              promoActiva={promo === 'true'}
            />
          </aside>

          {/* Grilla */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <h2 className="font-serif text-2xl text-tierra-900">
                {tituloCategoria}
                <span className="ml-3 font-sans text-base text-tierra-400 font-normal">
                  ({productos.length} {productos.length === 1 ? 'pieza' : 'piezas'})
                </span>
              </h2>
              {promo === 'true' && (
                <span className="font-sans text-sm text-melocoton-600 bg-melocoton-50 border border-melocoton-200 px-3 py-1 rounded-full">
                  🏷️ Mostrando solo ofertas
                </span>
              )}
            </div>
            <ProductGrid
              productos={productos}
              columnas={3}
              emptyMessage={
                promo === 'true'
                  ? 'No hay promociones activas en este momento.'
                  : 'No encontramos piezas con esos filtros.'
              }
            />
          </main>
        </div>
      </div>
    </div>
  );
}
