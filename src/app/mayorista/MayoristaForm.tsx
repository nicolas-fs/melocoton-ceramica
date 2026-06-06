'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

const RUBROS = ['Decoración', 'Diseño', 'Gastronomía (restaurante, café, hotel)', 'Regalos empresariales', 'Souvenir'];
const DESTINOS = ['Venta minorista/reventa', 'Decoración de espacio propio', 'Regalos institucionales o empresariales', 'Acciones promocionales/sorteos', 'Souvenir'];

export default function MayoristaForm() {
 const [enviado, setEnviado] = useState(false);
 const [enviando, setEnviando] = useState(false);
 const [error, setError] = useState('');

 const [form, setForm] = useState({
 nombre: '',
 telefono: '',
 email: '',
 empresa: '',
 ubicacion: '',
 redesSociales: '',
 rubros: [] as string[],
 rubrosOtro: '',
 destinos: [] as string[],
 destinosOtro: '',
 tipoVenta: '',
 personalizacion: '',
 comentarios: '',
 });

 const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

 function toggleCheck(key: 'rubros' | 'destinos', value: string) {
 setForm(prev => ({
 ...prev,
 [key]: prev[key].includes(value)
 ? prev[key].filter(x => x !== value)
 : [...prev[key], value],
 }));
 }

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError('');

 // Validación básica
 if (!form.nombre || !form.telefono || !form.email || !form.empresa || !form.ubicacion) {
 setError('Por favor completá todos los campos obligatorios.');
 return;
 }
 if (form.rubros.length === 0) { setError('Seleccioná al menos un rubro.'); return; }
 if (form.destinos.length === 0) { setError('Seleccioná al menos un destino.'); return; }
 if (!form.tipoVenta) { setError('Indicá si tenés local físico o venta online.'); return; }
 if (!form.personalizacion) { setError('Indicá si querés personalización.'); return; }

 setEnviando(true);
 try {
 const res = await fetch('/api/mayorista', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(form),
 });
 if (!res.ok) throw new Error('Error al enviar');
 setEnviado(true);
 } catch {
 setError('Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.');
 } finally {
 setEnviando(false);
 }
 }

 if (enviado) {
 return (
 <div className="bg-white rounded-2xl p-10 shadow-sm border border-green-200 text-center">
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <Check className="w-8 h-8 text-green-600" />
 </div>
 <h3 className="font-serif text-2xl text-tierra-900 mb-3">¡Gracias!</h3>
 <p className="font-sans text-tierra-600 leading-relaxed max-w-md mx-auto">
 Recibimos tu consulta. Te enviaremos un PDF con precios mayoristas, colores disponibles,
 tiempos de entrega y condiciones de venta.
 <br /><br />
 <strong>Esto no implica ningún compromiso de compra.</strong>
 </p>
 <p className="font-serif italic text-melocoton-500 mt-6">¡Gracias por el interés en Melocotón Cerámica! </p>
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-melocoton-100 overflow-hidden">
 <div className="p-6 md:p-8 space-y-6">

 {/* Datos personales */}
 <section>
 <h3 className="font-sans text-xs font-bold text-tierra-500 uppercase tracking-widest mb-4">Tus datos</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="form-label">Tu nombre *</label>
 <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
 className="form-input" placeholder="María García" required />
 </div>
 <div>
 <label className="form-label">Número de teléfono *</label>
 <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
 className="form-input" placeholder="+54 9 354..." required type="tel" />
 </div>
 <div>
 <label className="form-label">Correo electrónico *</label>
 <input value={form.email} onChange={e => set('email', e.target.value)}
 className="form-input" placeholder="maria@email.com" required type="email" />
 </div>
 <div>
 <label className="form-label">Nombre del local/empresa *</label>
 <input value={form.empresa} onChange={e => set('empresa', e.target.value)}
 className="form-input" placeholder="Mi emprendimiento" required />
 </div>
 <div>
 <label className="form-label">Ubicación *</label>
 <input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}
 className="form-input" placeholder="Ciudad, Provincia" required />
 </div>
 <div>
 <label className="form-label">Página web o redes sociales *</label>
 <input value={form.redesSociales} onChange={e => set('redesSociales', e.target.value)}
 className="form-input" placeholder="@milocal o www.milocal.com" required />
 </div>
 </div>
 </section>

 {/* Rubro */}
 <section>
 <h3 className="font-sans text-xs font-bold text-tierra-500 uppercase tracking-widest mb-4">Rubro principal *</h3>
 <div className="space-y-2">
 {RUBROS.map(r => (
 <label key={r} className="flex items-center gap-3 cursor-pointer hover:bg-melocoton-50 p-2 rounded-lg">
 <input type="checkbox" checked={form.rubros.includes(r)} onChange={() => toggleCheck('rubros', r)}
 className="w-4 h-4 accent-melocoton-400" />
 <span className="font-sans text-sm text-tierra-700">{r}</span>
 </label>
 ))}
 <label className="flex items-center gap-3 cursor-pointer hover:bg-melocoton-50 p-2 rounded-lg">
 <input type="checkbox" checked={form.rubros.includes('Otros')} onChange={() => toggleCheck('rubros', 'Otros')}
 className="w-4 h-4 accent-melocoton-400" />
 <span className="font-sans text-sm text-tierra-700">Otros:</span>
 <input value={form.rubrosOtro} onChange={e => set('rubrosOtro', e.target.value)}
 className="form-input flex-1 py-1 text-sm" placeholder="Especificá" />
 </label>
 </div>
 </section>

 {/* Destino */}
 <section>
 <h3 className="font-sans text-xs font-bold text-tierra-500 uppercase tracking-widest mb-4">¿Cuál es el destino o uso que planeás darle? *</h3>
 <div className="space-y-2">
 {DESTINOS.map(d => (
 <label key={d} className="flex items-center gap-3 cursor-pointer hover:bg-melocoton-50 p-2 rounded-lg">
 <input type="checkbox" checked={form.destinos.includes(d)} onChange={() => toggleCheck('destinos', d)}
 className="w-4 h-4 accent-melocoton-400" />
 <span className="font-sans text-sm text-tierra-700">{d}</span>
 </label>
 ))}
 <label className="flex items-center gap-3 cursor-pointer hover:bg-melocoton-50 p-2 rounded-lg">
 <input type="checkbox" checked={form.destinos.includes('Otros')} onChange={() => toggleCheck('destinos', 'Otros')}
 className="w-4 h-4 accent-melocoton-400" />
 <span className="font-sans text-sm text-tierra-700">Otros:</span>
 <input value={form.destinosOtro} onChange={e => set('destinosOtro', e.target.value)}
 className="form-input flex-1 py-1 text-sm" placeholder="Especificá" />
 </label>
 </div>
 </section>

 {/* Tipo de venta */}
 <section>
 <h3 className="font-sans text-xs font-bold text-tierra-500 uppercase tracking-widest mb-4">¿Tienen local físico, venta online o ambos? *</h3>
 <div className="space-y-2">
 {['Local físico', 'Venta online', 'Ambas', 'No es para reventa'].map(op => (
 <label key={op} className="flex items-center gap-3 cursor-pointer hover:bg-melocoton-50 p-2 rounded-lg">
 <input type="radio" name="tipoVenta" value={op} checked={form.tipoVenta === op}
 onChange={() => set('tipoVenta', op)} className="w-4 h-4 accent-melocoton-400" />
 <span className="font-sans text-sm text-tierra-700">{op}</span>
 </label>
 ))}
 </div>
 </section>

 {/* Personalización */}
 <section>
 <h3 className="font-sans text-xs font-bold text-tierra-500 uppercase tracking-widest mb-4">¿Querrías personalizar con tu logo la pieza? *</h3>
 <div className="flex gap-6">
 {['Sí', 'No'].map(op => (
 <label key={op} className="flex items-center gap-3 cursor-pointer hover:bg-melocoton-50 p-3 rounded-lg">
 <input type="radio" name="personalizacion" value={op} checked={form.personalizacion === op}
 onChange={() => set('personalizacion', op)} className="w-4 h-4 accent-melocoton-400" />
 <span className="font-sans text-sm text-tierra-700">{op}</span>
 </label>
 ))}
 </div>
 </section>

 {/* Comentarios */}
 <section>
 <label className="form-label">Preguntas y comentarios (opcional)</label>
 <textarea value={form.comentarios} onChange={e => set('comentarios', e.target.value)}
 className="form-input resize-none" rows={4}
 placeholder="¿Hay algo más que quieras comentarnos?" />
 </section>

 {error && (
 <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
 <p className="font-sans text-sm text-red-600">{error}</p>
 </div>
 )}

 <button type="submit" disabled={enviando} className="btn-primary w-full py-4 text-base">
 {enviando
 ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
 : 'Enviar consulta'
 }
 </button>

 <p className="font-sans text-xs text-tierra-400 text-center leading-relaxed">
 Esto no implica ningún compromiso de compra. Te responderemos a la brevedad con toda la información.
 </p>
 </div>
 </form>
 );
}
