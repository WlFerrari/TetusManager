const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const CortesController = require('../controllers/CortesController')

/** POST /api/cortes — registra um corte (cria retalhos) */
router.post('/', authMiddleware, requirePerm('registrarCorte'), (req, res, next) => {
  CortesController.registrar(req, res, next)
})

/** GET /api/cortes?chapaId=&retalhoId=&osNumero=&limit= */
router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => {
  CortesController.list(req, res, next)
})

/** GET /api/cortes/stats */
router.get('/stats', authMiddleware, requirePerm('verRelatorios'), (req, res, next) => {
  CortesController.stats(req, res, next)
})

module.exports = router

