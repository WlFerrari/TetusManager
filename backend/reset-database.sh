#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# RESET DO BANCO DE DADOS — Limpa e re-popula
# Execute com: bash reset-database.sh
# ═══════════════════════════════════════════════════════════════════════

echo "🗑️  Resetando banco de dados..."

# 1. Dropa as tabelas
echo "Step 1: Removendo tabelas antigas..."
node database/reset-db.js

if [ $? -ne 0 ]; then
  echo "❌ Erro ao limpar o banco"
  exit 1
fi

# 2. Executa as migrations
echo "Step 2: Criando tabelas novas..."
node database/migrate.js

if [ $? -ne 0 ]; then
  echo "❌ Erro nas migrations"
  exit 1
fi

# 3. Popula com dados iniciais
echo "Step 3: Populando com dados iniciais..."
node database/seed.js

if [ $? -ne 0 ]; then
  echo "❌ Erro no seed"
  exit 1
fi

echo ""
echo "✅ Banco resetado com sucesso!"
echo ""
echo "Credenciais de teste:"
echo "  • Admin: joao.silva@tetus.com / senha123"
echo "  • Estoquista: maria.santos@tetus.com / senha123"
echo "  • Vendedor: pedro.costa@tetus.com / senha123"
echo ""
