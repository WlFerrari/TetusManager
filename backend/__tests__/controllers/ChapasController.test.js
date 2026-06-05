jest.mock('../../repositories/ChapaRepository')
const ChapaRepo = require('../../repositories/ChapaRepository')

const ChapasController = require('../../controllers/ChapasController')

const flushPromises = () => new Promise(setImmediate)

const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

describe('ChapasController', () => {
  beforeEach(() => jest.clearAllMocks())

  // ── list ──────────────────────────────────────────────────────────
  describe('list', () => {
    it('returns list from repository', async () => {
      ChapaRepo.findAll.mockResolvedValue([{ id: 'CH001' }])

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.list(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toHaveLength(1)
    })

    it('calls next on error', async () => {
      ChapaRepo.findAll.mockRejectedValue(new Error('fail'))

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.list(req, res, next)
      await flushPromises()

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  // ── show ──────────────────────────────────────────────────────────
  describe('show', () => {
    it('returns 404 when chapa not found', async () => {
      ChapaRepo.findById.mockResolvedValue(null)

      const req = { params: { id: 'CH999' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.show(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(404)
      expect(res.body.ok).toBe(false)
    })

    it('returns chapa when found', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001', nome: 'Granito' })

      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.show(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data.nome).toBe('Granito')
    })
  })

  // ── create ────────────────────────────────────────────────────────
  describe('create', () => {
    it('returns 400 when nome is empty', async () => {
      const req = { body: { nome: '', largura: 100, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Nome/)
    })

    it('returns 400 when nome is whitespace only', async () => {
      const req = { body: { nome: '   ', largura: 100, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when largura is zero', async () => {
      const req = { body: { nome: 'Test', largura: 0, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Largura/)
    })

    it('returns 400 when largura is negative', async () => {
      const req = { body: { nome: 'Test', largura: -1, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when comprimento is zero', async () => {
      const req = { body: { nome: 'Test', largura: 100, comprimento: 0 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Comprimento/)
    })

    it('creates chapa with valid data', async () => {
      ChapaRepo.insert.mockResolvedValue({ id: 'CH001', nome: 'Nova Chapa' })

      const req = { body: { nome: 'Nova Chapa', largura: 100, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(201)
      expect(res.body.ok).toBe(true)
      expect(ChapaRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ criadoPor: 1 })
      )
    })

    it('passes criadoPor as null when user is missing', async () => {
      ChapaRepo.insert.mockResolvedValue({ id: 'CH002', nome: 'Test' })

      const req = { body: { nome: 'Test', largura: 100, comprimento: 200 } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.create(req, res, next)
      await flushPromises()

      expect(ChapaRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ criadoPor: null })
      )
    })
  })

  // ── update ────────────────────────────────────────────────────────
  describe('update', () => {
    it('returns 400 when nome is empty', async () => {
      const req = { params: { id: 'CH001' }, body: { nome: '' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.update(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('updates chapa with valid data', async () => {
      ChapaRepo.update.mockResolvedValue({ id: 'CH001', nome: 'Updated' })

      const req = { params: { id: 'CH001' }, body: { nome: 'Updated' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.update(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
    })
  })

  // ── delete ────────────────────────────────────────────────────────
  describe('delete', () => {
    it('deletes chapa and returns it', async () => {
      ChapaRepo.delete.mockResolvedValue({ id: 'CH001', nome: 'Deleted' })

      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.delete(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data.nome).toBe('Deleted')
    })

    it('calls next on error', async () => {
      ChapaRepo.delete.mockRejectedValue(new Error('fail'))

      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.delete(req, res, next)
      await flushPromises()

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  // ── stats ─────────────────────────────────────────────────────────
  describe('stats', () => {
    it('returns stats from repository', async () => {
      ChapaRepo.stats.mockResolvedValue({ total: 10 })

      const req = {}
      const res = mockRes()
      const next = jest.fn()

      ChapasController.stats(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data.total).toBe(10)
    })
  })

  // ── aliases ───────────────────────────────────────────────────────
  describe('aliases', () => {
    it('listarChapas delegates to list', async () => {
      ChapaRepo.findAll.mockResolvedValue([])

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.listarChapas(req, res, next)
      await flushPromises()

      expect(ChapaRepo.findAll).toHaveBeenCalled()
    })

    it('consultarChapa delegates to show', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001' })

      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      ChapasController.consultarChapa(req, res, next)
      await flushPromises()

      expect(ChapaRepo.findById).toHaveBeenCalledWith('CH001')
    })
  })
})
