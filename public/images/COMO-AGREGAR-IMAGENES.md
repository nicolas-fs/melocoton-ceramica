# Cómo agregar imágenes propias al sitio

## Estructura de carpetas

```
public/
  images/
    logo.jpg              ← el logo (ya está)
    productos/            ← fotos de cada producto
      taza-frases.jpg
      tazon-ternura.jpg
      set-personalizado.jpg
      ... (una por producto)
    galeria/              ← fotos para la galería
      foto-01.jpg
      foto-02.jpg
      ... (las que quieras)
```

## Pasos para agregar fotos de productos

1. Guardá la foto en `public/images/productos/nombre-descriptivo.jpg`
2. En el panel admin (`/admin/productos`), editá el producto
3. En el campo "URL de imagen", escribí: `/images/productos/nombre-descriptivo.jpg`
4. Guardá — la foto aparece al instante

## Pasos para agregar fotos a la galería

1. Guardá las fotos en `public/images/galeria/foto-01.jpg`, `foto-02.jpg`, etc.
2. Abrí el archivo `data/galeria.ts`
3. Para cada foto, agregá una entrada:

```typescript
{
  url: '/images/galeria/foto-01.jpg',
  caption: 'Descripción de la pieza',
  categoria: 'tazas',  // tazas | tazones | sets | macetas | bowls | coleccion
  likes: 0,
  igUrl: 'https://instagram.com/melocoton.ceramica',
}
```

## Formatos recomendados

- **Formato:** JPG o WebP
- **Tamaño:** 800×800 px para productos, 600×600 px para galería
- **Peso máximo:** 500KB por foto (usá squoosh.app para comprimir gratis)
- **Nombres:** sin espacios ni acentos (usar guiones: `taza-frases.jpg`)

## Alternativa permanente: Cloudinary

Si querés que las fotos estén en la nube (no en el proyecto):
1. Registrate gratis en cloudinary.com
2. Subí las fotos ahí
3. Copiá la URL (termina en `.jpg` o `.webp`)
4. Usala directamente en el admin

Cloudinary sirve las imágenes más rápido y no ocupan espacio en el proyecto.
