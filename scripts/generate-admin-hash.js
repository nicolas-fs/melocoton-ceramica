#!/usr/bin/env node
// ============================================================
// GENERADOR DE HASH PARA CONTRASEÑA DE ADMIN
// HAL-05 FIX: Almacenar contraseña hasheada con bcrypt
//
// INSTRUCCIONES:
// 1. npm install (para tener bcryptjs disponible)
// 2. node scripts/generate-admin-hash.js TU_CONTRASEÑA_AQUI
// 3. Copiar el hash generado a tu .env.local como ADMIN_PASSWORD_HASH
//    (o al panel de Vercel en producción)
//
// Ejemplo:
//   node scripts/generate-admin-hash.js Mel0c0ton2024!
//   → $2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// ============================================================

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Proporcioná la contraseña como argumento.');
  console.error('   Uso: node scripts/generate-admin-hash.js TU_CONTRASEÑA');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Error: La contraseña debe tener al menos 8 caracteres.');
  process.exit(1);
}

console.log('\n🔐 Generando hash bcrypt (costo 12)...\n');

bcrypt.hash(password, 12, (err, hash) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }

  console.log('✅ Hash generado:\n');
  console.log(`   ADMIN_PASSWORD_HASH=${hash}\n`);
  console.log('📋 Pasos siguientes:');
  console.log('   1. Copiá esa línea a tu .env.local');
  console.log('   2. En Vercel: Settings → Environment Variables → ADMIN_PASSWORD_HASH');
  console.log('   3. Podés eliminar ADMIN_PASSWORD del entorno (ya no se usará)\n');
});
