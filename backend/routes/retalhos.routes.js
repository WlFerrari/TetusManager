const router = require('express').Router()
const { authMiddleware, requirePerm, requireAnyPerm } = require('../middleware/auth')
const RetalhosController = require('../controllers/RetalhosController')

router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => RetalhosController.list(req, res, next))
router.get('/stats', authMiddleware, requireAnyPerm('verDashboard','verRelatorios'), (req, res, next) => RetalhosController.stats(req, res, next))
router.get('/:id', authMiddleware, requirePerm('verEstoque'), (req, res, next) => RetalhosController.show(req, res, next))
router.post('/', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.create(req, res, next))
router.put('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.update(req, res, next))
router.patch('/:id/reservar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.reserve(req, res, next))
router.patch('/:id/liberar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.release(req, res, next))
router.patch('/:id/consumir', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.consume(req, res, next))
router.patch('/:id/descartar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.discard(req, res, next))
router.patch('/:id/reativar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.reactivate(req, res, next))
router.delete('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.delete(req, res, next))

module.exports = router
