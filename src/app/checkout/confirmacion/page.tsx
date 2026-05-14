import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

interface Props { searchParams: { pedidoId?: string; metodo?: string } }

export default function ConfirmacionPage({ searchParams }: Props) {
  const { pedidoId, metodo } = searchParams;
  return (
    <div className="pt-20 min-h-screen bg-melocoton-50 flex items-center justify-center">
      <div className="container-mel py-16 max-w-lg text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" strokeWidth={1.5} />
        <h1 className="font-serif text-4xl text-tierra-900 mb-3">¡Pedido confirmado!</h1>
        <p className="font-serif italic text-tierra-500 text-lg mb-2">Gracias por elegir Melocotón Cerámica.</p>
        {pedidoId && <p className="font-sans text-sm text-tierra-400 mb-8">Pedido: <span className="font-medium text-tierra-700">{pedidoId}</span></p>}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 text-left mb-8">
          <h2 className="font-serif text-lg text-tierra-900 mb-3">¿Qué sigue?</h2>
          {metodo === 'transferencia' ? (
            <ol className="font-sans text-sm text-tierra-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Te vamos a contactar por WhatsApp con los datos bancarios.</li>
              <li>Realizá la transferencia y envianos el comprobante.</li>
              <li>Confirmamos el pago y preparamos tu pedido.</li>
              <li>Coordinamos el envío o retiro en Carlos Paz.</li>
            </ol>
          ) : (
            <p className="font-sans text-sm text-tierra-600 leading-relaxed">
              Tu pago fue confirmado. Vamos a preparar tu pedido y te contactaremos para coordinar el envío.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Volver al inicio</Link>
          <a href="https://instagram.com/melocoton.ceramica" target="_blank" rel="noopener noreferrer" className="btn-secondary">Seguinos en IG</a>
        </div>
      </div>
    </div>
  );
}
