'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { GALERIA, ImagenGaleria } from '../../../data/galeria';
import { getLinkWhatsApp } from '@/lib/utils';

// ── Lightbox — sin caption, sin categoría ────────────────
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
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onCerrar();
      if (e.key === 'ArrowLeft')  onAnterior();
      if (e.key === 'ArrowRight') onSiguiente();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCerrar, onAnterior, onSiguiente]);

  const mensajeWA = getLinkWhatsApp(
    'Hola Melocoton Ceramica! Vi una pieza en la galeria y quiero consultar.'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen — sin ningún texto encima */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagen.url}
          alt="Pieza artesanal Melocoton Ceramica"
          className="block max-w-full max-h-[85vh] object-contain"
        />

        {/* Controles de navegación */}
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

        {/* Cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contador y botón WA — lo único que se muestra */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4">
          <span className="text-xs text-white/60 bg-black/40 px-2 py-1 rounded-full">
            {indice + 1} / {total}
          </span>
          <a
            href={mensajeWA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-white font-medium"
            style={{ backgroundColor: '#E8654A' }}
            onClick={e => e.stopPropagation()}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Consultar
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Card — solo la foto, sin texto, sin overlay con caption ──
function GaleriaCard({ imagen, onClick }: { imagen: ImagenGaleria; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl cursor-zoom-in bg-melocoton-100"
      style={{ aspectRatio: '1/1' }}
      aria-label="Ver foto"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagen.url}
        alt="Pieza artesanal Melocoton Ceramica"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Overlay mínimo al hover — solo oscurece levemente, sin texto */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 rounded-xl" />
    </button>
  );
}

// ── PÁGINA — sin filtros de categoría, solo grilla de fotos ──
export default function GaleriaCliente() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const abrir = useCallback((i: number) => {
    setLightbox(i);
    document.body.style.overflow = 'hidden';
  }, []);

  const cerrar = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = '';
  }, []);

  const anterior = useCallback(() =>
    setLightbox(p => p !== null ? (p === 0 ? GALERIA.length - 1 : p - 1) : null),
    []
  );

  const siguiente = useCallback(() =>
    setLightbox(p => p !== null ? (p === GALERIA.length - 1 ? 0 : p + 1) : null),
    []
  );

  return (
    <div className="container-mel py-10">

      {/* Grilla — sin filtros encima */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {GALERIA.map((img, i) => (
          <GaleriaCard key={`${img.url}-${i}`} imagen={img} onClick={() => abrir(i)} />
        ))}
      </div>

      {/* CTA inferior */}
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
      {lightbox !== null && GALERIA[lightbox] && (
        <Lightbox
          imagen={GALERIA[lightbox]}
          indice={lightbox}
          total={GALERIA.length}
          onCerrar={cerrar}
          onAnterior={anterior}
          onSiguiente={siguiente}
        />
      )}
    </div>
  );
}
