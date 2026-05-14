import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50 flex items-center justify-center">
      <div className="container-mel text-center py-20 px-4 max-w-lg">
        <span className="text-8xl block mb-6">🏺</span>
        <h1 className="font-serif text-4xl text-tierra-900 mb-3">
          Esta página no existe
        </h1>
        <p className="font-serif italic text-tierra-500 text-lg mb-8 leading-relaxed">
          Parece que la pieza que buscás no está en nuestro taller. 
          Pero tenemos muchas otras esperándote.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary text-base px-8 py-3">
            Ir al inicio
          </Link>
          <Link href="/catalogo" className="btn-secondary text-base px-8 py-3">
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
