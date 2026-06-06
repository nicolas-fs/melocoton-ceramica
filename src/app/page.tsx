import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { obtenerProductos } from '@/lib/productos';
import { TESTIMONIOS } from '../../data/productos';
import ProductGrid from '@/components/shop/ProductGrid';
import PromoBanner from '@/components/ui/PromoBanner';
import HeroGrid from '@/components/home/HeroGrid';
import { GALERIA } from '../../data/galeria';

export default async function HomePage() {
 const [todos, destacados] = await Promise.all([
 obtenerProductos(),
 obtenerProductos({ destacado: true }),
 ]);

 const hayPromos = todos.some(p => p.enPromocion);
 const cantidadPromos = todos.filter(p => p.enPromocion).length;

 return (
 <>
 {/* Banner de promoción */}
 {hayPromos && (
 <PromoBanner
 mensaje={`${cantidadPromos} ${cantidadPromos === 1 ? 'producto con descuento' : 'productos con descuento'}`}
 enlace="/catalogo?promo=true"
 etiqueta="Ver ofertas"
 />
 )}

 {/* ── HERO con 6 fotos ─────────────────────────── */}
 <HeroGrid />


 {/* ── CATÁLOGO COMPLETO ─────────────────────────── */}
 <section id="catalogo" className="py-20 bg-melocoton-50">
 <div className="container-mel px-4">
 <div className="text-center mb-12">
 <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">Lo que tenemos</p>
 <h2 className="section-title">Catálogo completo</h2>
 <p className="font-serif italic text-tierra-500 text-lg mt-2 max-w-md mx-auto">
 Cada pieza es única. Si te enamorás de una, no la dejés ir.
 </p>
 </div>

 {destacados.length > 0 && (
 <div className="mb-16">
 <h3 className="font-serif text-2xl text-tierra-800 mb-6">Más queridas</h3>
 <ProductGrid productos={destacados} columnas={3} />
 </div>
 )}

 <div>
 <h3 className="font-serif text-2xl text-tierra-800 mb-6">Todo el catálogo</h3>
 <ProductGrid productos={todos} columnas={3} />
 </div>

 <div className="text-center mt-12">
 <Link href="/catalogo" className="btn-primary text-base px-8 py-3">
 Ver catálogo con filtros →
 </Link>
 </div>
 </div>
 </section>

 {/* ── TESTIMONIOS ──────────────────────────────── */}
 <section className="py-20 bg-white">
 <div className="container-mel px-4">
 <div className="text-center mb-12">
 <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">Lo que dicen</p>
 <h2 className="section-title">Palabras de quienes ya tienen su pieza</h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {TESTIMONIOS.map((t, i) => (
 <blockquote key={i} className="bg-melocoton-50 rounded-2xl p-6 shadow-sm border border-melocoton-100 flex flex-col gap-4">
 <div className="text-melocoton-400 text-sm"></div>
 <p className="font-serif text-base text-tierra-700 leading-relaxed italic flex-1">"{t.texto}"</p>
 <footer className="font-sans text-xs text-tierra-400">
 <span className="font-medium text-tierra-600">{t.nombre}</span> · {t.ciudad}
 </footer>
 </blockquote>
 ))}
 </div>
 </div>
 </section>

 {/* ── GALERÍA PREVIEW ──────────────────────────── */}
 <section className="py-20 bg-melocoton-50 border-t border-melocoton-100">
 <div className="container-mel px-4">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
 <div>
 <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">Nuestras piezas</p>
 <h2 className="section-title">Galería</h2>
 </div>
 <Link href="/galeria" className="font-sans text-sm text-melocoton-600 hover:text-melocoton-700 font-medium">
 Ver galería completa ({GALERIA.length} fotos) →
 </Link>
 </div>
 <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
 {GALERIA.slice(0, 12).map((img, i) => (
 <Link key={i} href="/galeria" className="relative aspect-square rounded-xl overflow-hidden bg-melocoton-100 group">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={img.url} alt={img.caption} referrerPolicy="no-referrer"
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
 <div className="absolute inset-0 bg-tierra-900/0 group-hover:bg-tierra-900/30 transition-all duration-300" />
 </Link>
 ))}
 </div>
 <div className="text-center">
 <Link href="/galeria" className="btn-primary px-8 py-3">Ver galería completa →</Link>
 </div>
 </div>
 </section>

 {/* ── MAYORISTA CTA ────────────────────────────── */}
 <section className="py-16 bg-tierra-800">
 <div className="container-mel px-4 text-center">
 <p className="font-sans text-xs tracking-widest text-melocoton-400 uppercase mb-3">Para empresas y emprendedores</p>
 <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">¿Comprás por mayor?</h2>
 <p className="font-serif italic text-tierra-300 text-lg mb-8 max-w-xl mx-auto">
 Tenemos precios especiales para locales, gastronomía, regalos corporativos y reventa.
 </p>
 <Link href="/mayorista"
 className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-melocoton-400 text-white font-sans font-medium text-base hover:bg-melocoton-500 transition-colors">
 Ver precios mayoristas →
 </Link>
 </div>
 </section>

 {/* ── INSTAGRAM ────────────────────────────────── */}
 <section className="py-14 bg-white border-t border-melocoton-100">
 <div className="container-mel px-4 text-center">
 <p className="font-sans text-sm text-tierra-500 mb-2">¿Querés ver el proceso en vivo?</p>
 <h2 className="font-serif text-2xl md:text-3xl text-tierra-900 mb-6">Seguinos en Instagram</h2>
 <a href="https://instagram.com/melocoton.ceramica" target="_blank" rel="noopener noreferrer"
 className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-sans font-medium text-base hover:opacity-90 transition-opacity shadow-md">
 <Instagram className="w-5 h-5" /> @melocoton.ceramica
 </a>
 </div>
 </section>
 </>
 );
}
