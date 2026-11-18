// Crea las tablas y carga los productos de ejemplo si la tabla está vacía.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

(async () => {
  try {
    await db.query(fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8'));
    console.log('Tablas creadas/verificadas.');
    const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM productos');
    if (rows[0].n === 0) {
      await db.query(fs.readFileSync(path.join(__dirname, '../sql/seed.sql'), 'utf8'));
      console.log('Productos de ejemplo insertados.');
    } else {
      console.log(`Ya existen ${rows[0].n} productos; no se insertan datos de ejemplo.`);
    }
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
