'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/',         label: 'Inicio'   },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/galeria',  label: 'Galería'  },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu]         = useState(false);
  const { cantidadTotal, abrirCarrito } = useCarrito();
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenu(false); }, [pathname]);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-melocoton-50/95 backdrop-blur-sm shadow-sm border-b border-melocoton-200'
        : 'bg-transparent'
    )}>
      <nav className="container-mel flex items-center justify-between h-16 md:h-20">

        {/* ── Logo ── */}
        <Link href="/" aria-label="Melocotón Cerámica — Inicio">
          <Image
            src="/logo.jpg"
            alt="Melocotón Cerámica Artesanal"
            width={64}
            height={64}
            className="h-12 md:h-14 w-auto object-contain rounded-full"
            priority
          />
        </Link>

        {/* ── Links desktop ── */}
        <ul className="hidden md:flex items-center gap-8">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'font-sans text-sm font-medium transition-colors',
                  pathname === href
                    ? 'text-melocoton-600'
                    : 'text-tierra-700 hover:text-melocoton-600'
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Acciones ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={abrirCarrito}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-melocoton-100 transition-colors"
            aria-label={`Carrito (${cantidadTotal} items)`}
          >
            <ShoppingBag className="w-5 h-5 text-tierra-700" />
            {cantidadTotal > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-melocoton-400 text-white text-xs font-bold flex items-center justify-center animate-fade-in">
                {cantidadTotal > 9 ? '9+' : cantidadTotal}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenu(!menu)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-melocoton-100 transition-colors"
            aria-label="Menú"
          >
            {menu ? <X className="w-5 h-5 text-tierra-700" /> : <Menu className="w-5 h-5 text-tierra-700" />}
          </button>
        </div>
      </nav>

      {/* ── Menú móvil ── */}
      {menu && (
        <div className="md:hidden bg-melocoton-50 border-t border-melocoton-200 shadow-lg">
          <ul className="container-mel py-4 flex flex-col gap-1">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'block px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-melocoton-100 text-melocoton-700'
                      : 'text-tierra-700 hover:bg-melocoton-100'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-melocoton-200 mt-2">
              <button
                onClick={abrirCarrito}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl font-sans text-sm font-medium text-tierra-700 hover:bg-melocoton-100 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Carrito {cantidadTotal > 0 && `(${cantidadTotal})`}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
