const bcrypt = require('bcryptjs')

jest.mock('../../repositories/UserRepository')
const UserRepo = require('../../repositories/UserRepository')

const UsuariosController = require('../../controllers/UsuariosController')

const flushPromises = () => new Promise(setImmediate)

const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

describe('UsuariosController', () => {
  beforeEach(() => jest.clearAllMocks())

  // ── list ──────────────────────────────────────────────────────────
  describe('list', () => {
    it('returns all users', async () => {
      UserRepo.findAll.mockResolvedValue([{ id: 1, nome: 'Admin' }])

      const req = { query: { q: '' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.list(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toHaveLength(1)
    })

    it('passes search query to repository', async () => {
      UserRepo.findAll.mockResolvedValue([])

      const req = { query: { q: 'admin' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.list(req, res, next)
      await flushPromises()

      expect(UserRepo.findAll).toHaveBeenCalledWith('admin')
    })
  })

  // ── show ──────────────────────────────────────────────────────────
  describe('show', () => {
    it('returns 404 when user not found', async () => {
      UserRepo.findById.mockResolvedValue(null)

      const req = { params: { id: 999 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.show(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(404)
      expect(res.body.ok).toBe(false)
    })

    it('returns user when found', async () => {
      UserRepo.findById.mockResolvedValue({ id: 1, nome: 'Admin' })

      const req = { params: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.show(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data.nome).toBe('Admin')
    })
  })

  // ── create ────────────────────────────────────────────────────────
  describe('create', () => {
    it('returns 400 when nome is empty', async () => {
      const req = { body: { nome: '', email: 'a@b.com', perfil: 'Vendedor', senha: '123456' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Nome/)
    })

    it('returns 400 when email is invalid', async () => {
      const req = { body: { nome: 'Test', email: 'invalid', perfil: 'Vendedor', senha: '123456' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/E-mail/)
    })

    it('returns 400 when email has no domain', async () => {
      const req = { body: { nome: 'Test', email: 'test@', perfil: 'Vendedor', senha: '123456' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when senha is missing', async () => {
      const req = { body: { nome: 'Test', email: 'a@b.com', perfil: 'Vendedor' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Senha/)
    })

    it('returns 400 when senha is too short', async () => {
      const req = { body: { nome: 'Test', email: 'a@b.com', perfil: 'Vendedor', senha: '12345' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Senha/)
    })

    it('returns 400 when email already exists', async () => {
      UserRepo.findByEmail.mockResolvedValue({ id: 1 })

      const req = { body: { nome: 'Test', email: 'existing@test.com', perfil: 'Vendedor', senha: '123456' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/cadastrado/)
    })

    it('creates user with default Vendedor permissions when profile unknown', async () => {
      UserRepo.findByEmail.mockResolvedValue(null)
      UserRepo.insert.mockResolvedValue({ id: 2, nome: 'New User' })

      const req = { body: { nome: 'New User', email: 'new@test.com', perfil: 'Unknown', senha: '123456' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(201)
      expect(UserRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          permissoes: expect.objectContaining({ editarEstoque: false }),
        })
      )
    })

    it('creates user with Administrador permissions', async () => {
      UserRepo.findByEmail.mockResolvedValue(null)
      UserRepo.insert.mockResolvedValue({ id: 3, nome: 'Admin' })

      const req = { body: { nome: 'Admin', email: 'admin@test.com', perfil: 'Administrador', senha: '123456' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(201)
      expect(UserRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          permissoes: expect.objectContaining({ gerenciarUsuarios: true }),
        })
      )
    })
  })

  // ── updatePermissions ─────────────────────────────────────────────
  describe('updatePermissions', () => {
    it('returns 404 when user not found', async () => {
      UserRepo.findById.mockResolvedValue(null)

      const req = { params: { id: 999 }, body: { permissoes: {} } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.updatePermissions(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(404)
    })

    it('returns 400 when trying to change Admin permissions', async () => {
      UserRepo.findById.mockResolvedValue({ id: 1, perfil: 'Administrador' })

      const req = { params: { id: 1 }, body: { permissoes: { verEstoque: false } } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.updatePermissions(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Administrador/)
    })

    it('updates permissions for non-admin user', async () => {
      UserRepo.findById.mockResolvedValue({ id: 2, perfil: 'Vendedor' })
      UserRepo.updatePermissoes.mockResolvedValue({ id: 2, permissoes: { verEstoque: true } })

      const req = { params: { id: 2 }, body: { permissoes: { verEstoque: true } } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.updatePermissions(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
    })
  })

  // ── resetPermissions ──────────────────────────────────────────────
  describe('resetPermissions', () => {
    it('returns 404 when user not found', async () => {
      UserRepo.findById.mockResolvedValue(null)

      const req = { params: { id: 999 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.resetPermissions(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(404)
    })

    it('returns 400 for Administrador', async () => {
      UserRepo.findById.mockResolvedValue({ id: 1, perfil: 'Administrador' })

      const req = { params: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.resetPermissions(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('resets to profile defaults for Estoquista', async () => {
      UserRepo.findById.mockResolvedValue({ id: 2, perfil: 'Estoquista' })
      UserRepo.updatePermissoes.mockResolvedValue({ id: 2 })

      const req = { params: { id: 2 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.resetPermissions(req, res, next)
      await flushPromises()

      expect(UserRepo.updatePermissoes).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ editarEstoque: true, gerenciarUsuarios: false })
      )
    })
  })

  // ── toggle ────────────────────────────────────────────────────────
  describe('toggle', () => {
    it('toggles user status', async () => {
      UserRepo.toggleStatus.mockResolvedValue({ id: 1, status: 'Inativo' })

      const req = { params: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.toggle(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.msg).toMatch(/inativado/)
    })

    it('shows ativado message when status becomes Ativo', async () => {
      UserRepo.toggleStatus.mockResolvedValue({ id: 1, status: 'Ativo' })

      const req = { params: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.toggle(req, res, next)
      await flushPromises()

      expect(res.body.msg).toMatch(/ativado/)
    })
  })

  // ── delete ────────────────────────────────────────────────────────
  describe('delete', () => {
    it('deletes user and returns it', async () => {
      UserRepo.delete.mockResolvedValue({ id: 1, nome: 'Deleted' })

      const req = { params: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.delete(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data.nome).toBe('Deleted')
    })
  })

  // ── updateProfile ─────────────────────────────────────────────────
  describe('updateProfile', () => {
    it('returns 400 when nome is empty', async () => {
      const req = { body: { nome: '' }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.updateProfile(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('updates profile with valid data', async () => {
      UserRepo.update.mockResolvedValue({ id: 1, nome: 'Updated' })

      const req = {
        body: { nome: 'Updated', telefone: '123', cargo: 'Dev', foto: null },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.updateProfile(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(UserRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ nome: 'Updated' }))
    })
  })

  // ── changePassword ────────────────────────────────────────────────
  describe('changePassword', () => {
    it('returns 400 when senhaAtual is missing', async () => {
      const req = { body: { novaSenha: 'newpass123' }, user: { id: 1, email: 'a@b.com' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.changePassword(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when novaSenha is missing', async () => {
      const req = { body: { senhaAtual: 'oldpass' }, user: { id: 1, email: 'a@b.com' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.changePassword(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when novaSenha is too short', async () => {
      const req = { body: { senhaAtual: 'oldpass', novaSenha: '12345' }, user: { id: 1, email: 'a@b.com' } }
      const res = mockRes()
      const next = jest.fn()

      UsuariosController.changePassword(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/mínimo/)
    })

    it('returns 401 when current password is wrong', async () => {
      const hash = await bcrypt.hash('correct', 10)
      UserRepo.findByEmail.mockResolvedValue({ id: 1, senha_hash: hash })

      const req = {
        body: { senhaAtual: 'wrong', novaSenha: 'newpassword' },
        user: { id: 1, email: 'a@b.com' },
      }
      const res = mockRes()
      const next = jest.fn()

      const p = UsuariosController.changePassword(req, res, next)
      await flushPromises()
      await p
      await flushPromises()

      expect(res.statusCode).toBe(401)
    })

    it('changes password successfully', async () => {
      const hash = await bcrypt.hash('oldpass', 10)
      UserRepo.findByEmail.mockResolvedValue({ id: 1, senha_hash: hash })
      UserRepo.updateSenha.mockResolvedValue()

      const req = {
        body: { senhaAtual: 'oldpass', novaSenha: 'newpassword' },
        user: { id: 1, email: 'a@b.com' },
      }
      const res = mockRes()
      const next = jest.fn()

      const p = UsuariosController.changePassword(req, res, next)
      await flushPromises()
      await p
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(UserRepo.updateSenha).toHaveBeenCalledWith(1, 'newpassword')
    })
  })
})
