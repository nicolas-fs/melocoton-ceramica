import { NextRequest, NextResponse } from 'next/server';
import { obtenerProductoPorId, actualizarProducto, eliminarProducto } from '@/lib/productos';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const p = await obtenerProductoPorId(params.id);
  if (!p) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ data: p });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const datos = await req.json();
  const p = await actualizarProducto(params.id, datos);
  if (!p) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ data: p });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const ok = await eliminarProducto(params.id);
  if (!ok) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ mensaje: 'Eliminado' });
}