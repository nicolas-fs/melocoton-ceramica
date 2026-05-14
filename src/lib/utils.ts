// ============================================================
// UTILS — Melocotón Cerámica
// ============================================================

// ⚠️  IMPORTANTE: Cambiá este número por el WhatsApp real de Melocotón Cerámica
// Formato: 549 + código de área sin 0 + número sin 15
// Ejemplo Carlos Paz (0354) → 5493542XXXXXXX
export const WHATSAPP_NUMERO = '5493541000000'; // ← CAMBIAR ANTES DE PUBLICAR

export function getLinkWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

export function construirMensajeWhatsApp(nombreProducto?: string): string {
  if (nombreProducto) {
    return `Hola Melocotón Cerámica! Quiero consultar sobre: ${nombreProducto}`;
  }
  return `Hola Melocotón Cerámica! Quiero consultar sobre sus productos.`;
}

export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

export function generarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncarTexto(texto: string, max = 120): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max).trim() + '…';
}

export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function infoEstadoPedido(estado: string) {
  const map: Record<string, { label: string; color: string; bgColor: string }> = {
    pendiente: { label: 'Pendiente', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    pagado:    { label: 'Pagado',    color: 'text-green-700',  bgColor: 'bg-green-100'  },
    enviado:   { label: 'Enviado',   color: 'text-blue-700',   bgColor: 'bg-blue-100'   },
    entregado: { label: 'Entregado', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    cancelado: { label: 'Cancelado', color: 'text-red-700',    bgColor: 'bg-red-100'    },
  };
  return map[estado] ?? { label: estado, color: 'text-gray-700', bgColor: 'bg-gray-100' };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
