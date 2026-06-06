// ============================================================
// SANITIZADOR DE HTML — Melocotón Cerámica
// HAL-03 FIX: Prevenir XSS en descripción de productos
//
// Implementación sin dependencias externas (compatible con
// Next.js 14 App Router en server components).
// Permite solo un subconjunto seguro de etiquetas HTML.
// ============================================================

// Etiquetas permitidas y sus atributos seguros
const ALLOWED_TAGS: Record<string, string[]> = {
 p: [],
 strong: [],
 em: [],
 br: [],
 ul: [],
 ol: [],
 li: [],
 h3: [],
 h4: [],
};

/**
 * Sanitiza una cadena HTML eliminando tags y atributos no permitidos.
 * Protege contra XSS en contenido generado por usuarios/admins.
 *
 * @param html - HTML a sanitizar
 * @returns HTML seguro con solo los tags permitidos
 */
export function sanitizeHtml(html: string): string {
 if (!html || typeof html !== 'string') return '';

 // 1. Eliminar scripts completamente (incluyendo contenido)
 let safe = html
 .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
 .replace(/<\/script>/gi, '')

 // 2. Eliminar event handlers (onclick, onerror, onload, etc.)
 .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')

 // 3. Eliminar javascript: en href/src/action
 .replace(/(?:href|src|action|formaction)\s*=\s*(?:"|')?\s*javascript:/gi, 'href="#"')

 // 4. Eliminar data: URIs (pueden ejecutar código)
 .replace(/(?:href|src)\s*=\s*(?:"|')?\s*data:/gi, 'href="#"')

 // 5. Eliminar tags no permitidos pero conservar su contenido de texto
 .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName) => {
 const tag = tagName.toLowerCase();
 if (ALLOWED_TAGS[tag] !== undefined) {
 // Es un tag permitido — reconstruir sin atributos peligrosos
 const isClosing = match.startsWith('</');
 const isSelfClosing = match.endsWith('/>') || tag === 'br';

 if (isClosing) return `</${tag}>`;
 if (isSelfClosing) return `<${tag}>`;
 return `<${tag}>`;
 }
 // Tag no permitido — eliminar preservando contenido
 return '';
 });

 // 6. Limpiar entidades HTML peligrosas que podrían escapar la sanitización
 safe = safe
 .replace(/&#x[0-9a-fA-F]+;/g, '') // hex entities
 .replace(/&#[0-9]+;/g, c => {
 // Permitir entidades numéricas básicas inofensivas
 const code = parseInt(c.slice(2, -1));
 if (code > 31 && code < 127) return c; // ASCII printable
 return '';
 });

 return safe.trim();
}

/**
 * Convierte el Markdown simple de producto a HTML seguro.
 * Soporta: **negrita**, párrafos separados por \n\n
 */
export function markdownToSafeHtml(markdown: string): string {
 if (!markdown || typeof markdown !== 'string') return '';

 const html = markdown
 .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **negrita**
 .replace(/\*(.*?)\*/g, '<em>$1</em>') // *cursiva*
 .split('\n\n')
 .map(p => p.trim())
 .filter(p => p.length > 0)
 .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
 .join('');

 return sanitizeHtml(html);
}
