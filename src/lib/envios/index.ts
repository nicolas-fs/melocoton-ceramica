// ============================================================
// SISTEMA DE ENVÍOS — Melocotón Cerámica
// Transportista: Correo Argentino
// Origen: Villa Carlos Paz, Córdoba (CP 5152)
//
// Tarifas actualizadas Junio 2026.
// Actualizá TARIFAS cada 2-3 meses.
// ============================================================

export interface DatosEnvio {
  codigoPostal: string;
  ciudad:       string;
  provincia:    string;
  pesoKg?:      number;
}

export interface OpcionEnvio {
  id:           string;
  nombre:       string;
  descripcion:  string;
  precio:       number;
  diasMin:      number;
  diasMax:      number;
  seguimiento:  boolean;
  gratis:       boolean;
  nota?:        string;
}

// ── ZONAS ─────────────────────────────────────────────────
function esLocal(cp: string, ciudad: string): boolean {
  const n = parseInt(cp, 10);
  const c = ciudad.toLowerCase();
  return (
    (n >= 5000 && n <= 5009) ||
    (n >= 5150 && n <= 5196) ||
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

// ── TARIFAS CORREO ARGENTINO — Junio 2026 ─────────────────
// FIX 2: precios actualizados por Ignacio
// a sucursal más cercana: $9.000
// a domicilio:            $13.000
const TARIFAS = {
  aSucursal: 9000,   // a sucursal más cercana (cualquier zona)
  aDomicilio: 13000, // a domicilio (cualquier zona)
};

// ── PRECIOS POR KG (placeholder hasta que Ignacio confirme) ─
// FIX 4: nueva modalidad por peso
// Ignacio debe confirmar los precios reales. Por ahora 3 tramos.
const TARIFAS_KG = {
  hasta1kg:  9000,   // ← precio provisorio para hasta 1 kg
  hasta3kg:  11000,  // ← confirmar con Ignacio
  hasta5kg:  14000,  // ← confirmar con Ignacio
};

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────
export function cotizarEnvio(datos: DatosEnvio): OpcionEnvio[] {
  const { codigoPostal, ciudad, provincia } = datos;
  if (!codigoPostal || codigoPostal.length < 4) return [];

  const local    = esLocal(codigoPostal, ciudad);
  const cordoba  = esProvinciaCordoba(provincia);

  const opciones: OpcionEnvio[] = [
    // Retiro en Carlos Paz — siempre gratis
    {
      id:          'retiro-local',
      nombre:      'Retiro en Carlos Paz',
      descripcion: 'Retirá en nuestro taller de Villa Carlos Paz. Coordinamos día y horario por WhatsApp.',
      precio:      0,
      diasMin:     1,
      diasMax:     3,
      seguimiento: false,
      gratis:      true,
      nota:        'Coordinamos día y horario por WhatsApp',
    },

    // FIX 2: A sucursal más cercana — precio único $9.000
    {
      id:          'correo-sucursal',
      nombre:      'Correo Argentino — Sucursal',
      descripcion: local ? 'Envío a sucursal más cercana de Carlos Paz / Córdoba.' : 'Envío a la sucursal de Correo Argentino más cercana a tu domicilio.',
      precio:      TARIFAS.aSucursal,
      diasMin:     local ? 2 : cordoba ? 3 : 5,
      diasMax:     local ? 4 : cordoba ? 6 : 10,
      seguimiento: true,
      gratis:      false,
      nota:        'Retirás en la sucursal de Correo Argentino más cercana a tu domicilio',
    },

    // FIX 2: A domicilio — precio único $13.000
    {
      id:          'correo-domicilio',
      nombre:      'Correo Argentino — Domicilio',
      descripcion: 'Lo recibís directamente en la puerta de tu casa.',
      precio:      TARIFAS.aDomicilio,
      diasMin:     local ? 3 : cordoba ? 4 : 7,
      diasMax:     local ? 5 : cordoba ? 7 : 12,
      seguimiento: true,
      gratis:      false,
    },

    // FIX 4: Envío por peso — 3 tramos (precios provisorios hasta confirmar con Ignacio)
    {
      id:          'correo-por-peso-1',
      nombre:      'Envío por peso — hasta 1 kg',
      descripcion: 'Para pedidos de hasta 1 kg (ej: 1-2 tazas). Precio provisorio, confirmar con Ignacio.',
      precio:      TARIFAS_KG.hasta1kg,
      diasMin:     local ? 2 : cordoba ? 3 : 5,
      diasMax:     local ? 5 : cordoba ? 7 : 12,
      seguimiento: true,
      gratis:      false,
      nota:        'Precio a confirmar — provisorio',
    },
    {
      id:          'correo-por-peso-3',
      nombre:      'Envío por peso — hasta 3 kg',
      descripcion: 'Para pedidos medianos (ej: set de 3-4 piezas). Precio provisorio, confirmar con Ignacio.',
      precio:      TARIFAS_KG.hasta3kg,
      diasMin:     local ? 2 : cordoba ? 3 : 5,
      diasMax:     local ? 5 : cordoba ? 7 : 12,
      seguimiento: true,
      gratis:      false,
      nota:        'Precio a confirmar — provisorio',
    },
    {
      id:          'correo-por-peso-5',
      nombre:      'Envío por peso — hasta 5 kg',
      descripcion: 'Para pedidos grandes (ej: 5+ piezas o tazones). Precio provisorio, confirmar con Ignacio.',
      precio:      TARIFAS_KG.hasta5kg,
      diasMin:     local ? 2 : cordoba ? 3 : 5,
      diasMax:     local ? 5 : cordoba ? 7 : 12,
      seguimiento: true,
      gratis:      false,
      nota:        'Precio a confirmar — provisorio',
    },
  ];

  return opciones;
}

export function formatearPrecioEnvio(precio: number): string {
  if (precio === 0) return 'Gratis';
  return new Intl.NumberFormat('es-AR', {
    style:    'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

// Corrección: ahora acepta diasMin y diasMax opcionales y los incluye en el texto
export function textoEntrega(opcion: OpcionEnvio, diasMin?: number, diasMax?: number): string {
  const rango = (diasMin !== undefined && diasMax !== undefined) ? ` · ${diasMin} a ${diasMax} días` : '';
  switch (opcion.id) {
    case 'correo-sucursal':
      return `Envío a sucursal${rango}`;
    case 'correo-domicilio':
      return `Envío a domicilio${rango}`;
    case 'correo-por-peso-1':
      return `Envío por peso (hasta 1 kg)${rango}`;
    case 'correo-por-peso-3':
      return `Envío por peso (hasta 3 kg)${rango}`;
    case 'correo-por-peso-5':
      return `Envío por peso (hasta 5 kg)${rango}`;
    default:
      return opcion.nombre + rango;
  }
}