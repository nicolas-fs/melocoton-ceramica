'use client';

import { useState, useEffect, useRef } from 'react';
import { OpcionEnvio, textoEntrega, formatearPrecioEnvio } from '@/lib/envios';
import { Loader2, PackageCheck, Clock, MapPin } from 'lucide-react';

interface Props {
  codigoPostal: string;
  ciudad:       string;
  provincia:    string;
  onChange:     (opcion: OpcionEnvio | null) => void;
}

export default function SelectorEnvio({ codigoPostal, ciudad, provincia, onChange }: Props) {
  const [opciones, setOpciones]       = useState<OpcionEnvio[]>([]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando]       = useState(false);
  const [error, setError]             = useState('');
  const debounceRef                   = useRef<ReturnType<typeof setTimeout>>();

  // Cotizar automáticamente cuando cambian los datos de destino
  useEffect(() => {
    if (!codigoPostal || codigoPostal.length < 4 || !ciudad || !provincia) {
      setOpciones([]);
      setSeleccionado(null);
      onChange(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCargando(true);
      setError('');
      try {
        const res = await fetch('/api/envios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigoPostal, ciudad, provincia }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOpciones(data.data);
        // Preseleccionar la opción más barata (primera tras retiro)
        const primera = data.data.find((o: OpcionEnvio) => !o.gratis) ?? data.data[0];
        if (primera) {
          setSeleccionado(primera.id);
          onChange(primera);
        }
      } catch {
        setError('No pudimos calcular el envío. Igual podés confirmar el pedido.');
      } finally {
        setCargando(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [codigoPostal, ciudad, provincia]);

  function elegir(opcion: OpcionEnvio) {
    setSeleccionado(opcion.id);
    onChange(opcion);
  }

  // No mostrar nada hasta tener CP completo
  if (!codigoPostal || codigoPostal.length < 4) {
    return (
      <div className="flex items-center gap-2 text-tierra-400 font-sans text-sm py-2">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        Completá tu código postal para ver las opciones de envío
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-tierra-500 font-sans text-sm py-3">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        Calculando opciones de envío para {ciudad || codigoPostal}...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-amber-600 font-sans text-sm bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
        ⚠️ {error}
      </p>
    );
  }

  if (opciones.length === 0) return null;

  return (
    <div className="space-y-2">
      {opciones.map(op => {
        const activo = seleccionado === op.id;
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => elegir(op)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
              activo
                ? 'border-melocoton-400 bg-melocoton-50'
                : 'border-gray-200 bg-white hover:border-melocoton-200 hover:bg-melocoton-50/30'
            }`}
          >
            {/* Radio indicator */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              activo ? 'border-melocoton-500 bg-melocoton-500' : 'border-gray-300'
            }`}>
              {activo && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            {/* Ícono del servicio */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
              op.id === 'retiro' ? 'bg-tierra-100' : 'bg-blue-50'
            }`}>
              {op.id === 'retiro' ? '🏠' : '📬'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-sans font-semibold text-sm text-tierra-900">{op.nombre}</p>
              <p className="font-sans text-xs text-tierra-500 mt-0.5">{op.descripcion}</p>
              {op.nota && (
                <p className="font-sans text-xs text-melocoton-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {op.nota}
                </p>
              )}
              <p className="font-sans text-xs text-tierra-400 mt-1 flex items-center gap-1">
                <PackageCheck className="w-3 h-3" />
                {textoEntrega(op.diasMin, op.diasMax)}
                {op.seguimiento && ' · con seguimiento'}
              </p>
            </div>

            {/* Precio */}
            <div className="text-right flex-shrink-0">
              <p className={`font-serif text-base font-medium ${
                op.gratis ? 'text-green-600' : 'text-tierra-900'
              }`}>
                {formatearPrecioEnvio(op.precio)}
              </p>
              {op.gratis && (
                <span className="font-sans text-xs text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full">
                  Sin cargo
                </span>
              )}
            </div>
          </button>
        );
      })}

      <p className="font-sans text-xs text-tierra-400 pt-1 px-1">
        📦 Tarifas estimadas de Correo Argentino. El costo final puede variar según el peso del paquete.
      </p>
    </div>
  );
}
