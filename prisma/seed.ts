// ============================================================
// SEED — Melocotón Cerámica
// Inserta los productos iniciales en la base de datos.
// Solo inserta si no existen (idempotente).
//
// Ejecutar: npm run db:seed
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTOS_INICIALES = [
  {
    titulo:           'Taza "Lo estás haciendo bien"',
    slug:             'taza-lo-estas-haciendo-bien',
    descripcionCorta: 'Porque a veces necesitamos recordarnos que lo estamos haciendo bien.',
    descripcion:      'Una taza para los días que cuestan un poco más. Hecha a mano en arcilla blanca, esmaltada y horneada con mucho amor.',
    precio:           12500,
    stock:            8,
    categoria:        'tazas',
    destacado:        true,
    etiquetas:        ['frases', 'regalo'],
    imagenes:         ['/images/catalogo/producto-01.jpg'],
  },
  {
    titulo:           'Taza "Tan martes que duele"',
    slug:             'taza-tan-martes-que-duele',
    descripcionCorta: 'Para esos días que empiezan difícil.',
    descripcion:      'Taza artesanal con frase pintada a mano. Perfecta para el café de cada mañana.',
    precio:           12500,
    stock:            6,
    categoria:        'tazas',
    destacado:        true,
    etiquetas:        ['frases', 'cafe'],
    imagenes:         ['/images/catalogo/producto-02.jpg'],
  },
  {
    titulo:           'Taza Terra — Viernes bien arriba',
    slug:             'taza-terra-viernes',
    descripcionCorta: 'Para celebrar que llegó el viernes.',
    descripcion:      'Taza de cerámica artesanal de la colección Terra. Cada pieza es única.',
    precio:           12500,
    stock:            5,
    categoria:        'tazas',
    destacado:        false,
    etiquetas:        ['frases', 'coleccion-terra'],
    imagenes:         ['/images/catalogo/producto-03.jpg'],
  },
  {
    titulo:           'Tazas Colección Animales',
    slug:             'tazas-coleccion-animales',
    descripcionCorta: 'Vacas, cerditos, gatitos — hechos a mano con mucho detalle.',
    descripcion:      'Colección de tazas con diseños de animales modelados a mano. Cada pieza tiene su propia personalidad.',
    precio:           13000,
    stock:            7,
    categoria:        'tazas',
    destacado:        true,
    etiquetas:        ['animales', 'coleccion'],
    imagenes:         ['/images/catalogo/producto-04.jpg'],
  },
  {
    titulo:           'Tazón con Ternura',
    slug:             'tazon-con-ternura',
    descripcionCorta: 'Un tazón grande para los desayunos que merecen espacio.',
    descripcion:      'Tazón XL de cerámica artesanal. Ideal para granola, cereales o un buen té. Hecho a mano en Córdoba.',
    precio:           16000,
    stock:            6,
    categoria:        'tazones-xl',
    destacado:        true,
    etiquetas:        ['tazon', 'desayuno'],
    imagenes:         ['/images/catalogo/producto-05.jpg'],
  },
  {
    titulo:           'Té para Uno — Flores Azules',
    slug:             'te-para-uno-flores-azules',
    descripcionCorta: 'Tetera y taza a juego con motivos florales pintados a mano.',
    descripcion:      'Set de té para uno con flores azules pintadas a mano. Tetera con tapa y taza que encajan perfectamente.',
    precio:           28000,
    stock:            4,
    categoria:        'te-para-uno',
    destacado:        true,
    etiquetas:        ['te', 'flores', 'set', 'regalo'],
    imagenes:         ['/images/catalogo/producto-06.jpg'],
  },
  {
    titulo:           'Mini Taza "Café y Chisme"',
    slug:             'mini-taza-cafe-chisme',
    descripcionCorta: 'La compañía perfecta para un espresso y una buena charla.',
    descripcion:      'Mini taza artesanal con frase pintada a mano. Tamaño ideal para espresso o cortado.',
    precio:           8500,
    stock:            10,
    categoria:        'mini-taza',
    destacado:        false,
    etiquetas:        ['mini', 'cafe', 'frases'],
    imagenes:         ['/images/catalogo/producto-07.jpg'],
  },
  {
    titulo:           'Mate Artesanal',
    slug:             'mate-artesanal',
    descripcionCorta: 'Un mate único, hecho a mano en arcilla.',
    descripcion:      'Mate de cerámica artesanal con terminación esmaltada. Cada uno tiene su propia forma e identidad.',
    precio:           18000,
    stock:            5,
    categoria:        'mates',
    destacado:        false,
    etiquetas:        ['mate', 'artesanal'],
    imagenes:         ['/images/catalogo/producto-08.jpg'],
  },
  {
    titulo:           'Bowl Mediano',
    slug:             'bowl-mediano',
    descripcionCorta: 'Para ensaladas, cereales o lo que se te ocurra.',
    descripcion:      'Bowl de cerámica de tamaño mediano con esmalte natural. Apto para horno y microondas.',
    precio:           14000,
    stock:            6,
    categoria:        'bowls',
    destacado:        false,
    etiquetas:        ['bowl', 'cocina'],
    imagenes:         ['/images/catalogo/producto-09.jpg'],
  },
  {
    titulo:           'Set Desayuno Pareja',
    slug:             'set-desayuno-pareja',
    descripcionCorta: 'Dos tazas coordinadas para compartir las mañanas.',
    descripcion:      'Set de dos tazas artesanales coordinadas. Perfecto para regalar o usar en casa.',
    precio:           24000,
    stock:            4,
    categoria:        'sets',
    destacado:        true,
    etiquetas:        ['set', 'regalo', 'pareja'],
    imagenes:         ['/images/catalogo/producto-10.jpg'],
  },
  {
    titulo:           'Portasahumerios',
    slug:             'portasahumerios',
    descripcionCorta: 'Para aromatizar tu espacio con estilo artesanal.',
    descripcion:      'Portasahumerios de cerámica hecho a mano. Con diseños únicos y perforados para el humo.',
    precio:           9000,
    stock:            8,
    categoria:        'portasahumerios',
    destacado:        false,
    etiquetas:        ['deco', 'sahumerios'],
    imagenes:         ['/images/catalogo/producto-11.jpg'],
  },
  {
    titulo:           'Taza Best Mom Ever',
    slug:             'taza-best-mom-ever',
    descripcionCorta: 'El regalo perfecto para el Día de la Madre.',
    descripcion:      'Taza artesanal con texto grabado a mano. Disponible en colores rosa y lila.',
    precio:           14000,
    stock:            5,
    categoria:        'tazas',
    destacado:        true,
    etiquetas:        ['regalo', 'madre', 'frases'],
    imagenes:         ['/images/catalogo/producto-12.jpg'],
  },
];

async function main() {
  console.log('Iniciando seed de Melocotón Cerámica...');

  let creados = 0;
  let saltados = 0;

  for (const producto of PRODUCTOS_INICIALES) {
    const existe = await prisma.producto.findUnique({
      where: { slug: producto.slug },
    });

    if (existe) {
      saltados++;
      continue;
    }

    await prisma.producto.create({ data: producto });
    creados++;
    console.log(`  Creado: ${producto.titulo}`);
  }

  console.log(`\nSeed completado:`);
  console.log(`  Creados:  ${creados}`);
  console.log(`  Ya existían: ${saltados}`);
}

main()
  .catch(e => { console.error('Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
