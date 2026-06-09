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

// ── TARIFAS CORREO ARGENTINO — Junio 2026 ─────────────────
const TARIFAS = {
  aSucursal:  10000,
  aDomicilio: 15000,
};

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────
export function cotizarEnvio(datos: DatosEnvio): OpcionEnvio[] {
  const { codigoPostal, ciudad, provincia } = datos;
  if (!codigoPostal || codigoPostal.length < 4) return [];

  const local   = esLocal(codigoPostal, ciudad);
  const cordoba = esProvinciaCordoba(provincia);

  return [
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
    {
      id:          'correo-sucursal',
      nombre:      'Correo Argentino — Sucursal',
      descripcion: local
        ? 'Envío a sucursal más cercana de Carlos Paz / Córdoba.'
        : 'Envío a la sucursal de Correo Argentino más cercana a tu domicilio.',
      precio:      TARIFAS.aSucursal,
      diasMin:     local ? 2 : cordoba ? 3 : 5,
      diasMax:     local ? 4 : cordoba ? 6 : 10,
      seguimiento: true,
      gratis:      false,
      nota:        'Retirás en la sucursal de Correo Argentino más cercana a tu domicilio',
    },
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
  ];
}

export function formatearPrecioEnvio(precio: number): string {
  if (precio === 0) return 'Gratis';
  return new Intl.NumberFormat('es-AR', {
    style:                'currency',
    currency:             'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

export function textoEntrega(opcion: OpcionEnvio, diasMin?: number, diasMax?: number): string {
  const rango = (diasMin !== undefined && diasMax !== undefined)
    ? ` · ${diasMin} a ${diasMax} días`
    : '';
  switch (opcion.id) {
    case 'correo-sucursal':  return `Envío a sucursal${rango}`;
    case 'correo-domicilio': return `Envío a domicilio${rango}`;
    default:                 return opcion.nombre + rango;
  }
}
