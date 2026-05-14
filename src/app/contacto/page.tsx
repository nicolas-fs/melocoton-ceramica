import { Metadata } from 'next';
import { Instagram, MapPin, Clock } from 'lucide-react';
import ContactoForm from '@/components/ui/ContactoForm';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribinos para consultas, pedidos especiales o personalizaciones.',
};

export default function ContactoPage() {
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50">
      <div className="bg-gradient-to-b from-crema-200 to-melocoton-50 py-16 border-b border-melocoton-100">
        <div className="container-mel text-center">
          <p className="font-sans text-xs tracking-widest text-melocoton-500 uppercase mb-3">✦ Hablemos ✦</p>
          <h1 className="section-title mb-4">Contacto</h1>
          <p className="font-serif italic text-tierra-500 text-lg max-w-md mx-auto">Para pedidos especiales, regalos o simplemente para charlar.</p>
        </div>
      </div>

      <div className="container-mel py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl text-tierra-900 mb-6">Mandanos un mensaje</h2>
            <ContactoForm />
          </div>
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-tierra-900">Encontranos</h2>
            {[
              { icon: <MapPin className="w-5 h-5 text-melocoton-500" />, titulo: 'Dónde estamos', desc: 'Villa Carlos Paz, Córdoba, Argentina. Vendemos online y podés retirar en persona.' },
              { icon: <Clock className="w-5 h-5 text-melocoton-500" />, titulo: 'Tiempo de respuesta', desc: 'Respondemos en el día. Para urgencias, escribinos por WhatsApp.' },
            ].map(item => (
              <div key={item.titulo} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-melocoton-100">
                <div className="w-10 h-10 rounded-full bg-melocoton-100 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="font-sans font-semibold text-tierra-900 text-sm">{item.titulo}</p>
                  <p className="font-sans text-sm text-tierra-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
            <a href="https://instagram.com/melocoton.ceramica" target="_blank" rel="noopener noreferrer"
               className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-melocoton-100 hover:border-melocoton-300 hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-sans font-semibold text-tierra-900 text-sm group-hover:text-melocoton-600 transition-colors">@melocoton.ceramica</p>
                <p className="font-sans text-sm text-tierra-500 mt-0.5">Seguinos para ver el proceso y las novedades antes que nadie.</p>
              </div>
            </a>
            <div className="bg-melocoton-100 rounded-2xl p-6 border border-melocoton-200">
              <h3 className="font-serif text-lg text-tierra-900 mb-2">¿Querés algo personalizado?</h3>
              <p className="font-sans text-sm text-tierra-600 leading-relaxed">Hacemos piezas con frases, nombres o diseños especiales. También regalos corporativos. Consultanos sin compromiso.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
