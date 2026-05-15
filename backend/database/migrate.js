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
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8')
  await query(sql)
  console.log('Migrations executadas com sucesso!')
  process.exit(0)
}

migrate().catch(err => {
  console.error('Erro nas migrations:', err.message)
  process.exit(1)
})
