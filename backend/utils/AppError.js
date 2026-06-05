/**
 * Erro de aplicação com código HTTP.
 * O error handler global usa `status` para retornar o código correto.
 */
class AppError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'AppError'
    this.status = status
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

class ValidationError extends AppError {
  constructor(message = 'Dados inválidos.') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

module.exports = { AppError, NotFoundError, ValidationError }
