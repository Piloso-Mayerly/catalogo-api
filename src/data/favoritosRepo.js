const db = require('../config/db');

async function listar(usuarioId) {
  const { rows } = await db.query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio, f.creado_en AS agregado_en
       FROM favoritos f
       JOIN productos p ON p.id = f.producto_id
      WHERE f.usuario_id = $1
      ORDER BY f.creado_en DESC`,
    [usuarioId]
  );
  return rows.map((r) => ({ ...r, precio: Number(r.precio) }));
}

async function agregar(usuarioId, productoId) {
  const { rows } = await db.query(
    'INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2) RETURNING producto_id, creado_en',
    [usuarioId, productoId]
  );
  return { productoId: rows[0].producto_id, agregadoEn: rows[0].creado_en };
}

// El filtro por usuario_id garantiza que nadie pueda quitar favoritos ajenos.
async function quitar(usuarioId, productoId) {
  const { rowCount } = await db.query('DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2', [usuarioId, productoId]);
  return rowCount > 0;
}

module.exports = { listar, agregar, quitar };
