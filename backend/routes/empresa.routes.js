const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const EmpresaController = require('../controllers/EmpresaController')

router.get('/', authMiddleware, requirePerm('verEmpresa'), (req, res, next) => EmpresaController.show(req, res, next))
router.put('/', authMiddleware, requirePerm('verEmpresa'), (req, res, next) => EmpresaController.update(req, res, next))

module.exports = router
