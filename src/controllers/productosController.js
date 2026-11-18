const productos = require('../data/productosRepo');
const { idValido, validarProducto } = require('../utils/validar');
const { exito, error, asyncHandler } = require('../utils/respuestas');

const listar = asyncHandler(async (req, res) => {
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : '';
  return exito(res, 200, await productos.listar(categoria));
});

const obtener = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return error(res, 400, 'El identificador del producto no es válido.');
  const producto = await productos.obtener(id);
  if (!producto) return error(res, 404, 'Producto no encontrado.');
  return exito(res, 200, producto);
});

const crear = asyncHandler(async (req, res) => {
  const { errores, datos } = validarProducto(req.body);
  if (errores.length) return error(res, 400, 'Datos del producto inválidos.', errores);
  return exito(res, 201, await productos.crear(datos));
});

const actualizar = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return error(res, 400, 'El identificador del producto no es válido.');
  const { errores, datos } = validarProducto(req.body);
  if (errores.length) return error(res, 400, 'Datos del producto inválidos.', errores);
  const producto = await productos.actualizar(id, datos);
  if (!producto) return error(res, 404, 'Producto no encontrado.');
  return exito(res, 200, producto);
});

// Al eliminar un producto, sus favoritos se borran en cascada (ON DELETE CASCADE en la BD).
const eliminar = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return error(res, 400, 'El identificador del producto no es válido.');
  const eliminado = await productos.eliminar(id);
  if (!eliminado) return error(res, 404, 'Producto no encontrado.');
  return res.status(204).send();
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
