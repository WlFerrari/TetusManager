jest.mock('../../repositories/ChapaRepository')
jest.mock('../../repositories/RetalhoRepository')
const ChapaRepo = require('../../repositories/ChapaRepository')
const RetalhoRepo = require('../../repositories/RetalhoRepository')

const RetalhosController = require('../../controllers/RetalhosController')

const flushPromises = () => new Promise(setImmediate)

const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

describe('RetalhosController', () => {
  beforeEach(() => jest.clearAllMocks())

  // ── list ──────────────────────────────────────────────────────────
  describe('list', () => {
    it('returns list from repository', async () => {
      RetalhoRepo.findAll.mockResolvedValue([{ id: 'RET-001' }])

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.list(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toHaveLength(1)
    })
  })

  // ── show ──────────────────────────────────────────────────────────
  describe('show', () => {
    it('returns 404 when retalho not found', async () => {
      RetalhoRepo.findById.mockResolvedValue(null)

      const req = { params: { id: 'RET-999' } }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.show(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(404)
    })

    it('returns retalho when found', async () => {
      RetalhoRepo.findById.mockResolvedValue({ id: 'RET-001' })

      const req = { params: { id: 'RET-001' } }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.show(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
    })
  })

  // ── create ────────────────────────────────────────────────────────
  describe('create', () => {
    it('returns 400 when nome is empty', async () => {
      const req = {
        body: { nome: '', comprimento: 100, largura: 50 },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Nome/)
    })

    it('returns 400 when dimensions are invalid', async () => {
      const req = {
        body: { nome: 'Test', comprimento: 0, largura: 50 },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Dimensões/)
    })

    it('returns 400 when largura is zero', async () => {
      const req = {
        body: { nome: 'Test', comprimento: 100, largura: 0 },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('returns 404 when origin chapa not found', async () => {
      ChapaRepo.findById.mockResolvedValue(null)

      const req = {
        body: { nome: 'Test', comprimento: 100, largura: 50, origem: 'CH999' },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(404)
      expect(res.body.msg).toMatch(/Chapa/)
    })

    it('returns 400 when retalho dimensions exceed chapa', async () => {
      ChapaRepo.findById.mockResolvedValue({
        id: 'CH001', comprimento: 100, largura: 50,
      })

      const req = {
        body: { nome: 'Test', comprimento: 200, largura: 50, origem: 'CH001' },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/maior/)
    })

    it('returns 400 when largura exceeds chapa', async () => {
      ChapaRepo.findById.mockResolvedValue({
        id: 'CH001', comprimento: 100, largura: 50,
      })

      const req = {
        body: { nome: 'Test', comprimento: 80, largura: 60, origem: 'CH001' },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(400)
    })

    it('creates retalho without origin', async () => {
      RetalhoRepo.insert.mockResolvedValue({ id: 'RET-001', nome: 'Test' })

      const req = {
        body: { nome: 'Test', comprimento: 100, largura: 50 },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(201)
      expect(res.body.ok).toBe(true)
    })

    it('creates retalho with valid origin', async () => {
      ChapaRepo.findById.mockResolvedValue({
        id: 'CH001', comprimento: 200, largura: 100,
      })
      RetalhoRepo.insert.mockResolvedValue({ id: 'RET-002' })

      const req = {
        body: { nome: 'Test', comprimento: 100, largura: 50, origem: 'CH001' },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(res.statusCode).toBe(201)
    })

    it('provides default values for tipo, cor, espessura', async () => {
      RetalhoRepo.insert.mockResolvedValue({ id: 'RET-003' })

      const req = {
        body: { nome: 'Minimal', comprimento: 100, largura: 50 },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.create(req, res, next)
      await flushPromises()

      expect(RetalhoRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'Granito',
          cor: '#6b7280',
          espessura: 2,
        })
      )
    })
  })

  // ── consume ───────────────────────────────────────────────────────
  describe('consume', () => {
    it('marks retalho as consumed', async () => {
      RetalhoRepo.marcarConsumido.mockResolvedValue({ id: 'RET-001', status: 'Consumido' })

      const req = { params: { id: 'RET-001' }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.consume(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(RetalhoRepo.marcarConsumido).toHaveBeenCalledWith('RET-001', 1)
    })

    it('passes null when user is missing', async () => {
      RetalhoRepo.marcarConsumido.mockResolvedValue({ id: 'RET-001' })

      const req = { params: { id: 'RET-001' } }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.consume(req, res, next)
      await flushPromises()

      expect(RetalhoRepo.marcarConsumido).toHaveBeenCalledWith('RET-001', null)
    })
  })

  // ── discard ───────────────────────────────────────────────────────
  describe('discard', () => {
    it('marks retalho as discarded', async () => {
      RetalhoRepo.marcarDescartado.mockResolvedValue({ id: 'RET-001', status: 'Descartado' })

      const req = { params: { id: 'RET-001' }, user: { id: 1 } }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.discard(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(RetalhoRepo.marcarDescartado).toHaveBeenCalledWith('RET-001', 1)
    })
  })

  // ── delete ────────────────────────────────────────────────────────
  describe('delete', () => {
    it('deletes retalho', async () => {
      RetalhoRepo.delete.mockResolvedValue({ id: 'RET-001' })

      const req = { params: { id: 'RET-001' } }
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.delete(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
    })
  })

  // ── stats ─────────────────────────────────────────────────────────
  describe('stats', () => {
    it('returns stats', async () => {
      const stats = { total: 5, disponiveis: 3 }
      RetalhoRepo.stats.mockResolvedValue(stats)

      const req = {}
      const res = mockRes()
      const next = jest.fn()

      RetalhosController.stats(req, res, next)
      await flushPromises()

      expect(res.body.data).toEqual(stats)
    })
  })
})
