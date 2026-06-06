import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { obtenerPedidoPorId, actualizarEstado, cargarTracking } from '@/lib/pedidos';
import { enviarTrackingCliente } from '@/lib/notificaciones';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();

  if (body.estado) {
    const actualizado = await actualizarEstado(params.id, body.estado);
    if (!actualizado) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ data: actualizado });
  }

  if (body.trackingCorreo) {
    const actualizado = await cargarTracking(params.id, body.trackingCorreo.trim());
    if (!actualizado) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    enviarTrackingCliente(actualizado, body.trackingCorreo.trim()).catch(err =>
      console.error('[Tracking]', err)
    );
    return NextResponse.json({
      data: actualizado,
      mensaje: 'Tracking guardado y cliente notificado',
    });
  }

  return NextResponse.json({ error: 'Enviá estado o trackingCorreo' }, { status: 400 });
}
