import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { obtenerPromociones, crearPromocion } from '@/lib/promociones';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const promociones = await obtenerPromociones();
  return NextResponse.json({ data: promociones });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const datos = await req.json();
  if (!datos.nombre || !datos.porcentaje) {
    return NextResponse.json({ error: 'Nombre y porcentaje son requeridos' }, { status: 400 });
  }
  const promo = await crearPromocion(datos);
  return NextResponse.json({ data: promo }, { status: 201 });
}
