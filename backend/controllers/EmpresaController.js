const EmpresaRepo = require('../repositories/EmpresaRepository')
const { asyncHandler, sendSuccess } = require('../utils/controllerHelpers')

class EmpresaController {
  show = asyncHandler(async (req, res) => {
    const data = await EmpresaRepo.get()
    sendSuccess(res, data)
  })

  update = asyncHandler(async (req, res) => {
    const data = await EmpresaRepo.update(req.body)
    sendSuccess(res, data, 'Dados da empresa atualizados!')
  })
}

module.exports = new EmpresaController()
