/**
 * SERVIDOR EXPRESS — TetusManager API
 * Porta: 3001 (configurável via .env)
 */

require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')
const routes     = require('./routes/index')

// ── Validar variáveis obrigatórias ───────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não definido. Defina a variável no .env')
  process.exit(1)
}

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middlewares globais ───────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))   // 10mb para suportar fotos base64
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting no login (proteção contra brute-force) ─────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 10,                    // máx 10 tentativas por IP
  message: { ok: false, msg: 'Muitas tentativas de login. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/auth/login', loginLimiter)

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
