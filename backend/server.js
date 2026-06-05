/**
 * SERVIDOR EXPRESS — TetusManager API
 * Porta: 3001 (configurável via .env)
 */

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const routes  = require('./routes/index')

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middlewares globais ───────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))   // 10mb para suportar fotos base64
app.use(express.urlencoded({ extended: true }))

// ── Rotas ─────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── Rota de saúde (health check) ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, msg: 'TetusManager API rodando', ts: new Date().toISOString() })
})

// ── Tratamento global de erros ────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500
  const msg = status < 500 ? err.message : 'Erro interno do servidor.'

  if (status >= 500) {
    console.error('Erro não tratado:', err)
  }

  res.status(status).json({ ok: false, msg })
})

// ── Inicia o servidor ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nTetusManager API rodando em http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health\n`)
})
