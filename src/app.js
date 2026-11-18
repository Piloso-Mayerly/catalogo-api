const express = require('express');
const { noEncontrada, manejadorErrores } = require('./middleware/errores');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/api/salud', (req, res) => res.json({ ok: true, data: { estado: 'activo' } }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/favoritos', require('./routes/favoritos'));

app.use(noEncontrada);
app.use(manejadorErrores);

module.exports = app;
