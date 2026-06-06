'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/context/CarritoContext';
import { formatearPrecio } from '@/lib/utils';
import { OpcionEnvio } from '@/lib/envios';
import { DatosCliente, MetodoPago } from '@/types';
import SelectorEnvio from './SelectorEnvio';
import toast from 'react-hot-toast';
import { CreditCard, Building2, ChevronDown, Truck } from 'lucide-react';

const PROVINCIAS = [
 'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba',
 'Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja',
 'Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan',
 'San Luis','Santa Cruz','Santa Fe','Santiago del Estero',
 'Tierra del Fuego','Tucumán',
];

const initDatos: DatosCliente = {
 nombre: '', email: '', telefono: '',
 direccion: '', ciudad: '', provincia: 'Córdoba',
 codigoPostal: '', notas: '',
};

export default function CheckoutForm() {
 const { items, subtotal, vaciarCarrito } = useCarrito();
 const router = useRouter();

 const [datos, setDatos] = useState<DatosCliente>(initDatos);
 const [metodo, setMetodo] = useState<MetodoPago>('mercadopago');
 const [envio, setEnvio] = useState<OpcionEnvio | null>(null);
 const [cargando, setCargando] = useState(false);
 const [errores, setErrores] = useState<Record<string, string>>({});

 const costoEnvio = envio?.precio ?? 0;
 const total = subtotal + costoEnvio;

 // CAMBIO 4 FIX: función de actualización sin recrear componentes
 const set = (campo: keyof DatosCliente, valor: string) => {
 setDatos(prev => ({ ...prev, [campo]: valor }));
 if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: '' }));
 };

 function validar(): boolean {
 const e: Record<string, string> = {};
 if (!datos.nombre.trim()) e.nombre = 'Requerido';
 if (!datos.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email inválido';
 if (!datos.telefono.trim()) e.telefono = 'Requerido';
 if (!datos.direccion.trim()) e.direccion = 'Requerido';
 if (!datos.ciudad.trim()) e.ciudad = 'Requerido';
 if (!datos.codigoPostal.trim()) e.codigoPostal = 'Requerido';
 if (!envio) e.envio = 'Elegí una opción de envío';
 setErrores(e);
 return Object.keys(e).length === 0;
 }

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!validar()) { toast.error('Completá todos los campos requeridos'); return; }
 if (items.length === 0) { toast.error('Tu carrito está vacío'); return; }

 setCargando(true);
 try {
 const res = await fetch('/api/checkout', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 cliente: datos,
 items,
 metodoPago: metodo,
 subtotal,
 costoEnvio,
 total,
 opcionEnvio: envio?.nombre,
 }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido');

 if (metodo === 'mercadopago' && data.urlPago) {
 window.location.href = data.urlPago;
 } else {
 vaciarCarrito();
 router.push(`/checkout/confirmacion?pedidoId=${data.pedidoId}&metodo=transferencia`);
 }
 } catch (err: any) {
 toast.error(err.message || 'Hubo un problema. Escribinos por WhatsApp.');
 } finally {
 setCargando(false);
 }
 }

 if (items.length === 0) {
 return (
 <div className="text-center py-20">
 <p className="text-2xl text-tierra-600 mb-6">Tu carrito está vacío.</p>
 <Link href="/catalogo" className="btn-primary">Ver catálogo</Link>
 </div>
 );
 }

 // CAMBIO 4 FIX: El bug era que Campo estaba definido DENTRO del componente.
 // Cada render recreaba el componente Campo como función nueva, lo que hacía
 // que React lo desmontara y remontara, perdiendo el foco del input.
 // Solución: expandir los inputs directamente en el JSX (sin sub-componente).

 return (
 <form onSubmit={handleSubmit} noValidate>
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

 {/* ── Columna izquierda ── */}
 <div className="lg:col-span-3 space-y-6">

 {/* 1. Datos personales */}
 <section className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 space-y-4">
 <h2 className="text-xl text-tierra-900 font-semibold">1. Tus datos</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

 {/* Nombre — inline para evitar re-mount */}
 <div className="sm:col-span-2">
 <label className="form-label">Nombre y apellido *</label>
 <input
 value={datos.nombre}
 onChange={e => set('nombre', e.target.value)}
 className={`form-input ${errores.nombre ? 'border-red-400' : ''}`}
 placeholder="María García"
 autoComplete="name"
 />
 {errores.nombre && <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>}
 </div>

 {/* Email */}
 <div>
 <label className="form-label">Email *</label>
 <input
 type="email"
 value={datos.email}
 onChange={e => set('email', e.target.value)}
 className={`form-input ${errores.email ? 'border-red-400' : ''}`}
 placeholder="maria@mail.com"
 autoComplete="email"
 />
 {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
 </div>

 {/* Teléfono */}
 <div>
 <label className="form-label">Teléfono / WhatsApp *</label>
 <input
 type="tel"
 value={datos.telefono}
 onChange={e => set('telefono', e.target.value)}
 className={`form-input ${errores.telefono ? 'border-red-400' : ''}`}
 placeholder="+54 9 354 000-0000"
 autoComplete="tel"
 />
 {errores.telefono && <p className="text-xs text-red-500 mt-1">{errores.telefono}</p>}
 </div>
 </div>
 </section>

 {/* 2. Dirección de envío */}
 <section className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 space-y-4">
 <h2 className="text-xl text-tierra-900 font-semibold">2. Dirección de envío</h2>

 {/* Calle */}
 <div>
 <label className="form-label">Calle y número *</label>
 <input
 value={datos.direccion}
 onChange={e => set('direccion', e.target.value)}
 className={`form-input ${errores.direccion ? 'border-red-400' : ''}`}
 placeholder="San Martín 1234"
 autoComplete="street-address"
 />
 {errores.direccion && <p className="text-xs text-red-500 mt-1">{errores.direccion}</p>}
 </div>

 <div className="grid grid-cols-3 gap-4">
 {/* CP */}
 <div>
 <label className="form-label">Código Postal *</label>
 <input
 value={datos.codigoPostal}
 onChange={e => set('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 8))}
 className={`form-input ${errores.codigoPostal ? 'border-red-400' : ''}`}
 placeholder="5152"
 maxLength={8}
 inputMode="numeric"
 />
 {errores.codigoPostal && <p className="text-xs text-red-500 mt-1">{errores.codigoPostal}</p>}
 </div>

 {/* Ciudad */}
 <div>
 <label className="form-label">Ciudad *</label>
 <input
 value={datos.ciudad}
 onChange={e => set('ciudad', e.target.value)}
 className={`form-input ${errores.ciudad ? 'border-red-400' : ''}`}
 placeholder="Carlos Paz"
 autoComplete="address-level2"
 />
 {errores.ciudad && <p className="text-xs text-red-500 mt-1">{errores.ciudad}</p>}
 </div>

 {/* Provincia */}
 <div>
 <label className="form-label">Provincia *</label>
 <div className="relative">
 <select
 value={datos.provincia}
 onChange={e => set('provincia', e.target.value)}
 className="form-input appearance-none pr-8"
 >
 {PROVINCIAS.map(p =><option key={p}>{p}</option>)}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tierra-400 pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Notas */}
 <div>
 <label className="form-label">Notas para el paquete (opcional)</label>
 <textarea
 value={datos.notas || ''}
 onChange={e => set('notas', e.target.value)}
 className="form-input resize-none"
 rows={2}
 placeholder="¿Va como regalo? ¿Dirección alternativa? ¿Alguna aclaración?"
 />
 </div>
 </section>

 {/* 3. Opción de envío */}
 <section className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 space-y-4">
 <div className="flex items-center gap-2">
 <Truck className="w-5 h-5 text-melocoton-500" />
 <h2 className="text-xl text-tierra-900 font-semibold">3. Opción de envío</h2>
 </div>

 <SelectorEnvio
 codigoPostal={datos.codigoPostal}
 ciudad={datos.ciudad}
 provincia={datos.provincia}
 onChange={setEnvio}
 />

 {errores.envio && (
 <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
 {errores.envio}
 </p>
 )}
 </section>

 {/* 4. Método de pago */}
 <section className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 space-y-4">
 <h2 className="text-xl text-tierra-900 font-semibold">4. Método de pago</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[
 {
 id: 'mercadopago' as MetodoPago,
 icon: <CreditCard className="w-5 h-5 text-[#009EE3]" />,
 titulo: 'Mercado Pago',
 desc: 'Tarjeta de crédito/débito. Cuotas disponibles.',
 },
 {
 id: 'transferencia' as MetodoPago,
 icon: <Building2 className="w-5 h-5 text-tierra-600" />,
 titulo: 'Transferencia bancaria',
 desc: 'Te enviamos el CBU por WhatsApp. Sin comisiones.',
 },
 ].map(op => (
 <button
 key={op.id}
 type="button"
 onClick={() => setMetodo(op.id)}
 className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all ${
 metodo === op.id
 ? 'border-melocoton-500 bg-melocoton-50'
 : 'border-tierra-200 hover:border-melocoton-300'
 }`}
 >
 <div className="flex items-center gap-2">
 {op.icon}
 <span className="font-semibold text-tierra-900 text-sm">{op.titulo}</span>
 </div>
 <p className="text-xs text-tierra-500">{op.desc}</p>
 {metodo === op.id && <span className="text-xs text-melocoton-600 font-medium">Seleccionado</span>}
 </button>
 ))}
 </div>
 </section>
 </div>

 {/* ── Resumen del pedido ── */}
 <aside className="lg:col-span-2">
 <div className="bg-white rounded-2xl p-6 shadow-sm border border-melocoton-100 sticky top-24 space-y-5">
 <h2 className="text-xl text-tierra-900 font-semibold">Tu pedido</h2>

 {/* Items */}
 <ul className="space-y-3">
 {items.map(item => (
 <li key={item.productoId} className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-melocoton-50">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={item.imagen || '/images/productos/taza-1.svg'}
 alt={item.titulo}
 className="w-full h-full object-cover"
 referrerPolicy="no-referrer"
 onError={e => { (e.target as HTMLImageElement).src = '/images/productos/taza-1.svg'; }}
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs text-tierra-800 truncate leading-snug">{item.titulo}</p>
 <p className="text-xs text-tierra-400">x{item.cantidad}</p>
 </div>
 <p className="text-sm font-medium text-tierra-900 flex-shrink-0">
 {formatearPrecio(item.precio * item.cantidad)}
 </p>
 </li>
 ))}
 </ul>

 {/* Totales */}
 <div className="border-t border-tierra-200 pt-4 space-y-2 text-sm">
 <div className="flex justify-between text-tierra-600">
 <span>Subtotal</span>
 <span>{formatearPrecio(subtotal)}</span>
 </div>
 <div className="flex justify-between text-tierra-600">
 <span>Envío {envio ? `· ${envio.nombre}` : ''}</span>
 <span className={costoEnvio === 0 ? 'text-green-600 font-medium' : ''}>
 {envio ? (costoEnvio === 0 ? 'Gratis' : formatearPrecio(costoEnvio)) : '—'}
 </span>
 </div>
 <div className="flex justify-between font-semibold text-tierra-900 text-base pt-3 border-t border-tierra-200">
 <span>Total</span>
 <span className="text-xl">{formatearPrecio(total)}</span>
 </div>
 </div>

 <button
 type="submit"
 disabled={cargando || !envio}
 className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
 >
 {cargando
 ? <span className="flex items-center justify-center gap-2">
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Procesando...
 </span>
 : metodo === 'mercadopago'
 ? 'Pagar con Mercado Pago'
 : 'Confirmar pedido'
 }
 </button>

 {!envio && datos.codigoPostal.length >= 4 && (
 <p className="text-xs text-amber-600 text-center">
 Elegí una opción de envío para continuar
 </p>
 )}

 <p className="text-xs text-tierra-400 text-center">
 Al confirmar aceptás que te contactemos para coordinar el envío.
 </p>
 </div>
 </aside>
 </div>
 </form>
 );
}
