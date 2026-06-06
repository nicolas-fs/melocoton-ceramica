import { Metadata } from 'next';
import GaleriaCliente from './GaleriaCliente';

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Todas las piezas de Melocoton Ceramica. Tazas, tazones, sets y mas, cada una hecha a mano en Villa Carlos Paz.',
  openGraph: {
    title: 'Galería — Melocoton Ceramica',
    description: 'Todas nuestras piezas artesanales unicas.',
  },
};

export default function GaleriaPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="py-14 border-b border-tierra-200" style={{ background: 'linear-gradient(to bottom, #fff5f5, #ffffff)' }}>
        <div className="container-mel text-center">
          <p className="text-xs tracking-widest text-melocoton-500 uppercase mb-3">
            Melocoton Ceramica · Villa Carlos Paz
          </p>
          <h1 className="section-title mb-4">Galería de piezas</h1>
          <p className="text-tierra-500 text-base max-w-lg mx-auto">
            Cada foto es una pieza real, hecha a mano. Si algo te llama la atencion, escribinos.
          </p>
        </div>
      </div>

      {/* Galería interactiva */}
      <GaleriaCliente />
    </div>
  );
}
