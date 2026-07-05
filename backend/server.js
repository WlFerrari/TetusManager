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

function normalizeOrigin(value) {
  if (!value) return 'http://localhost:3000'

  try {
    return new URL(value).origin
  } catch (err) {
    return new URL(`https://${value}`).origin
  }
}

const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL)

// ── Middlewares globais ───────────────────────────────────────────────
app.use(cors({
  origin:      frontendOrigin,
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
  console.error('Erro não tratado:', err.message)
  res.status(500).json({ ok: false, msg: 'Erro interno do servidor.' })
})

// ── Inicia o servidor ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nTetusManager API rodando em http://localhost:${PORT}`)
  console.log(`   CORS liberado para: ${frontendOrigin}`)
  console.log(`   Health check: http://localhost:${PORT}/health\n`)
})
