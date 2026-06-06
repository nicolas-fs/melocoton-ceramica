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
- Demora de producción: aprox 10 días hábiles (piezas personalizadas: 10-15 días)
- Envíos a todo el país con Correo Argentino. Tiempo: 5-10 días hábiles según zona
- Métodos de pago: Mercado Pago (tarjeta, débito, cuotas) y transferencia bancaria
- Personalizaciones: frases, nombres, fechas, animales (llevan 10-15 días extra)
- Todas las piezas son aptas para lavavajillas y microondas (recomendamos mano)
- Retiro personal en Carlos Paz disponible (coordinar por WhatsApp)
- Regalos corporativos y MAYORISTAS: sí, ver sección /mayorista
- Instagram: @melocoton.ceramica
- WhatsApp disponible para consultas urgentes
- Taller en Villa Carlos Paz, Córdoba (visitas con coordinación previa)

=== INSTRUCCIONES ===
- Si te preguntan por un producto sin stock, ofrecé alternativas similares y sugerí anotar para cuando vuelva
- Si no sabés algo específico (precio de envío exacto a una ciudad, fecha de llegada), derivá a WhatsApp
- Si te preguntan por "lo más vendido" o "recomendás algo", mirá los productos destacados
- Nunca inventes información que no esté en este contexto
- Si alguien quiere comprar, guialo a hacer click en "Agregar al carrito" o ir al catálogo
- Si preguntan por mayoristas o compras en volumen, derivá a /mayorista
- Si preguntan por cuidados de cerámica: aptas para lavavajillas y microondas, recomendamos lavar a mano
- Si preguntan por demora: 10 días producción + 5-10 días envío según zona
- Siempre respondé con calidez y en tono artesanal argentino`;
}

// Respuestas de fallback cuando no hay API key (sin IA)
function fallbackResponse(mensaje: string): string {
  const m = mensaje.toLowerCase();

  // ── Preguntas frecuentes reales ──────────────────────────────────────────
  if (m.includes('demora') || m.includes('cuánto tarda') || m.includes('cuanto tarda') || m.includes('tiempo')) {
    return 'La demora puede variar según la cantidad de pedidos activos, pero en general demoramos 10 días en tener tu pieza lista para despachar. 🤍';
  }
  if (m.includes('pago') || m.includes('cómo pago') || m.includes('como pago') || m.includes('pagar')) {
    return 'Podés pagar a través de Mercado Pago (tarjeta de crédito, débito o efectivo) o por transferencia bancaria. Una vez que iniciás el checkout, ves todas las opciones.';
  }
  if (m.includes('envío') || m.includes('envio') || m.includes('correo') || m.includes('mandás') || m.includes('mandas') || (m.includes('hacen') && m.includes('envío'))) {
    return '¡Sí! Hacemos envíos a todo el país. El costo y método de envío se coordinan según tu ubicación. Trabajamos normalmente con Correo Argentino.';
  }
  if (m.includes('personaliza') || m.includes('personalizada') || m.includes('personalizado') || m.includes('tarda') || m.includes('encargo')) {
    return 'Sí, hacemos piezas personalizadas. Dependiendo del trabajo, demoramos aproximadamente 10 a 15 días. Escribinos por WhatsApp y coordinamos.';
  }
  if (m.includes('cuido') || m.includes('limpio') || m.includes('lavar') || m.includes('lavavajillas') || m.includes('microondas') || m.includes('cuidar')) {
    return 'Todas nuestras piezas son aptas para lavavajillas y microondas, pero te recomendamos lavarlas a mano para que conserven su brillo por más tiempo. 🤍';
  }
  if (m.includes('regalo') || m.includes('enviar a') || m.includes('mandar a') || m.includes('otra persona') || m.includes('dirección')) {
    return '¡Claro que sí! Si querés hacer un regalo, lo empaquetamos especialmente y lo enviamos a la dirección que nos indiques. Dejanos la nota en el checkout.';
  }
  if (m.includes('local') || m.includes('taller') || m.includes('físico') || m.includes('fisico') || m.includes('dónde están') || m.includes('donde estan')) {
    return 'Por ahora trabajamos desde nuestro taller en Villa Carlos Paz. Si estás cerca, coordinamos una visita. Pero hacemos envíos a todo el país.';
  }

  // ── Respuestas genéricas ─────────────────────────────────────────────────
  if (m.includes('precio') || m.includes('cuánto') || m.includes('cuanto') || m.includes('cuesta')) {
    return 'Las tazas arrancan desde $12.500 y los sets desde $22.000. Podés ver todos los precios en el catálogo 🏺';
  }
  if (m.includes('stock') || m.includes('disponible') || m.includes('hay')) {
    return 'Para ver qué hay disponible, te recomiendo mirar el catálogo — ahí está el stock en tiempo real. ¿Algo en particular que estés buscando?';
  }
  if (m.includes('mayorista') || m.includes('mayor') || m.includes('por mayor')) {
    return '¡Sí tenemos precios mayoristas! Ingresá a la sección /mayorista del menú y completá el formulario. Te enviamos toda la info 🍑';
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
