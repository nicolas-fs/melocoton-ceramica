import Link from 'next/link';
import { ArrowRight, Instagram } from 'lucide-react';
import { obtenerProductos } from '@/lib/productos';
import { CATEGORIAS, TESTIMONIOS } from '../../data/productos';
import ProductGrid from '@/components/shop/ProductGrid';
import PromoBanner from '@/components/ui/PromoBanner';
import { GALERIA } from '../../data/galeria';

export default async function HomePage() {
  const [destacados, todos] = await Promise.all([
    obtenerProductos({ destacado: true }),
    obtenerProductos(),
  ]);

  const hayPromos = todos.some(p => p.enPromocion);
  const cantidadPromos = todos.filter(p => p.enPromocion).length;

  return (
    <>
      {/* Banner de promoción — aparece automáticamente cuando hay promos activas */}
      {hayPromos && (
        <PromoBanner
          mensaje={`🏷️ ${cantidadPromos} ${cantidadPromos === 1 ? 'producto con descuento' : 'productos con descuento'} en el catálogo`}
          enlace="/catalogo?promo=true"
          etiqueta="Ver ofertas"
        />
      )}

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #fdf8f3 0%, #faecd8 50%, #f3d4ac 100%)' }}
      >
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-melocoton-200/30 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-melocoton-200/20 blur-3xl" />
        <div className="container-mel relative z-10 pt-24 pb-16 text-center">
          <p className="font-sans text-xs tracking-[0.3em] text-melocoton-500 uppercase mb-6 animate-fade-in">
            ✦ Villa Carlos Paz, Córdoba ✦
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-tierra-900 leading-none mb-6">
            Cada pieza,<br />
            <span className="text-melocoton-500 italic">única como vos.</span>
          </h1>
          <p className="font-serif text-lg md:text-xl text-tierra-600 max-w-xl mx-auto leading-relaxed mb-10 italic">
            Cerámica artesanal hecha a mano con arcilla, amor y las ganas de que cada mañana con tu taza favorita sea especial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo" className="btn-primary text-base px-8 py-4">
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contacto" className="btn-secondary text-base px-8 py-4">
              Hacer un pedido especial
            </Link>
          </div>
        </div>
      </section>

      {/* FRASE */}
      <section className="py-16 bg-tierra-900">
        <div className="container-mel text-center">
          <p className="font-serif italic text-2xl md:text-3xl text-melocoton-300 max-w-2xl mx-auto">
            "Lo estás haciendo bien, aunque cueste en algunas ocasiones."
          </p>
          <p className="mt-4 font-sans text-xs tracking-widest text-tierra-500 uppercase">— Melocotón Cerámica</p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="py-20 bg-melocoton-50">
        <div className="container-mel">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ Lo que hacemos ✦</p>
            <h2 className="section-title">Explorá por categoría</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIAS.map(cat => (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-melocoton-100
                           hover:border-melocoton-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <div>
                  <p className="font-sans text-sm font-semibold text-tierra-900">{cat.nombre}</p>
                  <p className="font-sans text-xs text-tierra-400 mt-0.5 leading-tight">{cat.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="py-20">
        <div className="container-mel">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ Los más queridos ✦</p>
              <h2 className="section-title">Piezas destacadas</h2>
            </div>
            <Link href="/catalogo" className="inline-flex items-center gap-2 font-sans text-sm text-melocoton-600 hover:text-melocoton-700 font-medium transition-colors">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid productos={destacados} columnas={3} />
        </div>
      </section>

      {/* PROCESO */}
      <section className="py-20 bg-tierra-900">
        <div className="container-mel">
          <div className="text-center mb-14">
            <p className="font-sans text-xs tracking-widest text-melocoton-400 uppercase mb-3">✦ Hecho a mano ✦</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white">Del barro a tu mesa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: '01', t: 'La arcilla',  d: 'Todo empieza con arcilla natural. Se amasa a mano hasta que queda perfecta.' },
              { n: '02', t: 'El torno',    d: 'Cada pieza se torna o modela a mano. No hay dos iguales.' },
              { n: '03', t: 'El horno',    d: 'Primera cocción, esmaltado a mano, segunda cocción. Tiempo y fuego.' },
              { n: '04', t: 'Tu mesa',     d: 'La pieza llega a tus manos lista para acompañar tu día a día.' },
            ].map(p => (
              <div key={p.n}>
                <span className="font-serif text-7xl font-bold text-melocoton-700/30 leading-none block mb-3">{p.n}</span>
                <h3 className="font-serif text-xl text-white mb-2">{p.t}</h3>
                <p className="font-sans text-sm text-tierra-300 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 bg-melocoton-50">
        <div className="container-mel">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ Lo que dicen ✦</p>
            <h2 className="section-title">Palabras de quienes ya tienen su pieza</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIOS.map((t, i) => (
              <blockquote key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 flex flex-col gap-4">
                <div className="text-melocoton-400 text-sm">★★★★★</div>
                <p className="font-serif text-base text-tierra-700 leading-relaxed italic flex-1">"{t.texto}"</p>
                <footer className="font-sans text-xs text-tierra-400">
                  <span className="font-medium text-tierra-600">{t.nombre}</span> · {t.ciudad}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* GALERÍA PREVIEW */}
      <section className="py-20 bg-white border-t border-melocoton-100">
        <div className="container-mel">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ Nuestras piezas ✦</p>
              <h2 className="section-title">Galería de cerámica</h2>
              <p className="font-serif italic text-tierra-500 mt-2">Fotos reales de cada pieza, directo de nuestro taller.</p>
            </div>
            <Link href="/galeria" className="inline-flex items-center gap-2 font-sans text-sm text-melocoton-600 hover:text-melocoton-700 font-medium transition-colors flex-shrink-0">
              Ver galería completa ({GALERIA.length} fotos) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Preview grid — top 12 imágenes */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
            {GALERIA.slice(0, 12).map((img, i) => (
              <Link
                key={i}
                href="/galeria"
                className="relative aspect-square rounded-xl overflow-hidden bg-melocoton-100 group"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-tierra-900/0 group-hover:bg-tierra-900/30 transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/galeria" className="btn-primary text-base px-8 py-3">
              Ver galería completa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="py-14 bg-melocoton-50 border-t border-melocoton-100">
        <div className="container-mel text-center">
          <p className="font-sans text-sm text-tierra-500 mb-2">¿Querés ver el proceso en vivo?</p>
          <h2 className="font-serif text-2xl md:text-3xl text-tierra-900 mb-6">Seguinos en Instagram</h2>
          <a
            href="https://instagram.com/melocoton.ceramica"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full
                       bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400
                       text-white font-sans font-medium text-base
                       hover:opacity-90 transition-opacity shadow-md"
          >
            <Instagram className="w-5 h-5" /> @melocoton.ceramica
          </a>
        </div>
      </section>
    </>
  );
}
