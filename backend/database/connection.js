/**
 * CONEXÃO COM O BANCO DE DADOS
 * Usa o módulo 'pg' (node-postgres) com Pool de conexões.
 * Pool reutiliza conexões abertas — eficiente para múltiplas requisições.
 */

require('dotenv').config()
const { Pool } = require('pg')

const useSsl = process.env.DB_SSL === 'true'

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'tetusmanager',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl:      useSsl ? { rejectUnauthorized: false } : undefined,
      max:      10,
      idleTimeoutMillis:    30000,
      connectionTimeoutMillis: 2000,
    }

const pool = new Pool(poolConfig)

// Testa a conexão ao iniciar
pool.on('connect', () => {
  console.log('PostgreSQL conectado')
})

pool.on('error', (err) => {
  console.error('Erro no pool PostgreSQL:', err.message)
})

/**
 * Helper para executar queries com parâmetros seguros (evita SQL Injection)
 * Uso: const result = await query('SELECT * FROM chapas WHERE id = $1', [id])
 */
const query = (text, params) => pool.query(text, params)

module.exports = { pool, query }
