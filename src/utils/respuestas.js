// Formato JSON consistente:
//   éxito: { ok: true, data: ... }
//   error: { ok: false, mensaje: "...", errores?: [...] }
const exito = (res, status, data) => res.status(status).json({ ok: true, data });

const error = (res, status, mensaje, errores) => {
  const cuerpo = { ok: false, mensaje };
  if (errores && errores.length) cuerpo.errores = errores;
  return res.status(status).json(cuerpo);
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { exito, error, asyncHandler };
