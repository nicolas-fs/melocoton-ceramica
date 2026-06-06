// ============================================================
// TESTS UNITARIOS — Rate Limiter
// ============================================================

import { checkRateLimit, getClientIp } from '../src/lib/rateLimiter';

describe('checkRateLimit', () => {

  test('Primer intento siempre permitido', () => {
    const key    = `test:${Date.now()}:a`;
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  test('Bloquea al superar el límite', () => {
    const key = `test:${Date.now()}:b`;
    for (let i = 0; i < 5; i++) checkRateLimit(key, 5, 60_000);
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  test('Claves distintas son independientes', () => {
    const ts   = Date.now();
    const keyA = `test:${ts}:c`;
    const keyB = `test:${ts}:d`;
    for (let i = 0; i < 5; i++) checkRateLimit(keyA, 3, 60_000);
    const blockedA = checkRateLimit(keyA, 3, 60_000);
    const allowedB = checkRateLimit(keyB, 3, 60_000);
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });

  test('remaining decrementa correctamente', () => {
    const key = `test:${Date.now()}:e`;
    const r1  = checkRateLimit(key, 5, 60_000);
    const r2  = checkRateLimit(key, 5, 60_000);
    const r3  = checkRateLimit(key, 5, 60_000);
    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  test('retryAfter es 0 cuando está permitido', () => {
    const key    = `test:${Date.now()}:f`;
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.retryAfter).toBe(0);
  });
});

describe('getClientIp', () => {
  test('Lee IP de x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  test('Devuelve "unknown" si no hay headers de IP', () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});
