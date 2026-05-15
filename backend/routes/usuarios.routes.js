const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const UsuariosController = require('../controllers/UsuariosController')

/** GET /api/usuarios */
router.get('/', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.list(req, res, next))

/** GET /api/usuarios/:id */
router.get('/:id', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.show(req, res, next))

/** POST /api/usuarios */
router.post('/', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.create(req, res, next))

/** PUT /api/usuarios/:id */
router.put('/:id', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.update(req, res, next))

/** PATCH /api/usuarios/:id/permissoes */
router.patch('/:id/permissoes', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.updatePermissions(req, res, next))

/** PATCH /api/usuarios/:id/reset-permissoes */
router.patch('/:id/reset-permissoes', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.resetPermissions(req, res, next))

/** PATCH /api/usuarios/:id/toggle — DELETE lógico */
router.patch('/:id/toggle', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.toggle(req, res, next))

/** DELETE /api/usuarios/:id — DELETE físico */
router.delete('/:id', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.delete(req, res, next))

module.exports = router

