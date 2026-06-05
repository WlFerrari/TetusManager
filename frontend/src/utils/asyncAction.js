/**
 * ASYNC ACTION — Utilitário para wrapping de operações assíncronas nos controllers
 *
 * Reduz o boilerplate repetitivo de try/catch + { ok, msg } em cada método.
 */

/**
 * Executa uma função async e retorna { ok: 1, ...result } ou { ok: 0, msg }.
 * @param {Function} fn - Função async que retorna o payload de sucesso
 * @param {object} fallback - Valor padrão caso haja erro (opcional)
 */
export async function asyncAction(fn, fallback = undefined) {
  try {
    return await fn()
  } catch (err) {
    const response = { ok: 0, msg: err.message }
    if (fallback !== undefined) {
      Object.assign(response, fallback)
    }
    return response
  }
}
