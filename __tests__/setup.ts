// ============================================================
// CONFIGURACIÓN DE TESTS — Melocotón Cerámica
// Variables de entorno para el entorno de test
// ============================================================

// Variables de entorno necesarias para los tests
process.env.NEXTAUTH_SECRET       = 'test-secret-para-tests-unitarios-32chars';
process.env.NEXTAUTH_URL          = 'http://localhost:3000';
process.env.ADMIN_USERNAME        = 'admin';
process.env.ADMIN_PASSWORD        = 'testpassword123';
process.env.NEXT_PUBLIC_URL       = 'http://localhost:3000';
process.env.SITE_URL              = 'http://localhost:3000';
process.env.MP_ACCESS_TOKEN       = 'TEST-fake-token-for-tests';
process.env.NODE_ENV              = 'test';

// Mock de fetch global para tests
global.fetch = jest.fn();
