'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/galeria', label: 'Galería' },
  { href: '/mayorista', label: 'Mayorista' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { cantidadTotal, abrirCarrito } = useCarrito();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalogo?busqueda=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-crema-100/95 backdrop-blur-sm shadow-sm border-b border-melocoton-200'
          : 'bg-crema-100/90 backdrop-blur-sm'
      )}>
        <nav className="flex items-center justify-between h-16 md:h-20 px-4 md:px-8 max-w-7xl mx-auto">

          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-melocoton-100 transition-colors flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-tierra-700" />
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Melocoton Ceramica">
            <Image
              src="/logotipo.jpg"
              alt="Melocoton Ceramica Artesanal"
              width={120}
              height={120}
              className="h-16 md:h-20 w-auto object-contain rounded-full"
              priority
            />
          </Link>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-melocoton-100 transition-colors"
              aria-label="Buscar productos"
            >
              <Search className="w-5 h-5 text-tierra-700" />
            </button>

            <button
              onClick={abrirCarrito}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-melocoton-100 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag className="w-5 h-5 text-tierra-700" />
              {cantidadTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-melocoton-400 text-white text-xs font-bold flex items-center justify-center animate-fade-in">
                  {cantidadTotal > 9 ? '9+' : cantidadTotal}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-72 bg-crema-100 z-50 shadow-2xl flex flex-col transition-transform duration-300',
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-melocoton-200">
          <Image
            src="/logotipo.jpg"
            alt="Melocoton Ceramica"
            width={64}
            height={64}
            className="h-16 w-auto object-contain rounded-full"
          />
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-melocoton-100 transition-colors"
          >
            <X className="w-5 h-5 text-tierra-600" />
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center px-4 py-3 rounded-xl font-sans text-base font-medium transition-colors',
                pathname === href
                  ? 'bg-melocoton-100 text-melocoton-700'
                  : 'text-tierra-700 hover:bg-melocoton-50 hover:text-melocoton-600'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-5 border-t border-melocoton-200">
          <p className="font-sans text-xs text-tierra-400 text-center">
            @melocoton.ceramica - Villa Carlos Paz, Cordoba
          </p>
        </div>
      </aside>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-tierra-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar piezas..."
                className="flex-1 font-sans text-base text-tierra-900 placeholder:text-tierra-400 bg-transparent outline-none"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-tierra-400 hover:text-tierra-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <div className="px-5 pb-4 border-t border-melocoton-100 pt-3">
              <p className="font-sans text-xs text-tierra-400">
                Presiona Enter para buscar en el catalogo completo
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Tazas con frases', 'Mates', 'Sets regalo', 'Tazones XL', 'Personalizados'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { setQuery(tag); router.push(`/catalogo?busqueda=${encodeURIComponent(tag)}`); setSearchOpen(false); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-melocoton-50 text-melocoton-700 border border-melocoton-200 hover:bg-melocoton-100 font-sans transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
