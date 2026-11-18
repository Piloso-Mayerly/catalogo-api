// Crea (o promueve) el usuario administrador usando variables de entorno.
// Es el ÚNICO camino para obtener el rol admin: el registro público nunca lo permite.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

(async () => {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const correo = (process.env.ADMIN_CORREO || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!correo || password.length < 8) {
    console.error('Define ADMIN_CORREO y ADMIN_PASSWORD (mínimo 8 caracteres) en .env');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (correo) DO UPDATE SET rol = 'admin', password_hash = EXCLUDED.password_hash, nombre = EXCLUDED.nombre`,
      [nombre, correo, hash]
    );
    console.log(`Administrador listo: ${correo}`);
  } catch (err) {
    console.error('Error al crear el administrador:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
