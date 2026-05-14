import { Producto } from '@/types';

// ============================================================
// PRODUCTOS — Melocotón Cerámica
// Imágenes reales del Instagram @melocoton.ceramica
// ⚠️  Las URLs de Instagram expiran — cuando tengas Cloudinary,
//     subí las fotos ahí y reemplazá estas URLs
// ============================================================

export const PRODUCTOS: Producto[] = [
  {
    id: '1',
    titulo: 'Taza "Lo estás haciendo bien"',
    slug: 'taza-lo-estas-haciendo-bien',
    descripcionCorta: 'Porque a veces necesitamos recordarnos que lo estamos haciendo bien.',
    descripcion: `Una taza para los días que cuestan un poco más.

Hecha a mano en arcilla blanca, esmaltada en tonos naturales y grabada con la frase que todos necesitamos leer en algún momento del día.

**Capacidad:** 350 ml
**Técnica:** Torneada y esmaltada a mano
**Apta para:** Microondas y lavavajillas (ciclo suave)`,
    precio: 12500,
    imagenes: [
      '/images/productos/taza-2.svg',
      '/images/productos/taza-2.svg',
    ],
    stock: 8, categoria: 'tazas', destacado: true,
    etiquetas: ['frases', 'regalo', 'personalizable'],
    creadoEn: '2024-01-15T10:00:00Z', actualizadoEn: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    titulo: 'Taza "Tan martes que duele"',
    slug: 'taza-tan-martes-que-duele',
    descripcionCorta: 'Para los días que son tan martes que duelen. La más honesta de la semana.',
    descripcion: `Para esos días que son exactamente así.

Hecha a mano con toda la honestidad del mundo. Una de las más pedidas porque todas nos identificamos.

**Capacidad:** 350 ml
**Técnica:** Torneada y esmaltada a mano
**Apta para:** Microondas y lavavajillas`,
    precio: 12500,
    imagenes: [
      '/images/productos/taza-3.svg',
    ],
    stock: 6, categoria: 'tazas', destacado: true,
    etiquetas: ['frases', 'humor', 'regalo'],
    creadoEn: '2024-01-20T10:00:00Z', actualizadoEn: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    titulo: 'Taza Terra — Viernes bien arriba',
    slug: 'taza-terra-viernes',
    descripcionCorta: 'Taza terra, nunca sótano. Para los viernes que se merecen festejarse.',
    descripcion: `Viernes bien arriba. Terraza, terraza.

Taza terra con esmalte cálido y frase grabada a mano. Para los viernes y para todos los días que lo merecen.

**Capacidad:** 350 ml
**Técnica:** Torneada y esmaltada a mano
**Terminación:** Esmalte terra mate`,
    precio: 12500,
    imagenes: [
      '/images/productos/taza-4.svg',
    ],
    stock: 5, categoria: 'tazas', destacado: false,
    etiquetas: ['frases', 'terra'],
    creadoEn: '2024-02-01T10:00:00Z', actualizadoEn: '2024-02-01T10:00:00Z',
  },
  {
    id: '4',
    titulo: 'Nuevas Tazas — Colección',
    slug: 'tazas-coleccion',
    descripcionCorta: 'Nuevas tazas disponibles. Distintas entre sí, únicas como cada persona.',
    descripcion: `Nuevas tazas disponibles.

Llegaron las nuevas de la colección. Cada una es distinta porque cada una fue hecha a mano, sin moldes, sin series.

**Capacidad:** 350 ml
**Consultar:** Diseño disponible al momento de comprar`,
    precio: 13000,
    imagenes: [
      '/images/productos/taza-1.svg',
      '/images/productos/taza-1.svg',
    ],
    stock: 7, categoria: 'tazas', destacado: false,
    etiquetas: ['coleccion', 'nuevo'],
    creadoEn: '2024-02-05T10:00:00Z', actualizadoEn: '2024-02-05T10:00:00Z',
  },
  {
    id: '5',
    titulo: 'Tazón con Ternura',
    slug: 'tazon-con-ternura',
    descripcionCorta: 'El tazón que te enamora. Grande, cálido y con toda la ternura del mundo.',
    descripcion: `Cortamos la semana con un poquito de ternura.

Tazón grande y profundo, ideal para el café con leche, los cereales o la sopa de los días fríos. Esmaltado en tonos naturales con terminación mate.

**Capacidad:** 550 ml
**Medidas:** ~14 cm diámetro x 9 cm alto
**Apta para:** Microondas y lavavajillas`,
    precio: 16000,
    imagenes: [
      '/images/productos/tazon-1.svg',
      '/images/productos/tazon-1.svg',
    ],
    stock: 6, categoria: 'tazones', destacado: true,
    etiquetas: ['desayuno', 'regalo'],
    creadoEn: '2024-02-10T10:00:00Z', actualizadoEn: '2024-02-10T10:00:00Z',
  },
  {
    id: '6',
    titulo: 'Tazón Frida — Viva la Vida',
    slug: 'tazon-frida-viva-la-vida',
    descripcionCorta: 'VIVA LA VIDA. Un tazón con toda la energía y el color de Frida.',
    descripcion: `Hermoso comienzo de semana. VIVA LA VIDA.

Tazón inspirado en Frida Kahlo, con flores y colores vibrantes pintados a mano con engobes. Cada uno es único.

**Capacidad:** 450 ml
**Técnica:** Torneado y pintado a mano con engobes
**Apta para:** Microondas y lavavajillas`,
    precio: 18000,
    imagenes: [
      '/images/productos/tazon-1.svg',
    ],
    stock: 3, categoria: 'tazones', destacado: true,
    etiquetas: ['frida', 'colorido', 'especial', 'regalo'],
    creadoEn: '2024-02-15T10:00:00Z', actualizadoEn: '2024-02-15T10:00:00Z',
  },
  {
    id: '7',
    titulo: 'Tazón XL para el Frío',
    slug: 'tazon-xl-frio',
    descripcionCorta: 'El tazón XL para disfrutar del frío con algo calentito adentro.',
    descripcion: `Terminen bien su semana. Disfruten del frío con algo calentito.

El tazón más grande de la colección. Para el café con leche generoso, la sopa invernal o simplemente para sentir que el mundo puede esperar.

**Capacidad:** 650 ml
**Medidas:** ~16 cm diámetro
**Apta para:** Microondas y lavavajillas`,
    precio: 19500,
    imagenes: [
      '/images/productos/tazon-1.svg',
      '/images/productos/tazon-1.svg',
    ],
    stock: 4, categoria: 'tazones', destacado: false,
    etiquetas: ['xl', 'invierno', 'desayuno'],
    creadoEn: '2024-03-01T10:00:00Z', actualizadoEn: '2024-03-01T10:00:00Z',
  },
  {
    id: '8',
    titulo: 'Set Pedidos Personalizados',
    slug: 'set-pedidos-personalizados',
    descripcionCorta: 'Con tu frase, tu nombre o tu diseño. El regalo más especial que existe.',
    descripcion: `Pedidos personalizados terminando la semana.

Podés pedirlo con tu frase favorita, el nombre de alguien especial o una fecha. Consultanos antes de comprar para coordinar el diseño.

**Incluye:** 2 piezas a elección
**Personalización:** Frase, nombre o fecha
**Tiempo extra:** 5-7 días para producción`,
    precio: 26000,
    imagenes: [
      '/images/productos/tazon-1.svg',
      '/images/productos/tazon-1.svg',
    ],
    stock: 5, categoria: 'sets', destacado: true,
    etiquetas: ['personalizado', 'regalo', 'especial'],
    creadoEn: '2024-03-10T10:00:00Z', actualizadoEn: '2024-03-10T10:00:00Z',
  },
  {
    id: '9',
    titulo: 'Set para Papá o Mamá',
    slug: 'set-papa-mama',
    descripcionCorta: 'El regalo perfecto. Dos piezas únicas, envueltas con papel de seda y tarjeta.',
    descripcion: `Van saliendo cositas para papá. Que disfruten su domingo.

Set de dos piezas pensado para regalar. Viene envuelto con papel de seda y tarjeta personalizada sin cargo extra.

**Incluye:** 2 piezas (taza + tazón, o 2 tazas)
**Envoltorio:** Papel de seda + tarjeta sin cargo
**Ideal para:** Día del padre, Día de la madre, cumpleaños`,
    precio: 24000,
    imagenes: [
      '/images/productos/tazon-1.svg',
      '/images/productos/tazon-1.svg',
    ],
    stock: 4, categoria: 'sets', destacado: true,
    etiquetas: ['regalo', 'papa', 'mama', 'envoltorio'],
    creadoEn: '2024-03-20T10:00:00Z', actualizadoEn: '2024-03-20T10:00:00Z',
  },
  {
    id: '10',
    titulo: 'Tazón del Ceramista',
    slug: 'tazon-del-ceramista',
    descripcionCorta: 'Hecho con las manos de quien ama lo que hace. Único, irrepetible.',
    descripcion: `Feliz día del ceramista. Gracias a mis viejos que me enseñaron este oficio.

Un tazón hecho con el alma. Cada pieza lleva la huella de las manos que la hicieron.

**Capacidad:** 500 ml
**Técnica:** Torneada y esmaltada a mano`,
    precio: 17500,
    imagenes: [
      '/images/productos/tazon-1.svg',
      '/images/productos/tazon-1.svg',
    ],
    stock: 2, categoria: 'tazones', destacado: false,
    etiquetas: ['especial', 'artesanal'],
    creadoEn: '2024-04-01T10:00:00Z', actualizadoEn: '2024-04-01T10:00:00Z',
  },
  {
    id: '11',
    titulo: 'Set Té para Uno — Día de la Madre',
    slug: 'set-te-dia-madre',
    descripcionCorta: 'Para tomar el té de a uno, con calma. Tazón + platito, el regalo perfecto.',
    descripcion: `Y que mejor para arrancar que tomar un té con este juego.

Set pensado para los momentos tranquilos. Con platito a juego incluido.

**Incluye:** Tazón + platito
**Capacidad:** 400 ml
**Ideal para:** Día de la madre, cumpleaños`,
    precio: 22000,
    imagenes: [
      '/images/productos/tazon-1.svg',
    ],
    stock: 3, categoria: 'sets', destacado: false,
    etiquetas: ['te', 'diadelamadre', 'regalo'],
    creadoEn: '2024-04-15T10:00:00Z', actualizadoEn: '2024-04-15T10:00:00Z',
  },
  {
    id: '12',
    titulo: 'Tazón Nueva Integrante',
    slug: 'tazon-nueva-integrante',
    descripcionCorta: 'La nueva integrante de la colección. Con esmalte que cambia de tono según la luz.',
    descripcion: `Señoras y señores, les presento a la nueva integrante de la colección.

Un tazón especial que llegó para quedarse. Hecho a mano con un esmalte que tiene variaciones de color únicas.

**Capacidad:** 500 ml
**Característica:** El esmalte varía de tono en cada pieza`,
    precio: 17000,
    imagenes: [
      '/images/productos/tazon-1.svg',
    ],
    stock: 5, categoria: 'tazones', destacado: false,
    etiquetas: ['nuevo', 'coleccion'],
    creadoEn: '2024-04-20T10:00:00Z', actualizadoEn: '2024-04-20T10:00:00Z',
  },
];

