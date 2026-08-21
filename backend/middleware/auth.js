/**
 * MIDDLEWARE DE AUTENTICAÇÃO JWT
 * Protege todas as rotas que precisam de login.
 * O token é enviado no header: Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok:false, msg:'Token não fornecido.' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ ok:false, msg:'Token inválido ou expirado.' })
  }
}

function requirePerm(perm) {
  return (req, res, next) => {
    const perms = req.user?.permissoes || {}
    if (!perms[perm]) {
      return res.status(403).json({ ok:false, msg:`Acesso negado: permissão "${perm}" necessária.` })
    }
    next()
  }
}

function requireAnyPerm(...required) {
  return (req, res, next) => {
    const perms = req.user?.permissoes || {}
    if (!required.some(perm => perms[perm])) {
      return res.status(403).json({ ok:false, msg:'Acesso negado para esta operação.' })
    }
    next()
  }
}

module.exports = { authMiddleware, requirePerm, requireAnyPerm }
