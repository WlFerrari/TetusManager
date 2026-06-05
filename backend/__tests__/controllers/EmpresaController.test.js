jest.mock('../../repositories/EmpresaRepository')
const EmpresaRepo = require('../../repositories/EmpresaRepository')

const EmpresaController = require('../../controllers/EmpresaController')

const flushPromises = () => new Promise(setImmediate)

const mockRes = () => {
  const res = { statusCode: 200 }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

describe('EmpresaController', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('show', () => {
    it('returns empresa data', async () => {
      const mockData = { nome: 'Tetus', cnpj: '123' }
      EmpresaRepo.get.mockResolvedValue(mockData)

      const req = {}
      const res = mockRes()
      const next = jest.fn()

      EmpresaController.show(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockData)
    })

    it('calls next on error', async () => {
      EmpresaRepo.get.mockRejectedValue(new Error('fail'))

      const req = {}
      const res = mockRes()
      const next = jest.fn()

      EmpresaController.show(req, res, next)
      await flushPromises()

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('update', () => {
    it('updates empresa data', async () => {
      const mockData = { nome: 'Updated' }
      EmpresaRepo.update.mockResolvedValue(mockData)

      const req = { body: { nome: 'Updated' } }
      const res = mockRes()
      const next = jest.fn()

      EmpresaController.update(req, res, next)
      await flushPromises()

      expect(res.body.ok).toBe(true)
      expect(res.body.data).toEqual(mockData)
      expect(res.body.msg).toMatch(/atualizado/)
    })

    it('calls next on error', async () => {
      EmpresaRepo.update.mockRejectedValue(new Error('fail'))

      const req = { body: {} }
      const res = mockRes()
      const next = jest.fn()

      EmpresaController.update(req, res, next)
      await flushPromises()

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
