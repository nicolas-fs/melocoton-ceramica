import { NextRequest, NextResponse } from 'next/server';
import { obtenerProductos } from '@/lib/productos';

// ============================================================
// CHATBOT CON IA — Melocotón Cerámica
// Motor: Claude Haiku (el más económico — ~$0.04 por 1M tokens)
// Costo estimado: menos de $1 USD/mes con tráfico normal
//
// Para activar: ANTHROPIC_API_KEY=sk-ant-... en .env.local
// Si no hay key configurada, el bot igual responde con info
// básica sin IA (modo fallback)
// ============================================================

function buildSystemPrompt(productos: any[]): string {
  // Construir lista de productos disponibles para que el bot los conozca
  const disponibles = productos
    .filter(p => p.stock > 0)
    .map(p => {
      const precio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p.precio);
      const promo = p.enPromocion ? ` (${p.descuentoPorcentaje}% OFF, antes ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p.precioOriginal!)})` : '';
      return `- ${p.titulo}: ${precio}${promo}, stock: ${p.stock}, categoría: ${p.categoria}`;
    })
    .join('\n');

  const agotados = productos
    .filter(p => p.stock === 0)
    .map(p => `- ${p.titulo}`)
    .join('\n');

  return `Sos la asistente virtual de Melocotón Cerámica, una marca de cerámica artesanal hecha a mano en Villa Carlos Paz, Córdoba, Argentina.

Tu tono es cálido, cercano y con encanto argentino. Usás "vos" (nunca "tú"). Respondés en máximo 3-4 oraciones, de forma directa y amable.

=== PRODUCTOS DISPONIBLES HOY ===
${disponibles || 'Consultá por WhatsApp para ver disponibilidad'}

=== PRODUCTOS SIN STOCK ===
${agotados || 'Todos los productos tienen stock'}

=== INFO DE LA TIENDA ===
- Envíos a todo el país. Costo aprox $3.500. Tiempo: 5-10 días hábiles
- Métodos de pago: Mercado Pago (tarjeta, cuotas) y transferencia bancaria
- Personalizaciones: frases, nombres, fechas (consultar antes, lleva 5-7 días extra)
- Retiro personal en Carlos Paz disponible (coordinar por WhatsApp)
- Regalos corporativos: sí, consultar por cantidad
- Instagram: @melocoton.ceramica
- WhatsApp disponible para consultas urgentes

=== INSTRUCCIONES ===
- Si te preguntan por un producto sin stock, ofrecé alternativas similares y sugerí anotar para cuando vuelva
- Si no sabés algo específico (precio de envío exacto a una ciudad, fecha de llegada), derivá a WhatsApp
- Si te preguntan por "lo más vendido" o "recomendás algo", mirá los productos destacados
- Nunca inventes información que no esté en este contexto
- Si alguien quiere comprar, guialo a hacer click en "Agregar al carrito" o ir al catálogo`;
}

// Respuestas de fallback cuando no hay API key (sin IA)
function fallbackResponse(mensaje: string): string {
  const m = mensaje.toLowerCase();

  if (m.includes('precio') || m.includes('cuánto') || m.includes('cuanto') || m.includes('cuesta')) {
    return 'Las tazas arrancan desde $12.500 y los sets desde $22.000. Podés ver todos los precios en el catálogo 🏺';
  }
  if (m.includes('envío') || m.includes('envio') || m.includes('llega') || m.includes('manda')) {
    return 'Enviamos a todo el país! El costo es aprox $3.500 y tarda entre 5 y 10 días hábiles según dónde estés 📦';
  }
  if (m.includes('pago') || m.includes('tarjeta') || m.includes('mercado') || m.includes('transferencia')) {
    return 'Aceptamos Mercado Pago (con cuotas) y transferencia bancaria. Elegís el método en el checkout 💳';
  }
  if (m.includes('personaliz') || m.includes('frase') || m.includes('nombre')) {
    return 'Sí, hacemos personalizaciones con tu frase, nombre o fecha especial! Llevá 5-7 días extra. Escribinos por WhatsApp para coordinar ✨';
  }
  if (m.includes('stock') || m.includes('disponible') || m.includes('hay')) {
    return 'Para ver qué hay disponible, te recomiendo mirar el catálogo — ahí está el stock en tiempo real. ¿Algo en particular que estés buscando?';
  }
  if (m.includes('regalo') || m.includes('regalar')) {
    return 'Son el regalo perfecto! Vienen envueltos con papel de seda y tarjeta personalizada sin cargo. Los sets son los más regalados 🎁';
  }
  if (m.includes('retiro') || m.includes('retirar') || m.includes('carlos paz')) {
    return 'Sí, podés retirar en Villa Carlos Paz coordinando por WhatsApp. ¡Así ahorrás el envío!';
  }

  return '¡Hola! Para consultas específicas podés escribirnos por WhatsApp o revisar el catálogo. ¿En qué te puedo ayudar?';
}

export async function POST(req: NextRequest) {
  try {
    const { mensajes } = await req.json() as { mensajes: Array<{ role: string; content: string }> };

    if (!mensajes || mensajes.length === 0) {
      return NextResponse.json({ error: 'Sin mensajes' }, { status: 400 });
    }

    const ultimoMensaje = mensajes[mensajes.length - 1]?.content || '';

    // Si no hay API key, usar respuestas de fallback
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const respuesta = fallbackResponse(ultimoMensaje);
      return NextResponse.json({ respuesta });
    }

    // Obtener productos actuales para darle contexto al bot
    const productos = await obtenerProductos();
    const systemPrompt = buildSystemPrompt(productos);

    // Llamar a la API de Anthropic
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // el más económico
        max_tokens: 400,
        system: systemPrompt,
        messages: mensajes.slice(-12).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Chat API] Anthropic error:', err);
      // Fallback a respuesta simple si falla la API
      return NextResponse.json({ respuesta: fallbackResponse(ultimoMensaje) });
    }

    const data = await res.json();
    const respuesta = data.content?.[0]?.text ?? fallbackResponse(ultimoMensaje);

    return NextResponse.json({ respuesta });

  } catch (err: any) {
    console.error('[Chat API] Error:', err.message);
    return NextResponse.json({
      respuesta: 'Ups, tuve un problema técnico. Escribinos por WhatsApp y te ayudamos enseguida 📱',
    });
  }
}
