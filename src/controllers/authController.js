const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarios = require('../data/usuariosRepo');
const { validarRegistro, validarLogin } = require('../utils/validar');
const { exito, error, asyncHandler } = require('../utils/respuestas');

// Hash falso para igualar el tiempo de respuesta cuando el correo no existe.
const HASH_FALSO = bcrypt.hashSync('contraseña-inexistente', 10);

const registro = asyncHandler(async (req, res) => {
  const { errores, datos } = validarRegistro(req.body);
  if (errores.length) return error(res, 400, 'Datos de registro inválidos.', errores);

  const passwordHash = await bcrypt.hash(datos.password, 10);
  try {
    // El rol NUNCA se toma del cuerpo de la petición: el registro público siempre crea "usuario".
    const usuario = await usuarios.crear({ nombre: datos.nombre, correo: datos.correo, passwordHash, rol: 'usuario' });
    return exito(res, 201, usuario);
  } catch (err) {
    if (err.code === '23505') return error(res, 409, 'Ya existe un usuario con ese correo.');
    throw err;
  }
});

const login = asyncHandler(async (req, res) => {
  const { errores, datos } = validarLogin(req.body);
  if (errores.length) return error(res, 400, 'Datos de inicio de sesión inválidos.', errores);

  const usuario = await usuarios.buscarPorCorreo(datos.correo);
  const coincide = await bcrypt.compare(datos.password, usuario ? usuario.password_hash : HASH_FALSO);
  if (!usuario || !coincide) return error(res, 401, 'Credenciales incorrectas.');

  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  const token = jwt.sign({ rol: usuario.rol }, process.env.JWT_SECRET, {
    subject: String(usuario.id),
    expiresIn,
    algorithm: 'HS256',
  });

  return exito(res, 200, { token, tipo: 'Bearer', expiraEn: expiresIn, usuario: usuarios.publico(usuario) });
});

module.exports = { registro, login };
