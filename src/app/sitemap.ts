import { MetadataRoute } from 'next';
import { obtenerProductos } from '@/lib/productos';

const BASE_URL = (process.env.NEXT_PUBLIC_URL || 'https://melocotonceramica.vercel.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerProductos();

  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/catalogo`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/galeria`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/contacto`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const dinamicas: MetadataRoute.Sitemap = productos.map(p => ({
    url:             `${BASE_URL}/producto/${p.slug}`,
    lastModified:    new Date(p.actualizadoEn),
    changeFrequency: 'weekly' as const,
    priority:        p.destacado ? 0.85 : 0.7,
  }));

  return [...estaticas, ...dinamicas];
}
