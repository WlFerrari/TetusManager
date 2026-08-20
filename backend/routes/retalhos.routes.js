const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const RetalhosController = require('../controllers/RetalhosController')

/** GET /api/retalhos?q=filtro */
router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => RetalhosController.list(req, res, next))

/** GET /api/retalhos/stats */
router.get('/stats', authMiddleware, (req, res, next) => RetalhosController.stats(req, res, next))

/** GET /api/retalhos/:id */
router.get('/:id', authMiddleware, requirePerm('verEstoque'), (req, res, next) => RetalhosController.show(req, res, next))

/** POST /api/retalhos — também aceita retalho manual/legado sem origem */
router.post('/', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.create(req, res, next))

/** PUT /api/retalhos/:id */
router.put('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.update(req, res, next))

/** PATCH /api/retalhos/:id/reservar */
router.patch('/:id/reservar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.reserve(req, res, next))

/** PATCH /api/retalhos/:id/liberar */
router.patch('/:id/liberar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.release(req, res, next))

/** PATCH /api/retalhos/:id/consumir — baixa lógica */
router.patch('/:id/consumir', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.consume(req, res, next))

/** PATCH /api/retalhos/:id/descartar — descarte lógico */
router.patch('/:id/descartar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.discard(req, res, next))

/** DELETE legado — mantido por compatibilidade, executa descarte lógico */
router.delete('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.delete(req, res, next))

module.exports = router
