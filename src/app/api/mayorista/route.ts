import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMIT_MAYORISTA } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // HAL-04: Rate limiting
    const ip = getClientIp(req);
    const rl = checkRateLimit(`mayorista:${ip}`, RATE_LIMIT_MAYORISTA.maxAttempts, RATE_LIMIT_MAYORISTA.windowMs, RATE_LIMIT_MAYORISTA.blockMs);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intentá más tarde.' }, { status: 429 });
    }

    const datos = await req.json();

    // Validar campos obligatorios
    const requeridos = ['nombre', 'telefono', 'email', 'empresa', 'ubicacion', 'redesSociales'];
    for (const campo of requeridos) {
      if (!datos[campo]?.trim()) {
        return NextResponse.json({ error: `Campo requerido: ${campo}` }, { status: 400 });
      }
    }

    // Guardar en base de datos
    const consulta = await prisma.consultaMayorista.create({
      data: {
        nombre:         datos.nombre.trim(),
        email:          datos.email.trim().toLowerCase(),
        telefono:       datos.telefono.trim(),
        empresa:        datos.empresa.trim(),
        ubicacion:      datos.ubicacion.trim(),
        redesSociales:  datos.redesSociales.trim(),
        rubros:         datos.rubros ?? [],
        destinos:       datos.destinos ?? [],
        tipoVenta:      datos.tipoVenta ?? null,
        personalizacion: datos.personalizacion ?? null,
        comentarios:    datos.comentarios ?? null,
      },
    });

    console.log('[Mayorista] Nueva consulta:', consulta.id, '-', consulta.empresa);

    // Notificar por WhatsApp
    await notificarWhatsApp(consulta);

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

async function notificarWhatsApp(consulta: any): Promise<void> {
  const phone  = process.env.ADMIN_WHATSAPP ?? process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) { console.log('[Mayorista WA] Sin configurar'); return; }

  const mensaje = [
    `Nueva consulta mayorista #${consulta.id.slice(-6)}`,
    `${consulta.nombre} — ${consulta.empresa}`,
    `${consulta.ubicacion}`,
    `${consulta.telefono}`,
    `${consulta.email}`,
  ].join('\n');

  try {
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${apikey}`,
      { signal: AbortSignal.timeout(10_000) });
  } catch {}
}
