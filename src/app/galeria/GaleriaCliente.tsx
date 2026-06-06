'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { GALERIA, CATEGORIAS_GALERIA, ImagenGaleria } from '../../../data/galeria';
import { getLinkWhatsApp, cn } from '@/lib/utils';

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
      if (e.key === 'Escape')      onCerrar();
      if (e.key === 'ArrowLeft')   onAnterior();
      if (e.key === 'ArrowRight')  onSiguiente();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCerrar, onAnterior, onSiguiente]);

  const mensajeWA = getLinkWhatsApp(
    `Hola Melocoton Ceramica! Vi esta pieza en la galeria y quiero consultar: "${imagen.caption.slice(0, 60)}"`
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
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '60vh' }}
          />

          <button
            onClick={e => { e.stopPropagation(); onAnterior(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSiguiente(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {indice + 1} / {total}
          </div>
        </div>

        {/* Panel de info */}
        <div className="md:w-72 flex flex-col p-5 gap-4 overflow-y-auto">
          <button
            onClick={onCerrar}
            className="self-end w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-tierra-600" />
          </button>

          <div>
            <p className="text-xs text-tierra-400 uppercase tracking-widest mb-1">
              Melocoton Ceramica
            </p>
            <p className="text-sm font-medium text-tierra-900">
              Villa Carlos Paz, Cordoba
            </p>
          </div>

          <p className="text-sm text-tierra-700 leading-relaxed flex-1">
            {imagen.caption}
          </p>

          <div className="space-y-2 pt-2 border-t border-tierra-200">
            <a
              href={mensajeWA}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-sm justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
              Quiero una pieza asi
            </a>
          </div>

          <Link
            href="/catalogo"
            onClick={onCerrar}
            className="text-xs text-tierra-400 hover:text-melocoton-600 text-center transition-colors"
          >
            Ver catalogo disponible
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagen.url}
          alt={imagen.caption}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Overlay hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-80 transition-all duration-300"
        style={{ background: 'linear-gradient(to top, #F25F5C, transparent)' }}
      />

      {/* Caption al hover */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-[10px] leading-snug line-clamp-2">{imagen.caption}</p>
      </div>
    </button>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
export default function GaleriaCliente() {
  const [cat, setCat]         = useState('todas');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtradas = cat === 'todas'
    ? GALERIA
    : GALERIA.filter(g => g.categoria === cat);

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

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {CATEGORIAS_GALERIA.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              cat === c.id
                ? 'text-white shadow-md'
                : 'bg-white text-tierra-700 border border-tierra-200 hover:border-melocoton-400'
            )}
            style={cat === c.id ? { backgroundColor: '#F25F5C' } : {}}
          >
            {c.label}
            <span className={cn(
              'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
              cat === c.id ? 'bg-white/20 text-white' : 'bg-melocoton-100 text-melocoton-600'
            )}>
              {c.id === 'todas' ? GALERIA.length : GALERIA.filter(g => g.categoria === c.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {filtradas.map((img, i) => (
          <GaleriaCard key={`${img.url}-${i}`} imagen={img} onClick={() => abrir(i)} />
        ))}
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-tierra-500">No hay imagenes en esta categoria.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 text-center bg-white rounded-2xl p-8 border border-tierra-200 shadow-sm">
        <p className="text-xs tracking-widest text-melocoton-500 uppercase mb-3">
          Todas estas piezas se pueden encargar
        </p>
        <h2 className="text-2xl text-tierra-900 font-semibold mb-3">
          Si algo te llamo la atencion, escribinos
        </h2>
        <p className="text-tierra-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">
          Si ya fue vendida, podemos hacer una similar. Cada pieza es unica pero el amor es el mismo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/catalogo" className="btn-primary px-8 py-3">
            <ShoppingBag className="w-4 h-4" />
            Ver catalogo
          </Link>
          <a
            href={getLinkWhatsApp('Hola! Vi la galeria y quiero consultar sobre una pieza.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-8 py-3"
          >
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
