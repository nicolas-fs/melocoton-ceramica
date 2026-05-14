import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types';
import { formatearPrecio } from '@/lib/utils';
import AddToCartButton from './AddToCartButton';

export default function ProductCard({ producto }: { producto: Producto }) {
  const { titulo, slug, descripcionCorta, precio, precioOriginal, enPromocion, descuentoPorcentaje, imagenes, stock, destacado, categoria } = producto;
  const sinStock = stock === 0;

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-melocoton-100 transition-all duration-300 group relative">

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {enPromocion && descuentoPorcentaje && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-red-500 text-white shadow-sm">
            -{descuentoPorcentaje}% OFF
          </span>
        )}
        {destacado && !enPromocion && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-melocoton-100 text-melocoton-700">
            ✨ Destacado
          </span>
        )}
      </div>

      {sinStock && (
        <span className="absolute top-3 right-3 z-10 bg-tierra-800/80 text-white text-xs px-2 py-0.5 rounded-full font-sans">
          Sin stock
        </span>
      )}

      {/* Imagen */}
      <Link href={`/producto/${slug}`} className="block overflow-hidden aspect-square">
        <Image
          src={imagenes[0] || 'https://placehold.co/600x600/faecd8/b07040?text=🏺'}
          alt={titulo}
          width={600}
          height={600}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${sinStock ? 'opacity-60 grayscale' : ''}`}
        />
      </Link>

      {/* Contenido */}
      <div className="p-4">
        <p className="font-sans text-xs text-melocoton-500 uppercase tracking-widest mb-1 capitalize">{categoria}</p>

        <Link href={`/producto/${slug}`}>
          <h3 className="font-serif text-lg text-tierra-900 leading-snug mb-2 hover:text-melocoton-600 transition-colors line-clamp-2">
            {titulo}
          </h3>
        </Link>

        <p className="font-sans text-sm text-tierra-500 leading-relaxed mb-4 line-clamp-2">
          {descripcionCorta}
        </p>

        {/* Precio */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-serif text-xl font-medium text-tierra-900">{formatearPrecio(precio)}</p>
            {enPromocion && precioOriginal && (
              <p className="font-sans text-xs text-tierra-400 line-through leading-none mt-0.5">
                {formatearPrecio(precioOriginal)}
              </p>
            )}
          </div>

          {sinStock
            ? <span className="text-xs text-tierra-400 font-sans">Sin stock</span>
            : <AddToCartButton producto={producto} />
          }
        </div>
      </div>
    </article>
  );
}
