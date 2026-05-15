const EmpresaRepo = require('../repositories/EmpresaRepository')

class EmpresaController {
  async show(req, res, next) {
    try {
      const data = await EmpresaRepo.get()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const data = await EmpresaRepo.update(req.body)
      res.json({
        ok: true,
        data,
        msg: 'Dados da empresa atualizados!'
      })
    } catch (e) { next(e) }
  }
}

module.exports = new EmpresaController()

