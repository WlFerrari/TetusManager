const jwt = require('jsonwebtoken')
const { authMiddleware, requirePerm } = require('../../middleware/auth')

// helpers
const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

const SECRET = 'test-secret'

beforeAll(() => {
  process.env.JWT_SECRET = SECRET
})

describe('authMiddleware', () => {
  it('rejects when no Authorization header', () => {
    const req = { headers: {} }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body.ok).toBe(false)
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects when Authorization header does not start with Bearer', () => {
    const req = { headers: { authorization: 'Basic abc' } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects with invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body.msg).toMatch(/inválido|expirado/)
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects with expired token', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: '-1s' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('attaches decoded payload to req.user and calls next on valid token', () => {
    const payload = { id: 1, nome: 'Test', email: 'test@test.com', perfil: 'Administrador', permissoes: { verEstoque: true } }
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toBeDefined()
    expect(req.user.id).toBe(1)
    expect(req.user.nome).toBe('Test')
    expect(req.user.permissoes.verEstoque).toBe(true)
  })
})

describe('requirePerm', () => {
  it('denies access when permission is missing', () => {
    const middleware = requirePerm('editarEstoque')
    const req = { user: { permissoes: { verEstoque: true } } }
    const res = mockRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(res.body.ok).toBe(false)
    expect(next).not.toHaveBeenCalled()
  })

  it('denies access when permission is false', () => {
    const middleware = requirePerm('editarEstoque')
    const req = { user: { permissoes: { editarEstoque: false } } }
    const res = mockRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('allows access when permission is true', () => {
    const middleware = requirePerm('editarEstoque')
    const req = { user: { permissoes: { editarEstoque: true } } }
    const res = mockRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.statusCode).toBe(200) // not changed
  })

  it('denies access when user has no permissoes object', () => {
    const middleware = requirePerm('verEstoque')
    const req = { user: {} }
    const res = mockRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('denies access when user is undefined', () => {
    const middleware = requirePerm('verEstoque')
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })
})
