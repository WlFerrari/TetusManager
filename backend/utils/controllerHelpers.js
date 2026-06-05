/**
 * CONTROLLER HELPERS — Utilitários para reduzir boilerplate nos controllers
 *
 * Extraído dos padrões try/catch + response duplicados em todos os controllers.
 */

/**
 * Wraps an async controller handler with automatic try/catch + next(e).
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Busca um recurso por ID e retorna 404 se não encontrado.
 * Evita duplicação do padrão findById + if(!data) return 404.
 *
 * @param {Function} findFn - Função que recebe id e retorna o registro (ou null)
 * @param {string} label - Nome do recurso para a mensagem de erro (ex: 'Chapa', 'Retalho')
 * @returns Middleware Express
 */
function findOrFail(findFn, label) {
  return async (req, res, next) => {
    try {
      const data = await findFn(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: `${label} não encontrado(a).`
        })
      }
      req.resource = data
      next()
    } catch (e) {
      next(e)
    }
  }
}

/**
 * Envia resposta JSON padronizada de sucesso.
 */
function sendSuccess(res, data, msg, statusCode = 200) {
  const payload = { ok: true }
  if (data !== undefined) payload.data = data
  if (msg) payload.msg = msg
  return res.status(statusCode).json(payload)
}

/**
 * Envia resposta JSON padronizada de erro.
 */
function sendError(res, msg, statusCode = 400) {
  return res.status(statusCode).json({ ok: false, msg })
}

module.exports = { asyncHandler, findOrFail, sendSuccess, sendError }
