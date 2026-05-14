import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { togglePromocion, eliminarPromocion } from '@/lib/promociones';

// PATCH /api/promociones/[id] → activar/desactivar
export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const promo = await togglePromocion(params.id);
  if (!promo) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ data: promo });
}

// DELETE /api/promociones/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const ok = await eliminarPromocion(params.id);
  if (!ok) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ mensaje: 'Promoción eliminada' });
}
