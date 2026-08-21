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

-- Garante coerência da origem também em bancos que já existiam antes desta versão.
-- NOT VALID preserva bancos antigos que eventualmente possuam registros legados
-- inconsistentes, mas novos INSERTs e UPDATEs já passam a respeitar a regra.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'retalho_origem_coerente'
  ) THEN
    ALTER TABLE retalhos
      ADD CONSTRAINT retalho_origem_coerente
      CHECK (
        (origem_tipo = 'MANUAL' AND origem IS NULL)
        OR (origem_tipo = 'AUTOMATICA' AND origem IS NOT NULL)
      ) NOT VALID;
  END IF;
END $$;

-- Compatibilidade com versões antigas nas quais o número da OS podia ter outro tipo.
-- O domínio atual aceita identificadores como OS-1001, portanto é textual.
ALTER TABLE cortes
  ALTER COLUMN os_numero TYPE VARCHAR(60)
  USING os_numero::text;

-- Corte pode existir sem retalho (consumo integral da chapa).
ALTER TABLE cortes ALTER COLUMN retalho_id DROP NOT NULL;

-- Regra atual do estoque: depois que uma chapa recebe um corte, a chapa inteira
-- vira histórico. Qualquer sobra reutilizável é controlada como um novo retalho.
-- Também corrige dados gravados pela versão anterior, que mantinha a chapa Em uso.
UPDATE chapas c
SET status = 'Inativa'
WHERE c.status = 'Em uso'
  AND EXISTS (
    SELECT 1
    FROM cortes co
    WHERE co.chapa_id = c.id
  );

-- Índices auxiliares para consulta do estoque físico/digital
CREATE INDEX IF NOT EXISTS idx_chapas_localizacao ON chapas (localizacao);
CREATE INDEX IF NOT EXISTS idx_retalhos_localizacao ON retalhos (localizacao);
CREATE INDEX IF NOT EXISTS idx_retalhos_origem_tipo ON retalhos (origem_tipo);
