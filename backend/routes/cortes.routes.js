const router = require('express').Router()
const { authMiddleware, requirePerm, requireAnyPerm } = require('../middleware/auth')
const CortesController = require('../controllers/CortesController')

router.post('/', authMiddleware, requirePerm('registrarCorte'), (req, res, next) => {
  CortesController.registrar(req, res, next)
})

router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => {
  CortesController.list(req, res, next)
})

router.get('/stats', authMiddleware, requireAnyPerm('verDashboard','verRelatorios'), (req, res, next) => {
  CortesController.stats(req, res, next)
})

module.exports = router
