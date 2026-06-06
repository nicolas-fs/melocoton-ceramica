import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { setStock } from '@/lib/productos';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id, stock } = await req.json();
    if (!id || typeof stock !== 'number' || stock < 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const resultado = await setStock(id, stock);
    if (!resultado.ok) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    return NextResponse.json({ data: { stock: resultado.stockActual } });
  } catch (err: any) {
    console.error('[Stock]', err);
    return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 500 });
  }
}
