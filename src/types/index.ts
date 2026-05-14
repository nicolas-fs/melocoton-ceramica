// ============================================================
// TIPOS — Melocotón Cerámica
// ============================================================

export type Categoria =
  | 'tazas' | 'tazones' | 'platos'
  | 'macetas' | 'bowls' | 'sets' | 'especial';

export type EstadoPedido =
  | 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';

export type MetodoPago = 'mercadopago' | 'transferencia';

// ── PRODUCTO ──────────────────────────────────────────────
export interface Producto {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  descripcionCorta: string;
  precio: number;
  precioOriginal?: number;       // precio antes del descuento
  enPromocion?: boolean;
  descuentoPorcentaje?: number;  // ej: 20 = 20% off
  imagenes: string[];
  stock: number;
  categoria: Categoria;
  destacado: boolean;
  etiquetas?: string[];
  creadoEn: string;
  actualizadoEn: string;
}

// ── CARRITO ───────────────────────────────────────────────
export interface ItemCarrito {
  productoId: string;
  titulo: string;
  slug: string;
  imagen: string;
  precio: number;
  cantidad: number;
}

// ── CLIENTE ───────────────────────────────────────────────
export interface DatosCliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  notas?: string;
}

// ── PEDIDO ────────────────────────────────────────────────
export interface Pedido {
  id: string;
  fecha: string;
  cliente: DatosCliente;
  items: Array<{
    productoId: string;
    titulo: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  subtotal: number;
  costoEnvio: number;
  opcionEnvio?: string;       // nombre legible, ej: "Correo Argentino Prioritario"
  total: number;
  estado: EstadoPedido;
  metodoPago: MetodoPago;
  idTransaccionMP?: string;
  idPreferenciaMP?: string;
}

// ── PROMOCIÓN ─────────────────────────────────────────────
export interface Promocion {
  id: string;
  nombre: string;           // "Promo Verano 20% off"
  porcentaje: number;       // 20
  productosIds: string[];   // vacío = todos
  activa: boolean;
  fechaInicio: string;
  fechaFin?: string;
  creadoEn: string;
}

// ── CONTEXTO CARRITO ──────────────────────────────────────
export interface CarritoContextType {
  items: ItemCarrito[];
  agregarItem: (producto: Producto, cantidad?: number) => void;
  quitarItem: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  total: number;
  subtotal: number;
  cantidadTotal: number;
  estaAbierto: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
}

// ── CHAT ──────────────────────────────────────────────────
export interface MensajeChat {
  role: 'user' | 'assistant';
  content: string;
}
