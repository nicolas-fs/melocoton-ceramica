import { Metadata } from 'next';
import GaleriaCliente from './GaleriaCliente';

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Explorá todas las piezas de Melocotón Cerámica. Tazas, tazones, sets y más — cada una hecha a mano en Villa Carlos Paz.',
  openGraph: {
    title: 'Galería — Melocotón Cerámica',
    description: 'Explorá todas nuestras piezas artesanales únicas.',
  },
};

export default function GaleriaPage() {
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-crema-200 to-melocoton-50 py-16 border-b border-melocoton-200">
        <div className="container-mel text-center">
          <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">
            ✦ @melocoton.ceramica ✦
          </p>
          <h1 className="section-title mb-4">Galería de piezas</h1>
          <p className="font-serif italic text-tierra-500 text-lg max-w-lg mx-auto">
            Cada foto es una pieza real, hecha a mano. Explorá, enamoráte y si algo te llama, escribinos.
          </p>
        </div>
      </div>

      {/* Galería interactiva (client component) */}
      <GaleriaCliente />
    </div>
  );
}
