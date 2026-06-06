import Link from 'next/link';

// Íconos SVG inline (sin emojis, sin dependencias extra)
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconBrush = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.48 1.02 3.5 1.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-2.5-3.02z"/>
  </svg>
);
const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const FEATURES = [
  { icon: <IconHeart />, titulo: 'Hecho a mano', desc: 'Cada pieza es única' },
  { icon: <IconBrush />, titulo: 'Diseños originales', desc: 'Creatividad y mucho amor.' },
  { icon: <IconPackage />, titulo: 'Enviamos a todo el país', desc: 'Desde Córdoba.' },
];

export default function HeroGrid() {
  return (
    <section className="pt-16 md:pt-20">

      {/* ── HERO PRINCIPAL ── fondo rosa, tipografía bold, fiel a la imagen */}
      <div className="text-center px-6 py-14 md:py-20" style={{ backgroundColor: '#FDF0EC' }}>

        {/* Título grande y bold — igual a la imagen */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-tierra-900 leading-tight mb-4"
          style={{ fontFamily: "'Readex Pro', sans-serif" }}
        >
          Melocotón<br />Cerámica
        </h1>

        {/* CAMBIO 2.1: Nuevo texto hero exacto */}
        <p className="text-lg md:text-xl text-tierra-600 mb-2">
          Piezas únicas, hechas a mano en Córdoba,
        </p>
        <p className="text-lg md:text-xl text-tierra-600 mb-5">
          para acompañar tus momentos favoritos.
        </p>

        {/* "Somos Cami & Nacho" — tipografía script cursiva como en la imagen */}
        <p
          className="text-2xl md:text-3xl mb-8"
          style={{ fontFamily: "'Dancing Script', cursive", color: '#E8654A' }}
        >
          Somos Cami &amp; Nacho
        </p>

        {/* 3 características con íconos — fila como en la imagen */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-10">
          {FEATURES.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span style={{ color: '#E8654A' }}>{item.icon}</span>
              <div className="text-left">
                <p className="font-semibold text-sm text-tierra-800">{item.titulo}</p>
                <p className="text-xs text-tierra-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CAMBIO 2.2: Botón coral/terracota con flecha — igual a la imagen */}
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-lg shadow-md transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#E8654A' }}
        >
          Ver catálogo
          <IconArrow />
        </Link>
      </div>

      {/* ── FOTO HERO — imagen real del producto ── */}
      <div className="relative overflow-hidden" style={{ maxHeight: '480px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero/hero-1.jpg"
          alt="Tazas artesanales Melocoton Ceramica"
          className="w-full object-cover"
          style={{ maxHeight: '480px', objectPosition: 'center' }}
        />

        {/* Card flotante — igual a la de la imagen de referencia */}
        <div
          className="absolute bottom-6 left-4 md:left-8 bg-white rounded-2xl p-4 shadow-xl"
          style={{ maxWidth: '200px' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center mb-2 flex-shrink-0"
            style={{ backgroundColor: '#FDF0EC' }}
          >
            <span style={{ color: '#E8654A' }}><IconHeart /></span>
          </div>
          <p className="text-xs font-bold mb-1" style={{ color: '#E8654A' }}>
            Cerámica artesanal
          </p>
          <p className="text-xs text-tierra-600 leading-relaxed">
            Tazas y piezas de cerámica hechas a mano para acompañar tus momentos favoritos.
          </p>
        </div>
      </div>

      {/* ── FRANJA DE 3 ÍCONOS debajo de la foto (segunda aparición, como en la imagen) ── */}
      <div
        className="grid grid-cols-3 divide-x divide-melocoton-100 border-t border-melocoton-100"
        style={{ backgroundColor: '#FDF0EC' }}
      >
        {FEATURES.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center px-3 py-5">
            <span style={{ color: '#E8654A' }} className="mb-1.5">{item.icon}</span>
            <p className="font-semibold text-xs mb-0.5" style={{ color: '#E8654A' }}>{item.titulo}</p>
            <p className="text-[11px] text-tierra-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
