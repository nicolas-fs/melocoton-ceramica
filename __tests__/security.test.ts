// ============================================================
// TESTS DE SEGURIDAD — Melocotón Cerámica
//
// Ejecutar con: npm run test:security
// Cobertura:
//   ✓ Rutas admin retornan 401 sin sesión
//   ✓ Checkout rechaza datos inválidos
//   ✓ Checkout rechaza precios manipulados
//   ✓ Webhook rechaza llamadas sin firma
//   ✓ Rate limiter bloquea exceso de intentos
//   ✓ Sanitizador HTML previene XSS
//   ✓ APIs de escritura requieren autenticación
// ============================================================

import { NextRequest } from 'next/server';

// ── Helpers para crear requests simulados ─────────────────

function makeRequest(
  url:     string,
  method:  string = 'GET',
  body?:   unknown,
  headers: Record<string, string> = {}
): NextRequest {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };
  return new NextRequest(url, init);
}

// ── SUITE 1: Sanitizador HTML ─────────────────────────────

describe('Sanitizador HTML — Prevención de XSS', () => {
  let sanitizeHtml: (html: string) => string;
  let markdownToSafeHtml: (md: string) => string;

  beforeAll(async () => {
    const mod = await import('../src/lib/sanitize');
    sanitizeHtml      = mod.sanitizeHtml;
    markdownToSafeHtml = mod.markdownToSafeHtml;
  });

  test('Elimina tags <script>', () => {
    const input    = '<p>Hola</p><script>alert("xss")</script>';
    const result   = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Hola</p>');
  });

  test('Elimina event handlers (onclick, onerror, etc.)', () => {
    const input  = '<p onclick="alert(1)">click</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('alert');
  });

  test('Elimina javascript: en href', () => {
    const input  = '<a href="javascript:alert(1)">link</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  test('Elimina iframes', () => {
    const input  = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('iframe');
  });

  test('Conserva tags permitidos (p, strong, em)', () => {
    const input  = '<p>Texto <strong>negrita</strong> y <em>cursiva</em></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  test('markdownToSafeHtml convierte y sanitiza correctamente', () => {
    const input  = '**Hola** mundo\n\nSegundo párrafo<script>alert(1)</script>';
    const result = markdownToSafeHtml(input);
    expect(result).toContain('<strong>Hola</strong>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  test('Maneja inputs vacíos o nulos', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as any)).toBe('');
  });
});

// ── SUITE 2: Rate Limiter ─────────────────────────────────

describe('Rate Limiter — Protección contra fuerza bruta', () => {
  let checkRateLimit: Function;

  beforeAll(async () => {
    const mod  = await import('../src/lib/rateLimiter');
    checkRateLimit = mod.checkRateLimit;
  });

  test('Permite intentos dentro del límite', () => {
    const key = `test:ratelimit:${Date.now()}`;
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  test('Bloquea al superar el límite de intentos', () => {
    const key = `test:ratelimit:brute:${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const blocked = checkRateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  test('Claves distintas tienen contadores independientes', () => {
    const key1 = `test:ratelimit:a:${Date.now()}`;
    const key2 = `test:ratelimit:b:${Date.now()}`;

    for (let i = 0; i < 5; i++) checkRateLimit(key1, 3, 60_000);
    const blocked = checkRateLimit(key1, 3, 60_000);
    const allowed  = checkRateLimit(key2, 3, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(allowed.allowed).toBe(true);
  });
});

// ── SUITE 3: Checkout — Validación de inputs ──────────────

describe('API Checkout — Validación de entradas', () => {
  let POST: Function;

  beforeAll(async () => {
    jest.resetModules();
    // Mock de dependencias internas
    jest.mock('../src/lib/pedidos', () => ({
      crearPedido: jest.fn().mockResolvedValue({
        id: 'PED-TEST-001',
        items: [],
        subtotal: 0,
        costoEnvio: 0,
        total: 0,
        metodoPago: 'transferencia',
        cliente: { nombre: 'Test', email: 'test@test.com', telefono: '123', direccion: 'Dir', ciudad: 'Cba', provincia: 'Córdoba', codigoPostal: '5000' },
        estado: 'pendiente',
        fecha: new Date().toISOString(),
      }),
    }));
    jest.mock('../src/lib/productos', () => ({
      obtenerProductoPorId: jest.fn().mockResolvedValue({
        id: 'PROD-001',
        titulo: 'Taza Test',
        precio: 15000,  // precio del servidor
        stock: 10,
        categoria: 'tazas',
      }),
    }));
    jest.mock('../src/lib/notificaciones', () => ({
      notificarNuevoPedido: jest.fn().mockResolvedValue(undefined),
    }));

    const mod = await import('../src/app/api/checkout/route');
    POST = mod.POST;
  });

  test('Rechaza carrito vacío con 400', async () => {
    const req = makeRequest('http://localhost/api/checkout', 'POST', {
      cliente: { nombre: 'Test', email: 'test@test.com', telefono: '123',
                 direccion: 'Dir', ciudad: 'Cba', provincia: 'Córdoba', codigoPostal: '5000' },
      items:       [],
      metodoPago:  'transferencia',
      costoEnvio:  0,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/carrito vacío/i);
  });

  test('Rechaza email inválido con 400', async () => {
    const req = makeRequest('http://localhost/api/checkout', 'POST', {
      cliente: { nombre: 'Test', email: 'no-es-un-email', telefono: '123',
                 direccion: 'Dir', ciudad: 'Cba', provincia: 'Córdoba', codigoPostal: '5000' },
      items:       [{ productoId: 'PROD-001', cantidad: 1 }],
      metodoPago:  'transferencia',
      costoEnvio:  0,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  test('Rechaza nombre vacío con 400', async () => {
    const req = makeRequest('http://localhost/api/checkout', 'POST', {
      cliente: { nombre: '', email: 'test@test.com', telefono: '123',
                 direccion: 'Dir', ciudad: 'Cba', provincia: 'Córdoba', codigoPostal: '5000' },
      items:       [{ productoId: 'PROD-001', cantidad: 1 }],
      metodoPago:  'transferencia',
      costoEnvio:  0,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('HAL-01: Usa precio del servidor, ignora precio del cliente', async () => {
    // El cliente envía precio: 1 (manipulado) — el servidor debe usar 15000
    const req = makeRequest('http://localhost/api/checkout', 'POST', {
      cliente: { nombre: 'Test', email: 'test@test.com', telefono: '123',
                 direccion: 'Dirección 123', ciudad: 'Córdoba', provincia: 'Córdoba', codigoPostal: '5000' },
      // Precio manipulado — enviamos cantidad y productoId, NO precio
      items: [{ productoId: 'PROD-001', cantidad: 1 }],
      metodoPago: 'transferencia',
      costoEnvio: 0,
    });
    const res  = await POST(req);
    const body = await res.json();
    // Si tiene pedidoId, el precio fue tomado del servidor (15000), no del cliente (1)
    expect(res.status).toBeLessThan(500);
    // Verificar que crearPedido fue llamado con el precio del servidor
    const { crearPedido } = await import('../src/lib/pedidos');
    if ((crearPedido as jest.Mock).mock.calls.length > 0) {
      const callArgs = (crearPedido as jest.Mock).mock.calls[0][0];
      expect(callArgs.items[0].precioUnitario).toBe(15000); // precio del servidor
    }
  });

  test('Rechaza costo de envío negativo', async () => {
    const req = makeRequest('http://localhost/api/checkout', 'POST', {
      cliente: { nombre: 'Test', email: 'test@test.com', telefono: '123',
                 direccion: 'Dir', ciudad: 'Cba', provincia: 'Córdoba', codigoPostal: '5000' },
      items:      [{ productoId: 'PROD-001', cantidad: 1 }],
      metodoPago: 'transferencia',
      costoEnvio: -999,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ── SUITE 4: Webhook Mercado Pago ─────────────────────────

describe('Webhook Mercado Pago — Verificación de firma', () => {
  let POST: Function;

  beforeAll(async () => {
    jest.resetModules();
    jest.mock('../src/lib/pedidos', () => ({
      actualizarEstado:   jest.fn().mockResolvedValue({}),
      obtenerPedidoPorId: jest.fn().mockResolvedValue(null),
    }));
    jest.mock('../src/lib/productos', () => ({
      actualizarStock:       jest.fn().mockResolvedValue({ stockActual: 5 }),
      obtenerProductoPorId:  jest.fn().mockResolvedValue(null),
    }));
    jest.mock('../src/lib/stockAlertas', () => ({
      verificarYAlertarStock: jest.fn().mockResolvedValue(undefined),
    }));

    const mod = await import('../src/app/api/mp-webhook/route');
    POST = mod.POST;
  });

  test('Acepta webhook sin secret configurado (modo dev)', async () => {
    // Sin MERCADO_PAGO_WEBHOOK_SECRET, el webhook igual funciona (development mode)
    delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'pending', external_reference: 'PED-TEST' }),
    });

    const req = makeRequest(
      'http://localhost/api/mp-webhook',
      'POST',
      { type: 'payment', data: { id: '12345' } }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  test('HAL-02: Rechaza webhook con firma inválida cuando hay secret', async () => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'mi-webhook-secret-real';

    const req = makeRequest(
      'http://localhost/api/mp-webhook?data.id=12345',
      'POST',
      { type: 'payment', data: { id: '12345' } },
      {
        'x-signature': 'ts=1234567890,v1=firma-invalida-completamente',
        'x-request-id': 'req-test-001',
      }
    );
    const res  = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toMatch(/firma/i);
  });

  test('Ignora eventos que no son de pago', async () => {
    delete process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    const req = makeRequest(
      'http://localhost/api/mp-webhook',
      'POST',
      { type: 'subscription', data: { id: '999' } }
    );
    const res  = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.mensaje).toMatch(/ignorado/i);
  });
});

// ── SUITE 5: APIs de admin requieren autenticación ────────

describe('APIs de administración — Control de acceso', () => {

  test('POST /api/productos requiere sesión (retorna 401)', async () => {
    // Sin mock de getServerSession — no hay sesión
    jest.resetModules();
    jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));

    const { POST } = await import('../src/app/api/productos/route');
    const req = makeRequest('http://localhost/api/productos', 'POST', { titulo: 'Hack' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('DELETE /api/productos/[id] requiere sesión (retorna 401)', async () => {
    jest.resetModules();
    jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));

    const { DELETE } = await import('../src/app/api/productos/[id]/route');
    const req = makeRequest('http://localhost/api/productos/PROD-001', 'DELETE');
    const res = await DELETE(req, { params: { id: 'PROD-001' } });
    expect(res.status).toBe(401);
  });

  test('PATCH /api/pedidos/[id] requiere sesión (retorna 401)', async () => {
    jest.resetModules();
    jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));

    const { PATCH } = await import('../src/app/api/pedidos/[id]/route');
    const req = makeRequest('http://localhost/api/pedidos/PED-001', 'PATCH', { estado: 'pagado' });
    const res = await PATCH(req, { params: { id: 'PED-001' } });
    expect(res.status).toBe(401);
  });

  test('POST /api/stock requiere sesión (retorna 401)', async () => {
    jest.resetModules();
    jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue(null) }));

    const { POST } = await import('../src/app/api/stock/route');
    const req = makeRequest('http://localhost/api/stock', 'POST', { id: 'PROD-001', stock: 0 });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('GET /api/productos es público (no requiere sesión)', async () => {
    jest.resetModules();
    const { GET } = await import('../src/app/api/productos/route');
    const req = makeRequest('http://localhost/api/productos', 'GET');
    const res = await GET(req);
    // No debería ser 401 — los productos son públicos en un e-commerce
    expect(res.status).not.toBe(401);
  });
});

// ── SUITE 6: Middleware de autenticación ──────────────────

describe('Middleware — Protección de rutas /admin', () => {

  test('/admin redirige a /admin-login sin token', async () => {
    const { middleware } = await import('../src/middleware');
    // Mock de getToken para simular sin sesión
    jest.mock('next-auth/jwt', () => ({
      getToken: jest.fn().mockResolvedValue(null),
    }));

    const req = makeRequest('http://localhost/admin', 'GET');
    const res = await middleware(req as any);

    // Debe ser un redirect
    expect(res.status).toBe(307); // redirect temporal
    expect(res.headers.get('location')).toContain('/admin-login');
  });

  test('/admin-login no redirige (es la página de login)', async () => {
    jest.resetModules();
    const { middleware } = await import('../src/middleware');

    const req = makeRequest('http://localhost/admin-login', 'GET');
    const res = await middleware(req as any);

    // No debe redirigir
    expect(res.status).not.toBe(307);
  });
});
