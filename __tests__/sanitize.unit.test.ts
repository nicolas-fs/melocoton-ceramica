// ============================================================
// TESTS UNITARIOS — Sanitizador HTML
// Tests específicos y completos para la capa de sanitización
// ============================================================

import { sanitizeHtml, markdownToSafeHtml } from '../src/lib/sanitize';

describe('sanitizeHtml — Tests exhaustivos', () => {

  describe('Scripts y código ejecutable', () => {
    const casos = [
      '<script>alert(1)</script>',
      '<script src="http://evil.com/x.js"></script>',
      '<SCRIPT>alert(1)</SCRIPT>',
      '<<script>>alert(1)<</script>>',
      '<script>/* comentario */alert(1)/* fin */</script>',
    ];
    casos.forEach(input => {
      test(`Elimina: ${input.substring(0, 50)}`, () => {
        expect(sanitizeHtml(input)).not.toContain('alert');
        expect(sanitizeHtml(input)).not.toContain('<script');
      });
    });
  });

  describe('Event handlers', () => {
    const casos = [
      '<img src="x" onerror="alert(1)">',
      '<p onmouseover="alert(1)">texto</p>',
      '<a onclick="eval(\'xss\')">link</a>',
      '<body onload="document.cookie">',
    ];
    casos.forEach(input => {
      test(`Elimina handler en: ${input.substring(0, 60)}`, () => {
        const result = sanitizeHtml(input);
        expect(result).not.toMatch(/on\w+\s*=/i);
      });
    });
  });

  describe('URIs peligrosas', () => {
    test('Elimina javascript: en href', () => {
      expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).not.toContain('javascript:');
    });
    test('Elimina data: URIs', () => {
      expect(sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">')).not.toContain('data:');
    });
  });

  describe('Tags permitidos se conservan', () => {
    test('Conserva <p>', () => {
      expect(sanitizeHtml('<p>Hola mundo</p>')).toContain('<p>Hola mundo</p>');
    });
    test('Conserva <strong>', () => {
      expect(sanitizeHtml('<strong>negrita</strong>')).toContain('<strong>negrita</strong>');
    });
    test('Conserva <em>', () => {
      expect(sanitizeHtml('<em>cursiva</em>')).toContain('<em>cursiva</em>');
    });
    test('Conserva <br>', () => {
      expect(sanitizeHtml('<br>')).toContain('<br>');
    });
    test('Conserva listas', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });
  });

  describe('Tags peligrosos eliminados', () => {
    const peligrosos = ['iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'style', 'meta'];
    peligrosos.forEach(tag => {
      test(`Elimina <${tag}>`, () => {
        const result = sanitizeHtml(`<${tag}>contenido</${tag}>`);
        expect(result).not.toContain(`<${tag}`);
      });
    });
  });

  describe('Texto plano sin tags', () => {
    test('Pasa texto plano sin modificar', () => {
      const input = 'Este es un texto sin HTML';
      expect(sanitizeHtml(input)).toBe(input);
    });
    test('Pasa texto con caracteres especiales', () => {
      const input = 'Cerámica & artesanía — 100% hecho a mano';
      const result = sanitizeHtml(input);
      expect(result).toContain('Cerámica');
    });
  });
});

describe('markdownToSafeHtml', () => {
  test('Convierte **negrita** a <strong>', () => {
    expect(markdownToSafeHtml('**hola**')).toContain('<strong>hola</strong>');
  });
  test('Convierte párrafos separados por \\n\\n', () => {
    const result = markdownToSafeHtml('párrafo 1\n\npárrafo 2');
    expect(result).toContain('<p>párrafo 1</p>');
    expect(result).toContain('<p>párrafo 2</p>');
  });
  test('Sanitiza XSS en markdown', () => {
    const result = markdownToSafeHtml('**Texto**\n\n<script>evil()</script>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('evil()');
    expect(result).toContain('<strong>Texto</strong>');
  });
  test('Maneja string vacío', () => {
    expect(markdownToSafeHtml('')).toBe('');
  });
});
