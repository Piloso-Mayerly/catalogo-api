const db = require('../config/db');

// Todas las consultas son parametrizadas ($1, $2...) para evitar inyección SQL.
const publico = (r) => ({ id: r.id, nombre: r.nombre, correo: r.correo, rol: r.rol });

async function crear({ nombre, correo, passwordHash, rol = 'usuario' }) {
  const { rows } = await db.query(
    'INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, rol',
    [nombre, correo, passwordHash, rol]
  );
  return publico(rows[0]);
}

// Devuelve el hash: solo para uso interno del login. Nunca se envía al cliente.
async function buscarPorCorreo(correo) {
  const { rows } = await db.query('SELECT id, nombre, correo, rol, password_hash FROM usuarios WHERE correo = $1', [correo]);
  return rows[0] || null;
}

module.exports = { crear, buscarPorCorreo, publico };
