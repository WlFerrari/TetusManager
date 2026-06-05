/**
 * GERADOR DE IDs — Utilitário compartilhado
 *
 * Gera IDs com prefixo + timestamp (últimos 6 dígitos).
 * Extraído dos padrões duplicados em ChapaRepository e RetalhoRepository.
 */

function gerarId(prefix) {
  return prefix + Date.now().toString().slice(-6)
}

module.exports = { gerarId }
