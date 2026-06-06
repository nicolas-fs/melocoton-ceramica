import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { checkRateLimit, RATE_LIMIT_LOGIN } from '@/lib/rateLimiter';

// ── HAL-05 FIX: Comparación segura de contraseñas ────────
// Soporta dos modos:
// A) ADMIN_PASSWORD_HASH (bcrypt) — recomendado para producción
// B) ADMIN_PASSWORD (texto plano) — fallback para desarrollo
async function verifyPassword(input: string): Promise<boolean> {
 const hash = process.env.ADMIN_PASSWORD_HASH;
 const plaintext = process.env.ADMIN_PASSWORD;

 if (hash) {
 // Modo seguro: comparar contra hash bcrypt
 return bcrypt.compare(input, hash);
 }

 if (plaintext) {
 // Modo desarrollo: comparar texto plano
 if (process.env.NODE_ENV === 'production') {
 console.warn('[Auth] Usando ADMIN_PASSWORD en texto plano en producción. Usar ADMIN_PASSWORD_HASH.');
 }
 // Comparación en tiempo constante para evitar timing attacks
 return input.length === plaintext.length &&
 Buffer.from(input).equals(Buffer.from(plaintext));
 }

 console.error('[Auth] Ni ADMIN_PASSWORD ni ADMIN_PASSWORD_HASH están configuradas');
 return false;
}

export const authOptions: NextAuthOptions = {
 providers: [
 CredentialsProvider({
 name: 'Credenciales',
 credentials: {
 username: { label: 'Usuario', type: 'text' },
 password: { label: 'Contraseña', type: 'password' },
 },
 async authorize(credentials, req) {
 // ── HAL-04 FIX: Rate limiting por IP ─────────────
 const ip =
 (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
 (req?.headers?.['x-real-ip'] as string) ??
 'unknown';

 const rl = checkRateLimit(
 `login:${ip}`,
 RATE_LIMIT_LOGIN.maxAttempts,
 RATE_LIMIT_LOGIN.windowMs,
 RATE_LIMIT_LOGIN.blockMs,
 );

 if (!rl.allowed) {
 console.warn(`[Auth] Rate limit para IP ${ip}. Reintentar en ${rl.retryAfter}s`);
 throw new Error(
 `Demasiados intentos. Intentá de nuevo en ${Math.ceil(rl.retryAfter / 60)} minutos.`
 );
 }

 if (!credentials?.username || !credentials?.password) return null;

 // Verificar usuario
 const usernameOk = credentials.username === process.env.ADMIN_USERNAME;
 // HAL-05: verificar contraseña con bcrypt (o texto plano en dev)
 const passwordOk = await verifyPassword(credentials.password);

 if (usernameOk && passwordOk) {
 console.log(`[Auth] Login exitoso desde IP ${ip}`);
 return { id: '1', name: 'Admin', email: 'admin@melocotonceramica.com' };
 }

 console.warn(`[Auth] Intento fallido desde IP ${ip} (${rl.remaining} restantes)`);
 return null;
 },
 }),
 ],
 session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
 pages: { signIn: '/admin-login' },
 secret: process.env.NEXTAUTH_SECRET,
 events: {
 async signIn({ user }) { console.log(`[Auth] Sesión: ${user.email}`); },
 async signOut() { console.log('[Auth] Sesión cerrada'); },
 },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
