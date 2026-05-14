'use client';

// ============================================================
// CHATBOT — Melocotón Cerámica
// Para activarlo: agregá <Chatbot /> en src/app/layout.tsx
// después de <WhatsAppButton />
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, ShoppingBag, MessageCircle } from 'lucide-react';
import { getLinkWhatsApp } from '@/lib/utils';

interface Msg {
  id: string;
  rol: 'user' | 'assistant';
  texto: string;
  timestamp: Date;
}

const PREGUNTAS_RAPIDAS = [
  { label: '¿Cuánto cuesta el envío?', texto: '¿Cuánto cuesta el envío y cuánto tarda?' },
  { label: '¿Hacen personalizaciones?', texto: '¿Pueden hacer piezas personalizadas con una frase o nombre?' },
  { label: '¿Cómo pago?', texto: '¿Qué métodos de pago aceptan?' },
  { label: '¿Qué recomendás para regalo?', texto: 'Quiero comprar un regalo, ¿qué me recomendás?' },
];

let idCounter = 0;
function makeId() { return `msg-${++idCounter}`; }

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: makeId(),
    rol: 'assistant',
    texto: '¡Hola! Soy la asistente de Melocotón Cerámica ✨ Puedo ayudarte con precios, envíos, personalizaciones y más. ¿En qué te puedo ayudar?',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPreguntas, setMostrarPreguntas] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 100);
  }, [abierto]);

  async function enviar(texto: string) {
    if (!texto.trim() || cargando) return;
    setMostrarPreguntas(false);

    const msgUsuario: Msg = { id: makeId(), rol: 'user', texto, timestamp: new Date() };
    setMsgs(prev => [...prev, msgUsuario]);
    setInput('');
    setCargando(true);

    try {
      // Construir historial para la API
      const historial = [...msgs, msgUsuario]
        .filter(m => m.rol === 'user' || m.rol === 'assistant')
        .map(m => ({ role: m.rol === 'user' ? 'user' : 'assistant', content: m.texto }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: historial }),
      });

      const data = await res.json();
      setMsgs(prev => [...prev, {
        id: makeId(),
        rol: 'assistant',
        texto: data.respuesta || 'No pude generar una respuesta.',
        timestamp: new Date(),
      }]);
    } catch {
      setMsgs(prev => [...prev, {
        id: makeId(),
        rol: 'assistant',
        texto: 'Ups, tuve un problema. Escribinos por WhatsApp y te ayudamos enseguida 📱',
        timestamp: new Date(),
      }]);
    } finally {
      setCargando(false);
    }
  }

  function formatHora(d: Date) {
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      {/* Botón para abrir */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2.5 pl-4 pr-5 py-3
                     rounded-full bg-tierra-900 text-white shadow-xl
                     hover:bg-tierra-800 active:scale-95 transition-all duration-200
                     font-sans text-sm font-medium border border-tierra-700"
          aria-label="Abrir chat de ayuda"
        >
          <MessageCircle className="w-4 h-4 text-melocoton-300" />
          ¿Tenés dudas?
        </button>
      )}

      {/* Panel del chat */}
      {abierto && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col
                     w-[calc(100vw-2rem)] max-w-sm sm:max-w-[380px]
                     bg-white rounded-2xl shadow-2xl border border-melocoton-100 overflow-hidden"
          style={{ maxHeight: 'min(540px, calc(100vh - 100px))' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-tierra-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-melocoton-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold leading-none">Melocotón Cerámica</p>
                <p className="font-sans text-xs text-tierra-300 mt-0.5 leading-none">Asistente virtual • Responde al instante</p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-tierra-700 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Mensajes ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-gradient-to-b from-melocoton-50/40 to-white">
            {msgs.map(msg => (
              <div key={msg.id} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.rol === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-melocoton-400 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm font-sans leading-relaxed
                    ${msg.rol === 'user'
                      ? 'bg-melocoton-400 text-white rounded-tr-sm'
                      : 'bg-white text-tierra-800 shadow-sm border border-melocoton-100 rounded-tl-sm'
                    }`}>
                    {msg.texto}
                  </div>
                  <p className={`text-[10px] text-tierra-400 mt-1 font-sans ${msg.rol === 'user' ? 'text-right' : 'text-left ml-1'}`}>
                    {formatHora(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de escribiendo */}
            {cargando && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-melocoton-400 flex items-center justify-center flex-shrink-0 mr-2">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-melocoton-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-melocoton-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-melocoton-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-melocoton-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Preguntas rápidas ── */}
          {mostrarPreguntas && !cargando && (
            <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-melocoton-100 flex-shrink-0 bg-white">
              {PREGUNTAS_RAPIDAS.map(p => (
                <button
                  key={p.label}
                  onClick={() => enviar(p.texto)}
                  className="text-xs px-2.5 py-1 rounded-full bg-melocoton-50 text-melocoton-700
                             border border-melocoton-200 hover:bg-melocoton-100
                             transition-colors font-sans leading-snug"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <div className="px-3 py-3 border-t border-melocoton-100 flex gap-2 flex-shrink-0 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(input); } }}
              placeholder="Escribí tu pregunta..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-melocoton-200 text-sm font-sans
                         focus:outline-none focus:ring-2 focus:ring-melocoton-300 focus:border-melocoton-400
                         bg-melocoton-50/50 text-tierra-900 placeholder:text-tierra-400 transition-all"
              disabled={cargando}
              maxLength={500}
            />
            <button
              onClick={() => enviar(input)}
              disabled={cargando || !input.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-melocoton-400 text-white
                         hover:bg-melocoton-500 disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-95 transition-all flex-shrink-0"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* ── Footer con link a WhatsApp ── */}
          <div className="px-4 py-2 border-t border-melocoton-100 bg-melocoton-50/50 flex-shrink-0">
            <a
              href={getLinkWhatsApp('Hola Melocotón Cerámica! Quiero hacer una consulta.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-tierra-500 hover:text-[#25D366] transition-colors font-sans py-0.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              También podés escribirnos por WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
