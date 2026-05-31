-- ═══════════════════════════════════════════════════════════════════════
-- MIGRATIONS — TetusManager
-- Execute com: psql -U postgres -d tetusmanager -f migrations.sql
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Extensão para UUID (identificadores únicos)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabela: usuarios ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL        PRIMARY KEY,
  nome        VARCHAR(120)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  senha_hash  VARCHAR(255)  NOT NULL,
  perfil      VARCHAR(30)   NOT NULL DEFAULT 'Vendedor'
              CHECK (perfil IN ('Administrador','Estoquista','Vendedor')),
  status      VARCHAR(10)   NOT NULL DEFAULT 'Ativo'
              CHECK (status IN ('Ativo','Inativo')),
  telefone    VARCHAR(20),
  cargo       VARCHAR(80),
  foto        TEXT,                    -- base64 ou URL futura
  permissoes  JSONB         NOT NULL DEFAULT '{}',
  criado_em   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabela: chapas ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapas (
  id           VARCHAR(20)   PRIMARY KEY,
  nome         VARCHAR(120)  NOT NULL,
  tipo         VARCHAR(50)   NOT NULL,
  cor          VARCHAR(10)   NOT NULL DEFAULT '#6b7280',
  largura      NUMERIC(8,2)  NOT NULL CHECK (largura > 0),
  comprimento  NUMERIC(8,2)  NOT NULL CHECK (comprimento > 0),
  espessura    NUMERIC(4,2)  NOT NULL DEFAULT 2,
  status       VARCHAR(20)   NOT NULL DEFAULT 'Disponível'
               CHECK (status IN ('Disponível','Em uso','Esgotado')),
  qr_code      TEXT,
  foto         TEXT,
  criado_por   INTEGER       REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Tabela: retalhos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS retalhos (
  id           VARCHAR(20)   PRIMARY KEY,
  origem       VARCHAR(20)   REFERENCES chapas(id) ON DELETE SET NULL,
  nome         VARCHAR(120)  NOT NULL,
  tipo         VARCHAR(50)   NOT NULL,
  cor          VARCHAR(10)   NOT NULL DEFAULT '#6b7280',
  largura      NUMERIC(8,2)  NOT NULL CHECK (largura >= 0),
  comprimento  NUMERIC(8,2)  NOT NULL CHECK (comprimento >= 0),
  espessura    NUMERIC(4,2)  NOT NULL DEFAULT 2,
  area         NUMERIC(10,4) NOT NULL DEFAULT 0,   -- m², calculado automaticamente
  status       VARCHAR(20)   NOT NULL DEFAULT 'Disponível'
               CHECK (status IN ('Disponível','Reservado','Consumido','Descartado')),
  qr_code      TEXT,
  foto         TEXT,
  criado_por   INTEGER       REFERENCES usuarios(id) ON DELETE SET NULL,
  consumido_por INTEGER      REFERENCES usuarios(id) ON DELETE SET NULL,
  consumido_em TIMESTAMPTZ,
  descartado_por INTEGER     REFERENCES usuarios(id) ON DELETE SET NULL,
  descartado_em TIMESTAMPTZ,
  criado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Tabela: cortes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cortes (
  id                    SERIAL        PRIMARY KEY,
  os_numero             VARCHAR(40)   NOT NULL,
  chapa_id              VARCHAR(20)   REFERENCES chapas(id) ON DELETE SET NULL,
  retalho_id            VARCHAR(20)   REFERENCES retalhos(id) ON DELETE SET NULL,
  comprimento_consumido NUMERIC(8,2)  NOT NULL CHECK (comprimento_consumido > 0),
  largura_consumida     NUMERIC(8,2)  NOT NULL CHECK (largura_consumida > 0),
  area_consumida        NUMERIC(10,4) NOT NULL DEFAULT 0,
  area_retalho          NUMERIC(10,4) NOT NULL DEFAULT 0,
  observacao            TEXT,
  criado_por            INTEGER       REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Tabela: empresa ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresa (
  id         INTEGER       PRIMARY KEY DEFAULT 1,  -- sempre 1 registro
  nome       VARCHAR(150)  NOT NULL DEFAULT 'Tetus Marmoraria',
  cnpj       VARCHAR(20),
  email      VARCHAR(150),
  telefone   VARCHAR(20),
  endereco   TEXT,
  logo       TEXT,
  plano      VARCHAR(30)   DEFAULT 'Profissional',
  fundacao   VARCHAR(10),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Garante que só existe 1 linha
  CONSTRAINT empresa_singleton CHECK (id = 1)
);

-- ── Trigger: atualiza o campo atualizado_em automaticamente ───────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_usuarios_updated
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_chapas_updated
  BEFORE UPDATE ON chapas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_retalhos_updated
  BEFORE UPDATE ON retalhos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Índices para performance ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_usuarios_email    ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil   ON usuarios (perfil);
CREATE INDEX IF NOT EXISTS idx_chapas_status     ON chapas (status);
CREATE INDEX IF NOT EXISTS idx_retalhos_status   ON retalhos (status);
CREATE INDEX IF NOT EXISTS idx_retalhos_origem   ON retalhos (origem);
CREATE INDEX IF NOT EXISTS idx_chapas_criado_por ON chapas (criado_por);
CREATE INDEX IF NOT EXISTS idx_retalhos_criado_por ON retalhos (criado_por);
CREATE INDEX IF NOT EXISTS idx_retalhos_consumido_por ON retalhos (consumido_por);
CREATE INDEX IF NOT EXISTS idx_cortes_chapa_id ON cortes (chapa_id);
CREATE INDEX IF NOT EXISTS idx_cortes_retalho_id ON cortes (retalho_id);
CREATE INDEX IF NOT EXISTS idx_cortes_os_numero ON cortes (os_numero);
