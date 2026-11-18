const router = require('express').Router();
const c = require('../controllers/favoritosController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken); // todas las rutas de favoritos requieren autenticación

router.get('/', c.listar);
router.post('/', c.agregar);
router.delete('/:productoId', c.quitar);

module.exports = router;
