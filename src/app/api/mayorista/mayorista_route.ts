import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMIT_MAYORISTA } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`mayorista:${ip}`, RATE_LIMIT_MAYORISTA.maxAttempts, RATE_LIMIT_MAYORISTA.windowMs, RATE_LIMIT_MAYORISTA.blockMs);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá más tarde.' }, { status: 429 });
    }

    const datos = await req.json();

    const requeridos = ['nombre', 'telefono', 'email', 'empresa', 'ubicacion', 'redesSociales'];
    for (const campo of requeridos) {
      if (!datos[campo]?.trim()) {
        return NextResponse.json({ error: `Campo requerido: ${campo}` }, { status: 400 });
      }
    }

    const consulta = await prisma.consultaMayorista.create({
      data: {
        nombre:          datos.nombre.trim(),
        email:           datos.email.trim().toLowerCase(),
        telefono:        datos.telefono.trim(),
        empresa:         datos.empresa.trim(),
        ubicacion:       datos.ubicacion.trim(),
        redesSociales:   datos.redesSociales.trim(),
        rubros:          datos.rubros ?? [],
        destinos:        datos.destinos ?? [],
        tipoVenta:       datos.tipoVenta ?? null,
        personalizacion: datos.personalizacion ?? null,
        comentarios:     datos.comentarios ?? null,
      },
    });

    console.log('[Mayorista] Nueva consulta:', consulta.id, '-', consulta.empresa);

    await notificarWhatsApp(consulta, datos);

    return NextResponse.json({ ok: true, id: consulta.id });
  } catch (err: any) {
    console.error('[Mayorista]', err);
    return NextResponse.json({ error: 'Error al procesar la consulta' }, { status: 500 });
  }
}

export async function GET() {
  const consultas = await prisma.consultaMayorista.findMany({
    orderBy: { creadoEn: 'desc' },
  });
  return NextResponse.json({ data: consultas });
}

async function notificarWhatsApp(consulta: any, datosForm: any): Promise<void> {
  const phone  = process.env.ADMIN_WHATSAPP ?? process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) { console.log('[Mayorista WA] Sin configurar'); return; }

  const idCorto = consulta.id.slice(-6).toUpperCase();

  // Rubros — incluir opcion "Otros" si fue completada
  const rubrosLista = [
    ...(consulta.rubros ?? []),
    ...(datosForm.rubrosOtro ? [`Otros: ${datosForm.rubrosOtro}`] : []),
  ].join(', ') || 'No especificado';

  // Destinos — incluir opcion "Otros" si fue completada
  const destinosLista = [
    ...(consulta.destinos ?? []),
    ...(datosForm.destinosOtro ? [`Otros: ${datosForm.destinosOtro}`] : []),
  ].join(', ') || 'No especificado';

  const mensaje = [
    `🍑 *CONSULTA MAYORISTA #${idCorto}*`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 *DATOS DEL CONTACTO*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Nombre: *${consulta.nombre}*`,
    `Empresa/Local: *${consulta.empresa}*`,
    `Ubicación: ${consulta.ubicacion}`,
    `Teléfono: ${consulta.telefono}`,
    `Email: ${consulta.email}`,
    `Redes/Web: ${consulta.redesSociales}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *DETALLES DEL NEGOCIO*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Rubro: ${rubrosLista}`,
    `Destino/Uso: ${destinosLista}`,
    `Tipo de venta: ${consulta.tipoVenta ?? 'No especificado'}`,
    `Personalización con logo: ${consulta.personalizacion ?? 'No especificado'}`,
    consulta.comentarios ? `\nComentarios: "${consulta.comentarios}"` : '',
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔗 Ver en admin: ${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? ''}/admin`,
  ].filter(l => l !== null && l !== undefined).join('\n');

  try {
    const res = await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`,
      { signal: AbortSignal.timeout(10_000) }
    );
    console.log(`[Mayorista WA] ${res.ok ? '✓ Enviado' : 'Error'} → #${idCorto}`);
  } catch (err: any) {
    console.error('[Mayorista WA] Error:', err.message);
  }
}
