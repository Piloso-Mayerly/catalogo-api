const router = require('express').Router();
const c = require('../controllers/productosController');
const { verificarToken, requerirRol } = require('../middleware/auth');

// Públicas
router.get('/', c.listar);
router.get('/:id', c.obtener);

// Solo administrador
router.post('/', verificarToken, requerirRol('admin'), c.crear);
router.put('/:id', verificarToken, requerirRol('admin'), c.actualizar);
router.delete('/:id', verificarToken, requerirRol('admin'), c.eliminar);

module.exports = router;
