const db = require('../config/db');

const mapear = (r) => ({
  id: r.id,
  nombre: r.nombre,
  descripcion: r.descripcion,
  categoria: r.categoria,
  precio: Number(r.precio), // NUMERIC llega como texto desde pg
});

async function listar(categoria) {
  if (categoria) {
    const { rows } = await db.query('SELECT * FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY id', [categoria]);
    return rows.map(mapear);
  }
  const { rows } = await db.query('SELECT * FROM productos ORDER BY id');
  return rows.map(mapear);
}

async function obtener(id) {
  const { rows } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
  return rows[0] ? mapear(rows[0]) : null;
}

async function crear({ nombre, descripcion, categoria, precio }) {
  const { rows } = await db.query(
    'INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, descripcion, categoria, precio]
  );
  return mapear(rows[0]);
}

async function actualizar(id, { nombre, descripcion, categoria, precio }) {
  const { rows } = await db.query(
    'UPDATE productos SET nombre = $1, descripcion = $2, categoria = $3, precio = $4 WHERE id = $5 RETURNING *',
    [nombre, descripcion, categoria, precio, id]
  );
  return rows[0] ? mapear(rows[0]) : null;
}

async function eliminar(id) {
  const { rowCount } = await db.query('DELETE FROM productos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
