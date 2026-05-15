/**
 * ROTAS DA API — TetusManager
 * Agregador de todas as rotas (MVC Pattern)
 *
 * Arquitetura:
 * - controllers/ → Lógica de negócio
 * - routes/ → Definição de endpoints
 * - repositories/ → Acesso a dados
 */

const router = require('express').Router()

// Importar rotas
const authRoutes = require('./auth.routes')
const chapasRoutes = require('./chapas.routes')
const cortesRoutes = require('./cortes.routes')
const retalhosRoutes = require('./retalhos.routes')
const usuariosRoutes = require('./usuarios.routes')
const empresaRoutes = require('./empresa.routes')
const meRoutes = require('./me.routes')

// Agregar rotas
router.use('/auth', authRoutes)
router.use('/chapas', chapasRoutes)
router.use('/cortes', cortesRoutes)
router.use('/retalhos', retalhosRoutes)
router.use('/usuarios', usuariosRoutes)
router.use('/empresa', empresaRoutes)
router.use('/me', meRoutes)

module.exports = router
