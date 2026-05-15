# 🔄 Restaurando Dependências após Limpeza

Os arquivos `node_modules/` foram removidos para reduzir o tamanho da distribuição.

## ✅ Como Restaurar para Desenvolvimento

### 1️⃣ Backend
```bash
cd backend
npm install
```

### 2️⃣ Frontend
```bash
cd frontend
npm install
```

### 3️⃣ Iniciar Servidores

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Servidor em: http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Aplicação em: http://localhost:3000
```

---

## 📦 O que foi Removido?

✅ Removido:
- `backend/node_modules/` (~500MB)
- `frontend/node_modules/` (~1GB+)

✅ **NÃO** foi removido:
- `package.json` (dependências necessárias)
- `package-lock.json` (versões exatas)
- Código-fonte completo
- Configurações (.env)
- Documentação

---

## ⚠️ Nota Importante

O `package-lock.json` garante que `npm install` baixará **exatamente as mesmas versões** que estavam antes. A instalação é rápida e reproduzível em qualquer máquina.

---

## Dúvidas?

Se alguma dependência faltar ou houver erro ao instalar, tente:

```bash
npm ci  # Instala EXATAMENTE o package-lock.json
```

Isso é mais rigoroso que `npm install` e garante reprodutibilidade.
