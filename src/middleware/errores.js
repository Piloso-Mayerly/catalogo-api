const { error } = require('../utils/respuestas');

const noEncontrada = (req, res) => error(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);

// Manejador global: nunca expone detalles internos ni secretos al cliente.
// eslint-disable-next-line no-unused-vars
const manejadorErrores = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return error(res, 400, 'El cuerpo de la petición no es un JSON válido.');
  if (err.type === 'entity.too.large') return error(res, 413, 'El cuerpo de la petición es demasiado grande.');
  console.error('[ERROR]', err.message);
  return error(res, 500, 'Error interno del servidor.');
};

module.exports = { noEncontrada, manejadorErrores };
