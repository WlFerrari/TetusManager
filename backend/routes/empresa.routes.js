const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const EmpresaController = require('../controllers/EmpresaController')

/** GET /api/empresa */
router.get('/', authMiddleware, (req, res, next) => EmpresaController.show(req, res, next))

/** PUT /api/empresa */
router.put('/', authMiddleware, requirePerm('verEmpresa'), (req, res, next) => EmpresaController.update(req, res, next))

module.exports = router

