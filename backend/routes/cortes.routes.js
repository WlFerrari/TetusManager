const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const CortesController = require('../controllers/CortesController')

/** POST /api/cortes — registra um corte (cria retalhos) */
router.post('/', authMiddleware, requirePerm('registrarCorte'), (req, res, next) => {
  CortesController.registrar(req, res, next)
})

module.exports = router

