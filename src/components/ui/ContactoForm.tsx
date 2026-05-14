'use client';
import { useState } from 'react';
import { getLinkWhatsApp } from '@/lib/utils';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactoForm() {
  const [datos, setDatos] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!datos.nombre || !datos.email || !datos.mensaje) { toast.error('Completá todos los campos'); return; }
    setEnviando(true);
    // Fallback directo a WhatsApp (funciona sin configurar nada)
    const msg = `Hola! Soy ${datos.nombre} (${datos.email}). ${datos.mensaje}`;
    window.open(getLinkWhatsApp(msg), '_blank');
    setEnviado(true);
    setEnviando(false);
    toast.success('¡Abrimos WhatsApp para que envíes tu mensaje!');
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <span className="text-4xl block mb-3">✉️</span>
        <h3 className="font-serif text-xl text-green-700 mb-2">¡Listo!</h3>
        <p className="font-sans text-sm text-green-600">Tu mensaje se abrió en WhatsApp. ¡Respondemos a la brevedad!</p>
        <button onClick={() => setEnviado(false)} className="mt-4 text-xs text-green-600 hover:underline font-sans">Enviar otro mensaje</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nombre *</label>
          <input type="text" value={datos.nombre} onChange={e => setDatos(p => ({...p, nombre: e.target.value}))} className="form-input" placeholder="María García" required />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input type="email" value={datos.email} onChange={e => setDatos(p => ({...p, email: e.target.value}))} className="form-input" placeholder="maria@mail.com" required />
        </div>
      </div>
      <div>
        <label className="form-label">Mensaje *</label>
        <textarea value={datos.mensaje} onChange={e => setDatos(p => ({...p, mensaje: e.target.value}))} className="form-input resize-none" rows={5} placeholder="Contanos qué necesitás..." required />
      </div>
      <button type="submit" disabled={enviando} className="btn-primary w-full">
        <Send className="w-4 h-4" /> {enviando ? 'Abriendo WhatsApp...' : 'Enviar por WhatsApp'}
      </button>
    </form>
  );
}
