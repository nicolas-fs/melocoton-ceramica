// ============================================================
// GALERÍA — Melocotón Cerámica
// Fotos reales del taller — sin conexión a Instagram
// 24 imágenes locales organizadas por categoría
// ============================================================

export interface ImagenGaleria {
  url: string;
  caption: string;
  categoria: 'tazas' | 'tazones' | 'sets' | 'macetas' | 'bowls' | 'coleccion';
  igUrl: string;
}

export const GALERIA: ImagenGaleria[] = [
  { url: '/images/galeria/galeria-01.jpg', caption: 'Tazas animales de la colección más querida', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-02.jpg', caption: 'Set de té para uno, tetera y taza a juego', categoria: 'sets', igUrl: '' },
  { url: '/images/galeria/galeria-03.jpg', caption: 'Taza con frase pintada a mano', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-04.jpg', caption: 'Mini taza artesanal, perfecta para el espresso', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-05.jpg', caption: 'Tazas Best Mom Ever en colores rosa y lila', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-06.jpg', caption: 'Taza redonda con frase y diseño floral', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-07.jpg', caption: 'Detalle del proceso de esmaltado a mano', categoria: 'coleccion', igUrl: '' },
  { url: '/images/galeria/galeria-08.jpg', caption: 'Tazas de la colección primavera', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-09.jpg', caption: 'Tazón XL para el desayuno con motivos florales', categoria: 'tazones', igUrl: '' },
  { url: '/images/galeria/galeria-10.jpg', caption: 'Set de tazas coordinadas para regalo', categoria: 'sets', igUrl: '' },
  { url: '/images/galeria/galeria-11.jpg', caption: 'Taza con diseño exclusivo pintada a mano', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-12.jpg', caption: 'Colección de tazas artesanales variadas', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-13.jpg', caption: 'Bowl mediano con esmalte natural', categoria: 'bowls', igUrl: '' },
  { url: '/images/galeria/galeria-14.jpg', caption: 'Tazas con diseños únicos de cada pieza', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-15.jpg', caption: 'Set regalo con empaque especial', categoria: 'sets', igUrl: '' },
  { url: '/images/galeria/galeria-16.jpg', caption: 'Tazón grande para desayuno familiar', categoria: 'tazones', igUrl: '' },
  { url: '/images/galeria/galeria-17.jpg', caption: 'Piezas del taller en proceso de secado', categoria: 'coleccion', igUrl: '' },
  { url: '/images/galeria/galeria-18.jpg', caption: 'Taza con mensaje motivacional', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-19.jpg', caption: 'Mini tazas de la colección café', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-20.jpg', caption: 'Detalle de textura artesanal en cada pieza', categoria: 'coleccion', igUrl: '' },
  { url: '/images/galeria/galeria-21.jpg', caption: 'Set completo para día de campo', categoria: 'sets', igUrl: '' },
  { url: '/images/galeria/galeria-22.jpg', caption: 'Taza con ilustración de mascota personalizada', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-23.jpg', caption: 'Tazas de la nueva colección de verano', categoria: 'tazas', igUrl: '' },
  { url: '/images/galeria/galeria-24.jpg', caption: 'Bowl grande para ensaladas o cereales', categoria: 'bowls', igUrl: '' },
];

export const CATEGORIAS_GALERIA = [
  { id: 'todas',     label: 'Todas',      emoji: '' },
  { id: 'tazas',     label: 'Tazas',      emoji: '' },
  { id: 'tazones',   label: 'Tazones',    emoji: '' },
  { id: 'sets',      label: 'Sets',       emoji: '' },
  { id: 'bowls',     label: 'Bowls',      emoji: '' },
  { id: 'coleccion', label: 'Coleccion',  emoji: '' },
];
