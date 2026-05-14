// ============================================================
// SISTEMA DE ENVÍOS — Melocotón Cerámica
// Transportista único: Correo Argentino
// Origen: Villa Carlos Paz, Córdoba (CP 5152)
//
// Tarifas aproximadas vigentes Abril 2026.
// Actualizá TARIFAS cada 2-3 meses.
// Fuente oficial: https://www.correoargentino.com.ar/tarifas
// ============================================================

export interface DatosEnvio {
  codigoPostal: string;
  ciudad:       string;
  provincia:    string;
  pesoKg?:      number; // default 0.5 kg (taza individual)
}

export interface OpcionEnvio {
  id:          string;
  nombre:      string;
  descripcion: string;
  precio:      number;  // ARS
  diasMin:     number;
  diasMax:     number;
  seguimiento: boolean;
  gratis:      boolean;
  nota?:       string;
}

// ── ZONAS ─────────────────────────────────────────────────
// Zona local: Valle de Punilla y Capital Córdoba
function esLocal(cp: string, ciudad: string): boolean {
  const n = parseInt(cp, 10);
  const c = ciudad.toLowerCase();
  return (
    (n >= 5000 && n <= 5009) || // Ciudad de Córdoba
    (n >= 5150 && n <= 5196) || // Valle de Punilla (Carlos Paz, Cosquín, La Falda…)
    c.includes('carlos paz') ||
    c.includes('cosquín') ||
    c.includes('la falda') ||
    c.includes('tanti') ||
    c.includes('icho cruz') ||
    c.includes('bialet') ||
    c.includes('córdoba') ||
    c.includes('cordoba')
  );
}

function esProvinciaCordoba(provincia: string): boolean {
  return provincia.toLowerCase().includes('córdoba') ||
         provincia.toLowerCase().includes('cordoba');
}

function esGBA(cp: string): boolean {
  const n = parseInt(cp, 10);
  return (n >= 1000 && n <= 1999) || (n >= 1400 && n <= 1499);
}

// ── TARIFAS CORREO ARGENTINO (ARS, Abril 2026) ────────────
// Basadas en servicio "Encomienda Clásica" y "Encomienda Prioritaria"
// Peso promedio caja cerámica: 0.5–1.5 kg
const TARIFAS = {
  local: {
    clasico:    3200,
    prioritario:4100,
  },
  cordoba: {
    clasico:    4200,
    prioritario:5400,
  },
  gba: {
    clasico:    6800,
    prioritario:8500,
  },
  nacional: {
    clasico:    7200,
    prioritario:9000,
  },
};

// Ajuste por peso extra (encima de 1 kg)
function ajustePeso(baseKg: number, pesoKg: number): number {
  if (pesoKg <= baseKg) return 0;
  const extra = pesoKg - baseKg;
  return Math.round(extra * 1200); // ~$1.200 por kg extra
}

// ── COTIZADOR ─────────────────────────────────────────────
export async function cotizarEnvio(datos: DatosEnvio): Promise<OpcionEnvio[]> {
  const { codigoPostal, ciudad, provincia, pesoKg = 0.5 } = datos;

  const local   = esLocal(codigoPostal, ciudad);
  const cordoba = !local && esProvinciaCordoba(provincia);
  const gba     = !local && !cordoba && esGBA(codigoPostal);

  const t = local ? TARIFAS.local : cordoba ? TARIFAS.cordoba : gba ? TARIFAS.gba : TARIFAS.nacional;
  const extra = ajustePeso(0.5, pesoKg);

  const opciones: OpcionEnvio[] = [];

  // 1. Retiro en el taller — siempre disponible y gratis
  opciones.push({
    id:          'retiro',
    nombre:      'Retiro en Carlos Paz',
    descripcion: 'Pasás a buscar por nuestro taller',
    precio:      0,
    diasMin:     0,
    diasMax:     2,
    seguimiento: false,
    gratis:      true,
    nota:        'Coordinamos día y horario por WhatsApp antes de que vengas',
  });

  // 2. Correo Argentino — Encomienda Clásica
  opciones.push({
    id:          'correo-clasico',
    nombre:      'Correo Argentino Clásico',
    descripcion: 'Encomienda con número de seguimiento',
    precio:      t.clasico + extra,
    diasMin:     local ? 3 : cordoba ? 4 : gba ? 6 : 7,
    diasMax:     local ? 6 : cordoba ? 8 : gba ? 10 : 14,
    seguimiento: true,
    gratis:      false,
    nota:        'Seguimiento en correoweb.com.ar',
  });

  // 3. Correo Argentino — Encomienda Prioritaria
  opciones.push({
    id:          'correo-prioritario',
    nombre:      'Correo Argentino Prioritario',
    descripcion: 'Entrega más rápida con prioridad',
    precio:      t.prioritario + extra,
    diasMin:     local ? 1 : cordoba ? 2 : gba ? 3 : 4,
    diasMax:     local ? 3 : cordoba ? 4 : gba ? 6 : 8,
    seguimiento: true,
    gratis:      false,
    nota:        'Recomendado para regalos con fecha',
  });

  return opciones;
}

export function textoEntrega(min: number, max: number): string {
  if (min === 0 && max === 0) return 'A coordinar';
  if (min === 0) return `Hasta ${max} días hábiles`;
  if (min === max) return `${min} días hábiles`;
  return `${min} a ${max} días hábiles`;
}

export function formatearPrecioEnvio(precio: number): string {
  if (precio === 0) return 'Gratis';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
  }).format(precio);
}
