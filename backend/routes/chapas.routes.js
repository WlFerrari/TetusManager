const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const ChapasController = require('../controllers/ChapasController')

/** GET /api/chapas?q=filtro */
router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.list(req, res, next))

/** GET /api/chapas/disponiveis */
router.get('/disponiveis', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.listarChapasDisponiveis(req, res, next))

/** GET /api/chapas/stats */
router.get('/stats', authMiddleware, (req, res, next) => ChapasController.stats(req, res, next))

/** GET /api/chapas/:id */
router.get('/:id', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.show(req, res, next))

/** POST /api/chapas */
router.post('/', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.create(req, res, next))

/** PUT /api/chapas/:id */
router.put('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.update(req, res, next))

/** DELETE /api/chapas/:id */
router.delete('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.delete(req, res, next))

module.exports = router
