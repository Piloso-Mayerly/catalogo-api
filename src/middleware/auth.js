const jwt = require('jsonwebtoken');
const { error } = require('../utils/respuestas');

// Verifica firma y vencimiento del JWT. La identidad (id y rol) sale SIEMPRE del token verificado.
function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return error(res, 401, 'Token requerido. Envía el encabezado Authorization: Bearer <token>.');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: Number(payload.sub), rol: payload.rol };
    return next();
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'El token ha vencido. Inicia sesión de nuevo.' : 'Token inválido.';
    return error(res, 401, mensaje);
  }
}

// Autorización por rol. Debe usarse después de verificarToken.
const requerirRol = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return error(res, 403, 'No tienes permisos para realizar esta acción.');
  }
  return next();
};

module.exports = { verificarToken, requerirRol };
