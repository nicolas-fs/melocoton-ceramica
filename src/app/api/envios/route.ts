import { NextRequest, NextResponse } from 'next/server';
import { cotizarEnvio } from '@/lib/envios';

export async function POST(req: NextRequest) {
  try {
    const { codigoPostal, ciudad, provincia, pesoKg } = await req.json();

    if (!codigoPostal?.trim() || !ciudad?.trim() || !provincia?.trim()) {
      return NextResponse.json({ error: 'Faltan datos de destino' }, { status: 400 });
    }

    const opciones = await cotizarEnvio({ codigoPostal, ciudad, provincia, pesoKg });
    return NextResponse.json({ data: opciones });
  } catch (err: any) {
    console.error('[API /envios]', err);
    return NextResponse.json({ error: 'Error al cotizar envío' }, { status: 500 });
  }
}
