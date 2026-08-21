const router = require('express').Router()
const { authMiddleware, requirePerm, requireAnyPerm } = require('../middleware/auth')
const ChapasController = require('../controllers/ChapasController')

router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.list(req, res, next))
router.get('/disponiveis', authMiddleware, requirePerm('registrarCorte'), (req, res, next) => ChapasController.listarChapasDisponiveis(req, res, next))
router.get('/stats', authMiddleware, requireAnyPerm('verDashboard','verRelatorios'), (req, res, next) => ChapasController.stats(req, res, next))
router.get('/:id', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.show(req, res, next))
router.post('/', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.create(req, res, next))
router.put('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.update(req, res, next))
router.patch('/:id/reativar', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.reactivate(req, res, next))
router.delete('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.delete(req, res, next))

module.exports = router
