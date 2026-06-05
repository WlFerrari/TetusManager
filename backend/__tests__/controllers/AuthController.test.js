const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

jest.mock('../../repositories/UserRepository')
const UserRepo = require('../../repositories/UserRepository')

const AuthController = require('../../controllers/AuthController')

const SECRET = 'test-secret'

beforeAll(() => {
  process.env.JWT_SECRET = SECRET
  process.env.JWT_EXPIRES_IN = '1h'
})

const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

describe('AuthController.login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when email is missing', async () => {
    const req = { body: { senha: '123456' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(400)
    expect(res.body.ok).toBe(false)
    expect(res.body.msg).toMatch(/obrigatório/)
  })

  it('returns 400 when senha is missing', async () => {
    const req = { body: { email: 'test@test.com' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(400)
    expect(res.body.ok).toBe(false)
  })

  it('returns 400 when both fields are missing', async () => {
    const req = { body: {} }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(400)
  })

  it('returns 401 when user not found', async () => {
    UserRepo.findByEmail.mockResolvedValue(null)

    const req = { body: { email: 'unknown@test.com', senha: '123456' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body.msg).toMatch(/não encontrado|inativa/)
  })

  it('returns 401 when account is inactive', async () => {
    UserRepo.findByEmail.mockResolvedValue({
      id: 1, nome: 'Test', email: 'test@test.com',
      status: 'Inativo', senha_hash: 'hash',
    })

    const req = { body: { email: 'test@test.com', senha: '123456' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body.msg).toMatch(/inativa/)
  })

  it('returns 401 when password is wrong', async () => {
    const hash = await bcrypt.hash('correctpass', 10)
    UserRepo.findByEmail.mockResolvedValue({
      id: 1, nome: 'Test', email: 'test@test.com',
      status: 'Ativo', senha_hash: hash,
      perfil: 'Administrador', permissoes: {},
    })

    const req = { body: { email: 'test@test.com', senha: 'wrongpass' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body.msg).toMatch(/incorreta/)
  })

  it('returns token and user on successful login', async () => {
    const hash = await bcrypt.hash('123456', 10)
    const mockRow = {
      id: 1, nome: 'Admin', email: 'admin@test.com',
      status: 'Ativo', senha_hash: hash,
      perfil: 'Administrador', permissoes: { verDashboard: true },
      foto: null, telefone: '', cargo: 'Dev',
    }
    UserRepo.findByEmail.mockResolvedValue(mockRow)

    const req = { body: { email: 'admin@test.com', senha: '123456' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.id).toBe(1)
    expect(res.body.data.user.nome).toBe('Admin')
    expect(res.body.data.user.email).toBe('admin@test.com')

    // verify JWT is valid
    const decoded = jwt.verify(res.body.data.token, SECRET)
    expect(decoded.id).toBe(1)
  })

  it('calls next on unexpected error', async () => {
    UserRepo.findByEmail.mockRejectedValue(new Error('DB down'))

    const req = { body: { email: 'test@test.com', senha: '123456' } }
    const res = mockRes()
    const next = jest.fn()

    await AuthController.login(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
