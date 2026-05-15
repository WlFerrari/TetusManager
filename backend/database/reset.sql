-- ═══════════════════════════════════════════════════════════════════════
-- RESET — Dropa todas as tabelas e recria do zero
-- Execute com: psql -U postgres -d tetusmanager -f reset.sql
-- ═══════════════════════════════════════════════════════════════════════

-- Remove a funcao de trigger (tabelas podem ser recriadas depois)
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- Dropa as tabelas em ordem (sem quebrar referências)
DROP TABLE IF EXISTS retalhos CASCADE;
DROP TABLE IF EXISTS chapas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS empresa CASCADE;

-- Confirma
SELECT 'Banco resetado com sucesso!' as status;
