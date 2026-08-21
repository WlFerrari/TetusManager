const EmpresaRepo = require('../repositories/EmpresaRepository')
const { validateCompany } = require('../utils/validation')

class EmpresaController {
  async show(req, res, next) {
    try {
      const data = await EmpresaRepo.get()
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const atual = await EmpresaRepo.get()
      const payload = { ...atual, ...req.body }
      const invalid = validateCompany(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      const data = await EmpresaRepo.update(payload)
      res.json({ ok:true, data, msg:'Dados da empresa atualizados!' })
    } catch (e) { next(e) }
  }
}

module.exports = new EmpresaController()
