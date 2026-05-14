import { NextRequest, NextResponse } from 'next/server';
import { obtenerProductos, crearProducto } from '@/lib/productos';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productos = await obtenerProductos({
    categoria: searchParams.get('categoria') as any || undefined,
    destacado: searchParams.get('destacado') ? searchParams.get('destacado') === 'true' : undefined,
    busqueda: searchParams.get('busqueda') || undefined,
  });
  return NextResponse.json({ data: productos });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const datos = await req.json();
  const producto = await crearProducto(datos);
  return NextResponse.json({ data: producto }, { status: 201 });
}