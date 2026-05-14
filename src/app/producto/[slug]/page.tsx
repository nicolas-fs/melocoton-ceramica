import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { obtenerProductoPorSlug, obtenerRelacionados } from '@/lib/productos';
import { formatearPrecio, getLinkWhatsApp, construirMensajeWhatsApp } from '@/lib/utils';
import ProductGrid from '@/components/shop/ProductGrid';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ProductGallery from '@/components/shop/ProductGallery';
import { Package, RefreshCw, Heart } from 'lucide-react';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await obtenerProductoPorSlug(params.slug);
  if (!p) return { title: 'Producto no encontrado' };
  return { title: p.titulo, description: p.descripcionCorta };
}

export default async function ProductoPage({ params }: Props) {
  const producto = await obtenerProductoPorSlug(params.slug);
  if (!producto) notFound();

  const relacionados = await obtenerRelacionados(producto.id, producto.categoria, 4);
  const sinStock = producto.stock === 0;
  const stockBajo = producto.stock > 0 && producto.stock <= 3;

  const descripcionHTML = producto.descripcion
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n\n')
    .map(p => `<p>${p}</p>`)
    .join('');

  const mensajeWA = construirMensajeWhatsApp(producto.titulo);

  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      <div className="container-mel py-12">
        {/* Breadcrumb */}
        <nav className="font-sans text-xs text-tierra-400 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-melocoton-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-melocoton-600 transition-colors">Catálogo</Link>
          <span>/</span>
          <Link href={`/catalogo?categoria=${producto.categoria}`} className="hover:text-melocoton-600 transition-colors capitalize">{producto.categoria}</Link>
          <span>/</span>
          <span className="text-tierra-600 truncate max-w-[160px]">{producto.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ProductGallery imagenes={producto.imagenes} titulo={producto.titulo} />

          <div className="flex flex-col gap-6">
            <div>
              <span className="badge capitalize">{producto.categoria}</span>
              <h1 className="font-serif text-4xl md:text-5xl text-tierra-900 mt-3 leading-tight">{producto.titulo}</h1>
            </div>

            <div>
              <div className="flex items-end gap-3">
                <p className="font-serif text-3xl text-tierra-900 font-medium">{formatearPrecio(producto.precio)}</p>
                {producto.enPromocion && producto.precioOriginal && (
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-sans text-base text-tierra-400 line-through">{formatearPrecio(producto.precioOriginal)}</p>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{producto.descuentoPorcentaje}% OFF
                    </span>
                  </div>
                )}
              </div>
              <p className="font-sans text-xs text-tierra-400 mt-1">Precio en pesos argentinos. Envío a calcular en el checkout.</p>
            </div>

            <p className="font-serif text-lg text-tierra-600 leading-relaxed italic">{producto.descripcionCorta}</p>

            {sinStock ? (
              <div className="text-sm font-sans text-red-500 bg-red-50 rounded-xl px-4 py-3">❌ Sin stock. Escribinos para avisarte cuando vuelva.</div>
            ) : stockBajo ? (
              <div className="text-sm font-sans text-amber-600 bg-amber-50 rounded-xl px-4 py-3">⚡ ¡Solo quedan {producto.stock} unidades!</div>
            ) : (
              <div className="text-sm font-sans text-green-600 bg-green-50 rounded-xl px-4 py-3">✓ En stock — {producto.stock} unidades disponibles</div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1"><AddToCartButton producto={producto} variant="full" /></div>
              <a href={getLinkWhatsApp(mensajeWA)} target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-[#25D366] text-[#25D366] font-sans font-medium text-sm hover:bg-[#25D366] hover:text-white transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consultar por WhatsApp
              </a>
            </div>

            {producto.etiquetas && (
              <div className="flex flex-wrap gap-2">
                {producto.etiquetas.map(t => <span key={t} className="font-sans text-xs text-tierra-500 bg-tierra-100 px-3 py-1 rounded-full">#{t}</span>)}
              </div>
            )}

            <div className="border-t border-melocoton-200 pt-6 grid grid-cols-3 gap-4">
              {[
                { icon: <Package className="w-4 h-4" />, t: 'Envío a todo el país' },
                { icon: <Heart className="w-4 h-4" />, t: 'Hecha con amor' },
                { icon: <RefreshCw className="w-4 h-4" />, t: 'Cambio si hay problema' },
              ].map(({ icon, t }) => (
                <div key={t} className="flex items-center gap-2 text-xs font-sans text-tierra-500">
                  <span className="text-melocoton-400">{icon}</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-melocoton-100">
          <h2 className="font-serif text-2xl text-tierra-900 mb-6">Sobre esta pieza</h2>
          <div className="font-sans text-tierra-700 leading-relaxed space-y-3 [&_strong]:text-tierra-900 [&_strong]:font-semibold"
               dangerouslySetInnerHTML={{ __html: descripcionHTML }} />
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-10">
              <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ También te puede gustar ✦</p>
              <h2 className="section-title">Más piezas de {producto.categoria}</h2>
            </div>
            <ProductGrid productos={relacionados} columnas={4} />
          </div>
        )}
      </div>
    </div>
  );
}
