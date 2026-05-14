'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Heart, ExternalLink, ShoppingBag, ImageOff } from 'lucide-react';
import { GALERIA, CATEGORIAS_GALERIA, ImagenGaleria } from '../../../data/galeria';
import { getLinkWhatsApp, cn } from '@/lib/utils';

// ── Imagen con fallback ───────────────────────────────────
function ImgConFallback({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-melocoton-100 text-melocoton-400 gap-2', className)} style={style}>
        <ImageOff className="w-6 h-6" />
        <span className="font-sans text-[10px] text-center px-2 leading-tight">Imagen temporalmente no disponible</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={cn('absolute inset-0 bg-melocoton-100 animate-pulse', className)} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(className, !loaded && 'opacity-0')}
        style={style}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </>
  );
}

// ── Lightbox ──────────────────────────────────────────────
function Lightbox({
  imagen,
  indice,
  total,
  onCerrar,
  onAnterior,
  onSiguiente,
}: {
  imagen: ImagenGaleria;
  indice: number;
  total: number;
  onCerrar: () => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  // Keyboard navigation
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key === 'ArrowLeft') onAnterior();
      if (e.key === 'ArrowRight') onSiguiente();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCerrar, onAnterior, onSiguiente]);

  const mensajeWA = getLinkWhatsApp(
    `Hola Melocotón Cerámica! Vi esta pieza en la galería y quiero consultar: "${imagen.caption.slice(0, 60)}"`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen */}
        <div className="relative flex-1 bg-tierra-900 flex items-center justify-center min-h-[280px] md:min-h-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagen.url}
            alt={imagen.caption}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '60vh' }}
          />

          <button onClick={e => { e.stopPropagation(); onAnterior(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onSiguiente(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-sans px-3 py-1 rounded-full">
            {indice + 1} / {total}
          </div>
        </div>

        {/* Panel de info */}
        <div className="md:w-72 flex flex-col p-5 gap-4 overflow-y-auto">
          <button onClick={onCerrar}
                  className="self-end w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-tierra-600" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="font-sans text-sm font-medium text-tierra-900">@melocoton.ceramica</span>
          </div>

          <p className="font-serif text-sm text-tierra-700 leading-relaxed italic flex-1">
            "{imagen.caption}"
          </p>

          <div className="flex items-center gap-1.5 text-tierra-400">
            <Heart className="w-4 h-4 fill-melocoton-300 text-melocoton-300" />
            <span className="font-sans text-sm">{imagen.likes.toLocaleString('es-AR')} me gusta</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-melocoton-100">
            <a href={mensajeWA} target="_blank" rel="noopener noreferrer"
               className="btn-primary w-full text-sm justify-center">
              <ShoppingBag className="w-4 h-4" />
              Quiero una pieza así
            </a>
            <a href={imagen.igUrl} target="_blank" rel="noopener noreferrer"
               className="btn-secondary w-full text-sm justify-center">
              <ExternalLink className="w-3.5 h-3.5" />
              Ver en Instagram
            </a>
          </div>

          <Link href="/catalogo" onClick={onCerrar}
                className="font-sans text-xs text-tierra-400 hover:text-melocoton-600 text-center transition-colors">
            Ver catálogo disponible →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Card de galería ───────────────────────────────────────
function GaleriaCard({ imagen, onClick }: { imagen: ImagenGaleria; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl cursor-zoom-in"
      aria-label={imagen.caption.slice(0, 60)}
    >
      <div className="relative aspect-square bg-melocoton-100">
        <ImgConFallback
          src={imagen.url}
          alt={imagen.caption}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-tierra-900/0 group-hover:bg-tierra-900/60 transition-all duration-300 flex flex-col items-end justify-start p-2">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-black/40 rounded-full px-2 py-0.5">
          <Heart className="w-3 h-3 text-white fill-white" />
          <span className="font-sans text-white text-[10px]">{imagen.likes}</span>
        </div>
      </div>

      {/* Caption hover bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent
                      translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="font-sans text-white text-[10px] leading-snug line-clamp-2">{imagen.caption}</p>
      </div>
    </button>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
export default function GaleriaCliente() {
  const [cat, setCat] = useState('todas');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtradas = cat === 'todas' ? GALERIA : GALERIA.filter(g => g.categoria === cat);

  const abrir = useCallback((i: number) => {
    setLightbox(i);
    document.body.style.overflow = 'hidden';
  }, []);

  const cerrar = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = '';
  }, []);

  const anterior = useCallback(() =>
    setLightbox(p => p !== null ? (p === 0 ? filtradas.length - 1 : p - 1) : null),
    [filtradas.length]
  );

  const siguiente = useCallback(() =>
    setLightbox(p => p !== null ? (p === filtradas.length - 1 ? 0 : p + 1) : null),
    [filtradas.length]
  );

  return (
    <div className="container-mel py-10">

      {/* Aviso URLs de Instagram */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0">💡</span>
        <p className="font-sans text-sm text-amber-700 leading-relaxed">
          <strong>Galería de Instagram:</strong> Estas fotos se cargan directamente desde Instagram y pueden tardar unos segundos. Las URLs expiran con el tiempo — para fotos permanentes, subí las imágenes a Cloudinary desde el{' '}
          <Link href="/admin/productos" className="underline font-medium">panel admin</Link>.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {CATEGORIAS_GALERIA.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-sm font-medium transition-all duration-200',
                    cat === c.id
                      ? 'bg-tierra-900 text-white shadow-md'
                      : 'bg-white text-tierra-700 border border-melocoton-200 hover:border-melocoton-400'
                  )}>
            <span>{c.emoji}</span>
            {c.label}
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full', cat === c.id ? 'bg-white/20 text-white' : 'bg-melocoton-100 text-melocoton-600')}>
              {c.id === 'todas' ? GALERIA.length : GALERIA.filter(g => g.categoria === c.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {filtradas.map((img, i) => (
          <GaleriaCard key={`${img.igUrl}-${i}`} imagen={img} onClick={() => abrir(i)} />
        ))}
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🏺</span>
          <p className="font-serif text-xl text-tierra-500">No hay imágenes en esta categoría.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 text-center bg-white rounded-2xl p-8 border border-melocoton-100 shadow-sm">
        <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ ¿Te enamoraste de algo? ✦</p>
        <h2 className="font-serif text-2xl text-tierra-900 mb-3">Todas estas piezas se pueden encargar</h2>
        <p className="font-serif italic text-tierra-500 mb-6 max-w-md mx-auto">
          Si ya fue vendida, podemos hacer una similar. Consultanos sin compromiso.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/catalogo" className="btn-primary px-8 py-3">
            <ShoppingBag className="w-4 h-4" /> Ver catálogo
          </Link>
          <a href={getLinkWhatsApp('Hola! Vi la galería y quiero consultar sobre una pieza.')}
             target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-3">
            Consultar por WhatsApp
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtradas[lightbox] && (
        <Lightbox
          imagen={filtradas[lightbox]}
          indice={lightbox}
          total={filtradas.length}
          onCerrar={cerrar}
          onAnterior={anterior}
          onSiguiente={siguiente}
        />
      )}
    </div>
  );
}
