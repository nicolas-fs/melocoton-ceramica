'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error boundary]', error);
  }, [error]);

  return (
    <div className="pt-20 min-h-screen bg-melocoton-50 flex items-center justify-center">
      <div className="container-mel text-center py-20 px-4 max-w-lg">
        <span className="text-7xl block mb-6">😅</span>
        <h2 className="font-serif text-3xl text-tierra-900 mb-3">
          Algo salió mal
        </h2>
        <p className="font-serif italic text-tierra-500 text-lg mb-8">
          Hubo un error inesperado. Podés intentar de nuevo o volver al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary text-base px-8 py-3">
            Intentar de nuevo
          </button>
          <Link href="/" className="btn-secondary text-base px-8 py-3">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
