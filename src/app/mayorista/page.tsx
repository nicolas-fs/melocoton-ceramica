import { Metadata } from 'next';
import MayoristaForm from './MayoristaForm';

export const metadata: Metadata = {
  title: 'Mayorista',
  description: 'Precios especiales para emprendimientos, locales y empresas. Cerámica artesanal Melocotón al por mayor.',
};

export default function MayoristaPage() {
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      <div className="bg-gradient-to-b from-tierra-900 to-tierra-800 py-20 px-4 text-center">
        <p className="font-sans text-xs tracking-widest text-melocoton-400 uppercase mb-4">
          Para emprendedores y empresas
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-crema-100 mb-6">
          ¿Querés comprar<br />
          <span className="text-melocoton-400 italic">por mayor?</span>
        </h1>
        <p className="font-serif italic text-tierra-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Ofrecemos precios especiales para emprendimientos, locales y empresas interesadas en adquirir
          nuestras piezas para reventa, decoración de espacios o regalos corporativos/institucionales.
        </p>
      </div>

      <div className="container-mel py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { emoji: '🎁', titulo: 'Precios especiales', desc: 'Escalas de precio según volumen. A más piezas, mejor precio.' },
            { emoji: '🎨', titulo: 'Personalización', desc: 'Podemos adaptar colores, frases y diseños a tu marca.' },
            { emoji: '📦', titulo: 'Envíos a todo el país', desc: 'Coordinamos el envío más conveniente para tu pedido.' },
          ].map(b => (
            <div key={b.titulo} className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 text-center">
              <span className="text-4xl block mb-3">{b.emoji}</span>
              <h3 className="font-serif text-lg text-tierra-900 mb-2">{b.titulo}</h3>
              <p className="font-sans text-sm text-tierra-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-tierra-900 mb-3">Quiero ser mayorista</h2>
            <p className="font-sans text-sm text-tierra-500">
              Completá el formulario y te enviamos un PDF con precios, colores disponibles,
              tiempos de entrega y condiciones de venta.
            </p>
          </div>
          <MayoristaForm />
        </div>
      </div>
    </div>
  );
}
