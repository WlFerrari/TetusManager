/**
 * QUERY BUILDER — Utilitário para construção dinâmica de cláusulas WHERE
 *
 * Extraído dos padrões duplicados em ChapaRepository e RetalhoRepository.
 */

/**
 * Cria um builder para cláusulas WHERE parametrizadas.
 * Uso:
 *   const qb = createQueryBuilder()
 *   qb.ilike('nome', value)
 *   qb.eq('status', value)
 *   const { whereClause, params } = qb.build()
 */
function createQueryBuilder() {
  const conditions = []
  const params = []

  function addParam(value) {
    params.push(value)
    return `$${params.length}`
  }

  return {
    /**
     * Adiciona condição ILIKE para busca parcial
     */
    ilike(column, value) {
      if (!value) return this
      const p = addParam(`%${value}%`)
      conditions.push(`${column} ILIKE ${p}`)
      return this
    },

    /**
     * Adiciona condição ILIKE em múltiplas colunas (OR)
     */
    ilikeAny(columns, value) {
      if (!value) return this
      const p = addParam(`%${value}%`)
      const clause = columns.map(col => `${col} ILIKE ${p}`).join(' OR ')
      conditions.push(`(${clause})`)
      return this
    },

    /**
     * Adiciona condição de igualdade exata
     */
    eq(column, value) {
      if (value === undefined || value === null || value === '') return this
      const p = addParam(value)
      conditions.push(`${column} = ${p}`)
      return this
    },

    /**
     * Adiciona condição numérica de igualdade (converte para Number)
     */
    eqNum(column, value) {
      if (!(+value > 0)) return this
      const p = addParam(Number(value))
      conditions.push(`${column} = ${p}`)
      return this
    },

    /**
     * Adiciona condição >= (mínimo)
     */
    gte(column, value) {
      if (!(+value > 0)) return this
      const p = addParam(Number(value))
      conditions.push(`${column} >= ${p}`)
      return this
    },

    /**
     * Constrói a cláusula WHERE final
     */
    build() {
      const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : ''
      return { whereClause, params }
    },
  }
}

module.exports = { createQueryBuilder }
