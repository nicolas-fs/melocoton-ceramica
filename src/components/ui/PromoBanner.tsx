import Link from 'next/link';
import { Tag } from 'lucide-react';

interface Props {
  mensaje?: string;
  enlace?: string;
  etiqueta?: string;
}

export default function PromoBanner({
  mensaje = '🏷️ Hay promociones activas en el catálogo',
  enlace = '/catalogo?promo=true',
  etiqueta = 'Ver ofertas',
}: Props) {
  return (
    <div className="bg-gradient-to-r from-melocoton-500 to-melocoton-600 text-white py-2.5 px-4 text-center">
      <p className="font-sans text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 flex-shrink-0" />
        {mensaje}
        <Link
          href={enlace}
          className="underline underline-offset-2 font-bold hover:no-underline transition-all"
        >
          {etiqueta} →
        </Link>
      </p>
    </div>
  );
}
