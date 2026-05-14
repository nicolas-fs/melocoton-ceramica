import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-tierra-900 text-tierra-200">
      <div className="container-mel py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Columna 1: Logo + descripción */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Melocotón Cerámica"
              width={52}
              height={52}
              className="rounded-full object-cover border-2 border-melocoton-700"
            />
            <div>
              <p className="font-serif text-lg text-white leading-tight">Melocotón</p>
              <p className="font-sans text-xs tracking-widest text-melocoton-400 uppercase">Cerámica Artesanal</p>
            </div>
          </div>
          <p className="font-sans text-sm text-tierra-300 leading-relaxed">
            Piezas únicas, hechas a mano en Villa Carlos Paz, Córdoba. Cada taza lleva la huella de sus manos.
          </p>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <p className="font-sans text-xs font-semibold text-white uppercase tracking-widest mb-4">Navegación</p>
          <ul className="space-y-2">
            {[
              { href: '/',         label: 'Inicio'   },
              { href: '/catalogo', label: 'Catálogo' },
              { href: '/contacto', label: 'Contacto' },
              { href: '/carrito',  label: 'Carrito'  },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="font-sans text-sm text-tierra-300 hover:text-melocoton-300 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <p className="font-sans text-xs font-semibold text-white uppercase tracking-widest mb-4">Encontranos</p>
          <div className="space-y-2 text-sm text-tierra-300 font-sans">
            <p>📍 Villa Carlos Paz, Córdoba</p>
            <a href="https://wa.me/5493541000000"
               className="block text-melocoton-300 hover:text-melocoton-200 transition-colors">
              📱 WhatsApp
            </a>
            <a href="https://instagram.com/melocoton.ceramica"
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-melocoton-300 hover:text-melocoton-200 transition-colors">
              <Instagram className="w-4 h-4" />
              @melocoton.ceramica
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-tierra-700">
        <div className="container-mel py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-sans text-xs text-tierra-500">
            © {new Date().getFullYear()} Melocotón Cerámica. Todos los derechos reservados.
          </p>
          <p className="font-sans text-xs text-tierra-500 flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-melocoton-400 fill-melocoton-400" /> en Carlos Paz
          </p>
        </div>
      </div>
    </footer>
  );
}
