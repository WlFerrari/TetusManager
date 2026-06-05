jest.mock('../../repositories/ChapaRepository')
jest.mock('../../repositories/RetalhoRepository')
jest.mock('../../repositories/CorteRepository', () => ({
  insert: jest.fn(),
  findAll: jest.fn(),
  stats: jest.fn(),
}))

const ChapaRepo = require('../../repositories/ChapaRepository')
const RetalhoRepo = require('../../repositories/RetalhoRepository')
const CorteRepo = require('../../repositories/CorteRepository')
const CortesController = require('../../controllers/CortesController')

const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

describe('CortesController', () => {
  beforeEach(() => jest.clearAllMocks())

  // ── registrar ─────────────────────────────────────────────────────
  describe('registrar', () => {
    it('returns 400 when chapaId is missing', async () => {
      const req = {
        body: { osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: [{ nome: 'R1', comprimento: 10, largura: 10 }] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Chapa/)
    })

    it('returns 400 when osNumero is missing', async () => {
      const req = {
        body: { chapaId: 'CH001', osNumero: '', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: [{ nome: 'R1', comprimento: 10, largura: 10 }] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/OS/)
    })

    it('returns 400 when osNumero is whitespace', async () => {
      const req = {
        body: { chapaId: 'CH001', osNumero: '   ', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: [{ nome: 'R1', comprimento: 10, largura: 10 }] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 when dimensions are invalid', async () => {
      const req = {
        body: { chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 0, larguraConsumida: 50, retalhos: [{ nome: 'R1', comprimento: 10, largura: 10 }] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Dimensões/)
    })

    it('returns 400 when retalhos array is empty', async () => {
      const req = {
        body: { chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: [] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/retalho/)
    })

    it('returns 400 when retalhos is not an array', async () => {
      const req = {
        body: { chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: 'not-array' },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
    })

    it('returns 404 when chapa not found', async () => {
      ChapaRepo.findById.mockResolvedValue(null)

      const req = {
        body: { chapaId: 'CH999', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: [{ nome: 'R1', comprimento: 10, largura: 10 }] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(404)
    })

    it('returns 400 when chapa is not Disponível', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001', status: 'Em uso' })

      const req = {
        body: { chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50, retalhos: [{ nome: 'R1', comprimento: 10, largura: 10 }] },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/disponível/)
    })

    it('returns 400 when retalho name is missing', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001', status: 'Disponível', tipo: 'Granito', cor: '#000', espessura: 2 })

      const req = {
        body: {
          chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50,
          retalhos: [{ nome: '', comprimento: 10, largura: 10 }],
        },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Nome/)
    })

    it('returns 400 when retalho dimensions are invalid', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001', status: 'Disponível', tipo: 'Granito', cor: '#000', espessura: 2 })

      const req = {
        body: {
          chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50,
          retalhos: [{ nome: 'R1', comprimento: 0, largura: 10 }],
        },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.statusCode).toBe(400)
      expect(res.body.msg).toMatch(/Dimensões/)
    })

    it('creates corte and retalhos successfully', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001', status: 'Disponível', tipo: 'Granito', cor: '#000', espessura: 2 })
      RetalhoRepo.insert.mockResolvedValue({ id: 'RET-001', area: 0.05 })
      CorteRepo.insert.mockResolvedValue({ id: 1 })

      const req = {
        body: {
          chapaId: 'CH001', osNumero: 'OS-001', comprimentoConsumido: 100, larguraConsumida: 50,
          retalhos: [{ nome: 'Retalho 1', comprimento: 50, largura: 30 }],
        },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.cortes).toHaveLength(1)
      expect(RetalhoRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ origem: 'CH001', status: 'Disponível' })
      )
    })

    it('creates multiple retalhos in one corte', async () => {
      ChapaRepo.findById.mockResolvedValue({ id: 'CH001', status: 'Disponível', tipo: 'Granito', cor: '#000', espessura: 2 })
      RetalhoRepo.insert
        .mockResolvedValueOnce({ id: 'RET-001', area: 0.05 })
        .mockResolvedValueOnce({ id: 'RET-002', area: 0.03 })
      CorteRepo.insert.mockResolvedValue({ id: 1 })

      const req = {
        body: {
          chapaId: 'CH001', osNumero: 'OS-002', comprimentoConsumido: 100, larguraConsumida: 80,
          retalhos: [
            { nome: 'R1', comprimento: 50, largura: 30 },
            { nome: 'R2', comprimento: 30, largura: 20 },
          ],
        },
        user: { id: 1 },
      }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.registrar(req, res, next)

      expect(res.body.data).toHaveLength(2)
      expect(RetalhoRepo.insert).toHaveBeenCalledTimes(2)
      expect(CorteRepo.insert).toHaveBeenCalledTimes(2)
    })
  })

  // ── list ──────────────────────────────────────────────────────────
  describe('list', () => {
    it('returns cortes from repository', async () => {
      CorteRepo.findAll.mockResolvedValue([{ id: 1 }])

      const req = { query: {} }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.list(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toHaveLength(1)
    })

    it('passes filter params', async () => {
      CorteRepo.findAll.mockResolvedValue([])

      const req = { query: { chapaId: 'CH001', limit: 10 } }
      const res = mockRes()
      const next = jest.fn()

      await CortesController.list(req, res, next)

      expect(CorteRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ chapaId: 'CH001', limit: 10 })
      )
    })
  })

  // ── stats ─────────────────────────────────────────────────────────
  describe('stats', () => {
    it('returns corte stats', async () => {
      CorteRepo.stats.mockResolvedValue({ total: 5 })

      const req = {}
      const res = mockRes()
      const next = jest.fn()

      await CortesController.stats(req, res, next)

      expect(res.body.ok).toBe(true)
      expect(res.body.data.total).toBe(5)
    })
  })
})
