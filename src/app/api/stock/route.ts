import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { setStock, actualizarStock } from '@/lib/productos';

// POST /api/stock
// Body: { id, stock } para setear valor absoluto
// Body: { id, delta } para sumar/restar (ej: delta: -2 para descontar 2)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id, stock, delta } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  let resultado;
  if (typeof stock === 'number') {
    resultado = await setStock(id, stock);
  } else if (typeof delta === 'number') {
    resultado = await actualizarStock(id, delta);
  } else {
    return NextResponse.json({ error: 'stock o delta requerido' }, { status: 400 });
  }

  return NextResponse.json({ data: resultado });
}
