// Genera un JWT ya vencido (para la prueba 401 de token expirado en Postman).
// Cópialo en la variable de entorno "expiredToken" de Postman. No lo subas al repositorio.
require('dotenv').config();
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en .env');
  process.exit(1);
}
console.log(jwt.sign({ rol: 'usuario' }, process.env.JWT_SECRET, { subject: '1', expiresIn: -60 }));