export const CATEGORIAS = [
  { id: 'tazas',   nombre: 'Tazas',    emoji: '☕', descripcion: 'Para el café de cada día' },
  { id: 'tazones', nombre: 'Tazones',  emoji: '🍵', descripcion: 'Desayunos que se merecen tiempo' },
  { id: 'bowls',   nombre: 'Bowls',    emoji: '🥣', descripcion: 'Para servir y decorar' },
  { id: 'macetas', nombre: 'Macetas',  emoji: '🌿', descripcion: 'Para tus plantas preferidas' },
  { id: 'sets',    nombre: 'Sets',     emoji: '🎁', descripcion: 'Perfectos para regalar' },
  { id: 'platos',  nombre: 'Platitos', emoji: '🫙', descripcion: 'Pequeños y especiales' },
];

export const TESTIMONIOS = [
  { texto: '¡Llegó perfecta! La caja venía súper bien embalada y la taza es hermosa. La uso todos los días.', nombre: 'María A.', ciudad: 'Córdoba Capital' },
  { texto: 'Le regalé el set dúo a mi mamá y se emocionó. La calidad es increíble para ser artesanal.', nombre: 'Claudia R.', ciudad: 'Carlos Paz' },
  { texto: '¡Vale la pena! Tardé en animarme a comprar online pero fue la mejor decisión.', nombre: 'Mariano L.', ciudad: 'Buenos Aires' },
  { texto: 'Compré la taza de frases para regalarme y ahora quiero todas. Son únicas.', nombre: 'Sol P.', ciudad: 'Rosario' },
];
