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
const isProduction = process.env.NODE_ENV === 'production'

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    console.error('JWT_SECRET não configurado. Defina a variável antes de iniciar em produção.')
    process.exit(1)
  }

  process.env.JWT_SECRET = 'tetusmanager-local-dev-secret-change-me'
  console.warn('JWT_SECRET não configurado: usando segredo local de desenvolvimento.')
}

if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  console.warn('DB_PASSWORD não configurado. Se o PostgreSQL exigir senha, crie backend/.env a partir de backend/.env.example.')
}

function normalizeOrigin(value) {
  if (!value) return 'http://localhost:5173'

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
app.use(express.json({ limit: '10mb' }))
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
  res.status(500).json({
    ok: false,
    msg: isProduction ? 'Erro interno do servidor.' : `Erro interno: ${err.message}`,
  })
})

// ── Inicia o servidor ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nTetusManager API rodando em http://localhost:${PORT}`)
  console.log(`   CORS liberado para: ${frontendOrigin}`)
  console.log(`   Health check: http://localhost:${PORT}/health\n`)
})
