import { NextRequest, NextResponse } from 'next/server';
import { obtenerPedidos } from '@/lib/pedidos';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const pedidos = await obtenerPedidos();
  return NextResponse.json({ data: pedidos });
}
