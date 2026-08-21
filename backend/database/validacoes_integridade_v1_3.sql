-- ═══════════════════════════════════════════════════════════════════════
-- VALIDAÇÕES DE INTEGRIDADE v1.3 — TetusManager
-- Reforça no PostgreSQL as mesmas regras aplicadas no frontend/backend.
-- Constraints novas são NOT VALID para não impedir a migration caso um
-- banco antigo já contenha dados inválidos; novos INSERT/UPDATE já passam
-- a respeitar as regras.
-- ═══════════════════════════════════════════════════════════════════════

-- Medidas físicas nunca podem ser zero ou negativas.
ALTER TABLE chapas DROP CONSTRAINT IF EXISTS chapas_espessura_positiva_check;
ALTER TABLE chapas ADD CONSTRAINT chapas_espessura_positiva_check
  CHECK (espessura > 0) NOT VALID;

ALTER TABLE retalhos DROP CONSTRAINT IF EXISTS retalhos_largura_positiva_check;
ALTER TABLE retalhos ADD CONSTRAINT retalhos_largura_positiva_check
  CHECK (largura > 0) NOT VALID;

ALTER TABLE retalhos DROP CONSTRAINT IF EXISTS retalhos_comprimento_positivo_check;
ALTER TABLE retalhos ADD CONSTRAINT retalhos_comprimento_positivo_check
  CHECK (comprimento > 0) NOT VALID;

ALTER TABLE retalhos DROP CONSTRAINT IF EXISTS retalhos_espessura_positiva_check;
ALTER TABLE retalhos ADD CONSTRAINT retalhos_espessura_positiva_check
  CHECK (espessura > 0) NOT VALID;

-- Área é calculada pelo sistema e não deve ser negativa.
ALTER TABLE retalhos DROP CONSTRAINT IF EXISTS retalhos_area_nao_negativa_check;
ALTER TABLE retalhos ADD CONSTRAINT retalhos_area_nao_negativa_check
  CHECK (area >= 0) NOT VALID;

ALTER TABLE cortes DROP CONSTRAINT IF EXISTS cortes_area_consumida_nao_negativa_check;
ALTER TABLE cortes ADD CONSTRAINT cortes_area_consumida_nao_negativa_check
  CHECK (area_consumida >= 0) NOT VALID;

ALTER TABLE cortes DROP CONSTRAINT IF EXISTS cortes_area_retalho_nao_negativa_check;
ALTER TABLE cortes ADD CONSTRAINT cortes_area_retalho_nao_negativa_check
  CHECK (area_retalho >= 0) NOT VALID;

-- Evita strings vazias em campos essenciais mesmo em chamadas SQL diretas.
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_nome_nao_vazio_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_nome_nao_vazio_check
  CHECK (length(trim(nome)) > 0) NOT VALID;

ALTER TABLE chapas DROP CONSTRAINT IF EXISTS chapas_nome_nao_vazio_check;
ALTER TABLE chapas ADD CONSTRAINT chapas_nome_nao_vazio_check
  CHECK (length(trim(nome)) > 0) NOT VALID;

ALTER TABLE retalhos DROP CONSTRAINT IF EXISTS retalhos_nome_nao_vazio_check;
ALTER TABLE retalhos ADD CONSTRAINT retalhos_nome_nao_vazio_check
  CHECK (length(trim(nome)) > 0) NOT VALID;

ALTER TABLE cortes DROP CONSTRAINT IF EXISTS cortes_os_nao_vazia_check;
ALTER TABLE cortes ADD CONSTRAINT cortes_os_nao_vazia_check
  CHECK (length(trim(os_numero)) > 0) NOT VALID;
