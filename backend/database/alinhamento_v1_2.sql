-- ═══════════════════════════════════════════════════════════════════════
-- ALINHAMENTO DOCUMENTAÇÃO v1.2 — TetusManager
-- Regras consolidadas no estágio: rastreabilidade, exclusão lógica,
-- localização física, retalhos legados e estados oficiais.
-- ═══════════════════════════════════════════════════════════════════════

-- Chapas: estados oficiais Disponível / Em uso / Inativa
ALTER TABLE chapas ADD COLUMN IF NOT EXISTS localizacao TEXT;
ALTER TABLE chapas DROP CONSTRAINT IF EXISTS chapas_status_check;
UPDATE chapas SET status = 'Inativa' WHERE status = 'Esgotado';
ALTER TABLE chapas
  ADD CONSTRAINT chapas_status_check
  CHECK (status IN ('Disponível','Em uso','Inativa'));

-- Retalhos: origem automática ou manual/legada e localização física
ALTER TABLE retalhos ADD COLUMN IF NOT EXISTS origem_tipo VARCHAR(20);
ALTER TABLE retalhos ADD COLUMN IF NOT EXISTS localizacao TEXT;
UPDATE retalhos
SET origem_tipo = CASE WHEN origem IS NULL THEN 'MANUAL' ELSE 'AUTOMATICA' END
WHERE origem_tipo IS NULL;
ALTER TABLE retalhos ALTER COLUMN origem_tipo SET DEFAULT 'AUTOMATICA';
ALTER TABLE retalhos ALTER COLUMN origem_tipo SET NOT NULL;
ALTER TABLE retalhos DROP CONSTRAINT IF EXISTS retalhos_origem_tipo_check;
ALTER TABLE retalhos
  ADD CONSTRAINT retalhos_origem_tipo_check
  CHECK (origem_tipo IN ('AUTOMATICA','MANUAL'));

-- Corte pode existir sem retalho (consumo integral da chapa)
ALTER TABLE cortes ALTER COLUMN retalho_id DROP NOT NULL;

-- Índices auxiliares para consulta do estoque físico/digital
CREATE INDEX IF NOT EXISTS idx_chapas_localizacao ON chapas (localizacao);
CREATE INDEX IF NOT EXISTS idx_retalhos_localizacao ON retalhos (localizacao);
CREATE INDEX IF NOT EXISTS idx_retalhos_origem_tipo ON retalhos (origem_tipo);
