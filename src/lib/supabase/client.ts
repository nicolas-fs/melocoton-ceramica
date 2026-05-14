import { createClient } from '@supabase/supabase-js';

// ============================================================
// CLIENTE DE SUPABASE — Melocotón Cerámica
//
// Variables necesarias en .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...  (solo para operaciones de escritura en server)
// ============================================================

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente público — para lecturas desde el navegador
export const supabase = createClient(supabaseUrl, supabaseAnon);

// Cliente con service role — para escrituras desde el servidor (APIs)
// NUNCA exponer esta key al cliente
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada');
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
