jest.mock('../../repositories/ChapaRepository')
const ChapaRepo = require('../../repositories/ChapaRepository')

const ChapasController = require('../../controllers/ChapasController')

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
      const mockData = [{ id: 'CH001', nome: 'Chapa 1' }]
      ChapaRepo.findAll.mockResolvedValue(mockData)

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.list(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockData)
    })

    it('calls next on error', async () => {
      ChapaRepo.findAll.mockRejectedValue(new Error('fail'))

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.list(req, res, next)

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

      await ChapasController.show(req, res, next)

      expect(res.statusCode).toBe(404)
      expect(res.body.ok).toBe(false)
    })

    it('returns chapa when found', async () => {
      const mockChapa = { id: 'CH001', nome: 'Chapa 1' }
      ChapaRepo.findById.mockResolvedValue(mockChapa)

      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.show(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockChapa)
    })
  })

  // ── create ────────────────────────────────────────────────────────
  describe('create', () => {
    it('returns 400 when nome is empty', async () => {
      const req = { body: { nome: '', largura: 100, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Nome/)
    })

    it('returns 400 when nome is whitespace only', async () => {
      const req = { body: { nome: '   ', largura: 100, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when largura is zero', async () => {
      const req = { body: { nome: 'Test', largura: 0, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Largura/)
    })

    it('returns 400 when largura is negative', async () => {
      const req = { body: { nome: 'Test', largura: -10, comprimento: 200 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when comprimento is zero', async () => {
      const req = { body: { nome: 'Test', largura: 100, comprimento: 0 }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Comprimento/)
    })

    it('creates chapa with valid data', async () => {
      const mockChapa = { id: 'CH001', nome: 'Granito Rosa' }
      ChapaRepo.insert.mockResolvedValue(mockChapa)

      const req = {
        body: { nome: 'Granito Rosa', largura: 100, comprimento: 200, tipo: 'Granito' },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

      expect(res.statusCode).toBe(201)
      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockChapa)
      expect(ChapaRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Granito Rosa', criadoPor: 1 })
      )
    })

    it('passes criadoPor as null when user is missing', async () => {
      const mockChapa = { id: 'CH002', nome: 'Marble' }
      ChapaRepo.insert.mockResolvedValue(mockChapa)

      const req = { body: { nome: 'Marble', largura: 50, comprimento: 80 } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.create(req, res, next)

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

      await ChapasController.update(req, res, next)

      expect(res.statusCode).toBe(400)
    })

    it('updates chapa with valid data', async () => {
      const mockChapa = { id: 'CH001', nome: 'Updated' }
      ChapaRepo.update.mockResolvedValue(mockChapa)

      const req = { params: { id: 'CH001' }, body: { nome: 'Updated' } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.update(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data.nome).toBe('Updated')
    })
  })

  // ── delete ────────────────────────────────────────────────────────
  describe('delete', () => {
    it('deletes chapa and returns it', async () => {
      const mockChapa = { id: 'CH001', nome: 'Deleted' }
      ChapaRepo.delete.mockResolvedValue(mockChapa)

      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.delete(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockChapa)
    })

    it('calls next on error', async () => {
      ChapaRepo.delete.mockRejectedValue(new Error('not found'))

      const req = { params: { id: 'CH999' } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.delete(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  // ── stats ─────────────────────────────────────────────────────────
  describe('stats', () => {
    it('returns stats from repository', async () => {
      const mockStats = { total: 10, disponiveis: 5, emUso: 3, areaTotal: 150.5 }
      ChapaRepo.stats.mockResolvedValue(mockStats)

      const req = {}
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.stats(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockStats)
    })
  })

  // ── aliases ───────────────────────────────────────────────────────
  describe('aliases', () => {
    it('listarChapas delegates to list', async () => {
      ChapaRepo.findAll.mockResolvedValue([])
      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.listarChapas(req, res, next)

      expect(ChapaRepo.findAll).toHaveBeenCalled()
    })

    it('consultarChapa delegates to show', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001' })
      const req = { params: { id: 'CH001' } }
      const res = mockRes()
      const next = jest.fn()

      await ChapasController.consultarChapa(req, res, next)

      expect(ChapaRepo.findById).toHaveBeenCalledWith('CH001')
    })
  })
})
