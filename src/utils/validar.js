// Validaciones del lado del servidor. Devuelven datos limpios (lista blanca de campos) y errores.

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_INT = 2147483647;

function texto(v) {
  return typeof v === 'string' ? v.trim() : '';
}

// Acepta 5 o "5". Rechaza 0, negativos, decimales, texto y valores gigantes.
function idValido(v) {
  const s = String(v ?? '').trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && n <= MAX_INT ? n : null;
}

function validarRegistro(body = {}) {
  const errores = [];
  const nombre = texto(body.nombre);
  const correo = texto(body.correo).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!nombre) errores.push('El nombre es obligatorio.');
  else if (nombre.length > 100) errores.push('El nombre no puede superar 100 caracteres.');
  if (!correo) errores.push('El correo es obligatorio.');
  else if (!REGEX_CORREO.test(correo) || correo.length > 255) errores.push('El correo no tiene un formato válido.');
  if (password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.');
  else if (password.length > 72) errores.push('La contraseña no puede superar 72 caracteres.');

  return { errores, datos: { nombre, correo, password } };
}

function validarLogin(body = {}) {
  const errores = [];
  const correo = texto(body.correo).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!correo) errores.push('El correo es obligatorio.');
  if (!password) errores.push('La contraseña es obligatoria.');
  return { errores, datos: { correo, password } };
}

function validarProducto(body = {}) {
  const errores = [];
  const nombre = texto(body.nombre);
  const descripcion = texto(body.descripcion);
  const categoria = texto(body.categoria);
  const precio = body.precio;

  if (!nombre) errores.push('El nombre es obligatorio.');
  else if (nombre.length > 150) errores.push('El nombre no puede superar 150 caracteres.');
  if (!descripcion) errores.push('La descripción es obligatoria.');
  if (!categoria) errores.push('La categoría es obligatoria.');
  else if (categoria.length > 80) errores.push('La categoría no puede superar 80 caracteres.');
  if (typeof precio !== 'number' || !Number.isFinite(precio)) errores.push('El precio debe ser un número.');
  else if (precio <= 0) errores.push('El precio debe ser mayor que cero.');
  else if (precio >= 100000000) errores.push('El precio es demasiado grande.');

  return { errores, datos: { nombre, descripcion, categoria, precio } };
}

module.exports = { idValido, validarRegistro, validarLogin, validarProducto };
