# TetusManager — Guia de Instalação e Execução

> Stack: **React 18** (Frontend) + **Node.js + Express** (Backend) + **PostgreSQL** (Banco de Dados)

## Quick Start (Resumo)

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev

# Em outro terminal, Frontend
cd frontend
npm install
npm run dev
```

---

## Pré-requisitos

Instale antes de começar:

| Software   | Download                          | Versão mínima |
|------------|-----------------------------------|---------------|
| Node.js    | https://nodejs.org                | v18 LTS       |
| PostgreSQL | https://www.postgresql.org/download/ | v14+       |

---

## Passo 1 — Criar o banco de dados

Abra o **pgAdmin** (instala junto com o PostgreSQL) ou o terminal `psql`:

```sql
-- No pgAdmin: clique com botão direito em "Databases" → Create → Database
-- Nome: tetusmanager

-- Ou pelo terminal:
psql -U postgres
CREATE DATABASE tetusmanager;
\q
```

---

## Passo 2 — Configurar o Backend

```bash
# Abra o VS Code na pasta "backend"
cd backend

# 1. Instale as dependências
npm install

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Edite o .env com suas configurações
#    Abra o arquivo .env e preencha:
#    DB_PASSWORD=sua_senha_do_postgres
#    JWT_SECRET=qualquer_texto_longo_e_aleatorio

# 4. Execute as migrations (cria as tabelas)
npm run migrate

# 5. Popula o banco com dados iniciais
npm run seed

# 6. Inicia o servidor
npm run dev
# → Rodando em http://localhost:3001
```

---

## Passo 3 — Configurar o Frontend

```bash
# Em outro terminal, abra a pasta "frontend"
cd frontend

# 1. Instale as dependências
npm install

# 2. Inicia o React
npm run dev
# → Abre http://localhost:3000
```

---

## Estrutura do projeto

```
tetusmanager-v4/
│
├── backend/                    ← Node.js + Express + PostgreSQL
│   ├── server.js               ← Servidor principal
│   ├── .env.example            ← Configurações (copie para .env)
│   ├── package.json
│   │
│   ├── database/
│   │   ├── connection.js       ← Pool de conexões PostgreSQL
│   │   ├── migrations.sql      ← Criação das tabelas
│   │   ├── migrate.js          ← Script: npm run migrate
│   │   └── seed.js             ← Script: npm run seed
│   │
│   ├── models/
│   │   └── index.js            ← Permissões padrão por perfil
│   │
│   ├── repositories/           ← Queries SQL reais (CRUD)
│   │   ├── ChapaRepository.js
│   │   ├── RetalhoRepository.js
│   │   ├── UserRepository.js
│   │   └── EmpresaRepository.js
│   │
│   ├── middleware/
│   │   └── auth.js             ← JWT + verificação de permissões
│   │
│   └── routes/
│       └── index.js            ← Todas as rotas da API REST
│
└── frontend/                   ← React 18 + Vite
    ├── vite.config.js          ← Proxy para /api → localhost:3001
    ├── package.json
    └── src/
        ├── services/
        │   └── api.js          ← Substitui o mock — chama a API real
        ├── models/             ← Schemas e permissões
        ├── views/
        │   ├── components/     ← UI reutilizável
        │   └── pages/          ← Páginas (Login, Dashboard, etc.)
        └── styles/
            └── global.css
```

---

## Endpoints da API

| Método | Rota                          | Descrição                    | Permissão        |
|--------|-------------------------------|------------------------------|------------------|
| POST   | /api/auth/login               | Login                        | Pública          |
| GET    | /api/chapas                   | Listar chapas                | verEstoque       |
| POST   | /api/chapas                   | Criar chapa                  | editarEstoque    |
| PUT    | /api/chapas/:id               | Atualizar chapa              | editarEstoque    |
| DELETE | /api/chapas/:id               | Excluir chapa                | editarEstoque    |
| GET    | /api/retalhos                 | Listar retalhos              | verEstoque       |
| POST   | /api/retalhos                 | Criar retalho                | editarEstoque    |
| PATCH  | /api/retalhos/:id/consumir    | DELETE lógico (soft delete)  | editarEstoque    |
| DELETE | /api/retalhos/:id             | DELETE físico                | editarEstoque    |
| GET    | /api/usuarios                 | Listar usuários              | gerenciarUsuarios|
| POST   | /api/usuarios                 | Criar usuário                | gerenciarUsuarios|
| PATCH  | /api/usuarios/:id/toggle      | Ativar/Inativar              | gerenciarUsuarios|
| PATCH  | /api/usuarios/:id/permissoes  | Atualizar permissões         | gerenciarUsuarios|
| DELETE | /api/usuarios/:id             | Excluir usuário              | gerenciarUsuarios|
| PATCH  | /api/me/perfil                | Editar próprio perfil        | Autenticado      |
| PATCH  | /api/me/senha                 | Alterar senha                | Autenticado      |
| GET    | /api/empresa                  | Dados da empresa             | Autenticado      |
| PUT    | /api/empresa                  | Atualizar empresa            | verEmpresa       |

---

## Problemas comuns

**Erro de conexão com o banco:**
- Verifique se o PostgreSQL está rodando
- Confirme o `DB_PASSWORD` no arquivo `.env`
- Certifique-se de que o banco `tetusmanager` foi criado

**Porta em uso:**
- Backend padrão: 3001 — mude `PORT` no `.env`
- Frontend padrão: 3000 — mude `port` no `vite.config.js`

**Token expirado:**
- O token dura 8h por padrão — faça login novamente
- Mude `JWT_EXPIRES_IN` no `.env` se quiser mais tempo
