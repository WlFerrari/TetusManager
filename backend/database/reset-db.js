/**
 * RESET-DB — Limpa todas as tabelas do banco
 * Execute: node database/reset-db.js
 */

require('dotenv').config()
const { query } = require('./connection')
const fs = require('fs')
const path = require('path')

async function resetDatabase() {
  console.log('🗑️  Removendo todas as tabelas...')
  
  try {
    // Remove a funcao de trigger primeiro
    await query('DROP FUNCTION IF EXISTS set_updated_at() CASCADE')
    console.log('✓ Funcao de trigger removida')

    // Dropa em ordem (sem quebrar referências)
    await query('DROP TABLE IF EXISTS retalhos CASCADE')
    console.log('✓ Tabela retalhos removida')
    
    await query('DROP TABLE IF EXISTS chapas CASCADE')
    console.log('✓ Tabela chapas removida')
    
    await query('DROP TABLE IF EXISTS usuarios CASCADE')
    console.log('✓ Tabela usuarios removida')
    
    await query('DROP TABLE IF EXISTS empresa CASCADE')
    console.log('✓ Tabela empresa removida')
    
    console.log('\n🔁 Recriando tabelas...')
    const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8')
    await query(sql)
    console.log('✓ Migrations executadas')

    console.log('\n✅ Banco resetado e recriado com sucesso!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Erro ao limpar banco:', err.message)
    process.exit(1)
  }
}

resetDatabase()
