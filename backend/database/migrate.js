/**
 * MIGRATE — Executa as migrations SQL
 * Execute: node database/migrate.js
 */

require('dotenv').config()
const fs   = require('fs')
const path = require('path')
const { query } = require('./connection')

async function migrate() {
  console.log('Executando migrations...')

  const files = [
    'migrations.sql',
    'alinhamento_v1_2.sql',
    'validacoes_integridade_v1_3.sql',
  ]

  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8')
    await query(sql)
    console.log(`✓ ${file}`)
  }

  console.log('Migrations executadas com sucesso!')
  process.exit(0)
}

migrate().catch(err => {
  console.error('Erro nas migrations:', err.message)
  process.exit(1)
})
