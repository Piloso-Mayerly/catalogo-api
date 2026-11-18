const favoritos = require('../data/favoritosRepo');
const productos = require('../data/productosRepo');
const { idValido } = require('../utils/validar');
const { exito, error, asyncHandler } = require('../utils/respuestas');

// En todas las operaciones el usuario sale de req.user (token verificado), nunca del cliente.
const listar = asyncHandler(async (req, res) => {
  return exito(res, 200, await favoritos.listar(req.user.id));
});

const agregar = asyncHandler(async (req, res) => {
  const productoId = idValido(req.body && req.body.productoId);
  if (!productoId) return error(res, 400, 'productoId es obligatorio y debe ser un entero positivo.');

  const producto = await productos.obtener(productoId);
  if (!producto) return error(res, 404, 'El producto no existe.');

  try {
    const favorito = await favoritos.agregar(req.user.id, productoId);
    return exito(res, 201, { ...favorito, producto });
  } catch (err) {
    if (err.code === '23505') return error(res, 409, 'El producto ya está en tus favoritos.');
    if (err.code === '23503') return error(res, 404, 'El producto no existe.');
    throw err;
  }
});

const quitar = asyncHandler(async (req, res) => {
  const productoId = idValido(req.params.productoId);
  if (!productoId) return error(res, 400, 'El identificador del producto no es válido.');
  const quitado = await favoritos.quitar(req.user.id, productoId);
  if (!quitado) return error(res, 404, 'Ese producto no está en tus favoritos.');
  return res.status(204).send();
});

module.exports = { listar, agregar, quitar };
