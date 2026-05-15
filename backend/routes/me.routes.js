const router = require('express').Router()
const { authMiddleware } = require('../middleware/auth')
const UsuariosController = require('../controllers/UsuariosController')

/** GET /api/me */
router.get('/', authMiddleware, (req, res, next) => UsuariosController.me(req, res, next))

/** PATCH /api/me/perfil */
router.patch('/perfil', authMiddleware, (req, res, next) => UsuariosController.updateProfile(req, res, next))

/** PATCH /api/me/senha */
router.patch('/senha', authMiddleware, (req, res, next) => UsuariosController.changePassword(req, res, next))

module.exports = router

