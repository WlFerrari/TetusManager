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

## Deploy recomendado para banca

A forma mais simples de publicar esse projeto e ainda conseguir ver o banco de dados é esta:

1. Banco de dados no Supabase.
2. Backend no Render.
3. Frontend no Vercel.

O Supabase é o melhor ponto para a parte do banco porque já tem editor visual de tabelas, SQL editor e navegação de dados pela web.

### Visão geral do fluxo

O deploy funciona assim:

1. Você cria o banco no Supabase.
2. Você cria as tabelas usando o arquivo de migrations.
3. Você sobe o backend em um serviço que rode Node.js o tempo todo, como Render.
4. Você sobe o frontend no Vercel.
5. O frontend aponta para a URL pública do backend.
6. O backend aponta para o banco do Supabase.

### O que você vai precisar

- Uma conta no Supabase.
- Uma conta no Vercel.
- Uma conta no Render, ou serviço equivalente para o backend.
- Seu código já enviado para um repositório GitHub.

### Passo 1 — Criar o banco no Supabase

1. Acesse o Supabase e clique em New project.
2. Escolha uma organização.
3. Defina um nome para o projeto.
4. Crie uma senha forte para o banco.
5. Escolha a região mais próxima de você.
6. Aguarde o projeto ficar pronto.

Quando o projeto abrir, vá em Project Settings > Database e anote estes dados:

- Host.
- Port.
- Database.
- User.
- Password.

Se o Supabase mostrar uma connection string completa, você pode usar ela direto via `DATABASE_URL`.
Se o host direto falhar no seu computador com erro de DNS ou `getaddrinfo ENOENT`, use o **Session pooler** em vez do host direto. No Supabase, clique em **Connect** e escolha a conexão de **session mode**; ela é a opção mais compatível com redes IPv4-only. Outra alternativa é contratar o add-on de IPv4 do Supabase.

### Passo 2 — Criar as tabelas no Supabase

1. Abra o SQL Editor no Supabase.
2. Crie uma nova query.
3. Abra o arquivo [backend/database/migrations.sql](backend/database/migrations.sql).
4. Copie todo o conteúdo desse arquivo.
5. Cole no SQL Editor do Supabase.
6. Execute a query.

Se der tudo certo, as tabelas `usuarios`, `chapas`, `retalhos`, `cortes` e `empresa` serão criadas.

### Passo 3 — Inserir dados de exemplo

1. Ainda no Supabase, abra novamente o SQL Editor.
2. Crie uma nova query.
3. Abra o arquivo [backend/database/seed.js](backend/database/seed.js).
4. Esse arquivo já faz inserts via Node.js, então você não cola ele no SQL Editor.
5. Em vez disso, você vai rodar o seed depois que o backend estiver apontando para o Supabase.

O seed cria dados de exemplo para mostrar na banca. Se quiser deixar o banco limpo, você pode pular essa etapa.

### Passo 4 — Preparar o backend para produção

1. No GitHub, confirme que o repositório está atualizado.
2. No Render, crie um novo Web Service.
3. Conecte o repositório do GitHub.
4. Selecione a pasta `backend` como root, se a interface pedir.
5. Use o comando de build `npm install`.
6. Use o comando de start `npm start`.
7. Escolha uma região próxima.

Nas variáveis de ambiente do backend, configure:

- `DATABASE_URL` com a connection string do Supabase, se quiser usar uma única URL.
- `DB_SSL=true`.
- `JWT_SECRET` com uma chave longa e forte.
- `JWT_EXPIRES_IN=8h` ou outro valor desejado.
- `FRONTEND_URL` com a URL que o Vercel vai gerar depois.
- `PORT=3001` pode ficar padrão.

Se você estiver usando o **Session pooler**, prefira colar a `DATABASE_URL` dele no Render em vez de preencher `DB_HOST` manualmente.

Se preferir usar variáveis separadas em vez de `DATABASE_URL`, preencha:

- `DB_HOST`.
- `DB_PORT`.
- `DB_NAME`.
- `DB_USER`.
- `DB_PASSWORD`.

### Passo 5 — Rodar as migrations e o seed no backend

Depois que o backend estiver apontando para o Supabase, você precisa executar uma vez as migrations e o seed.

Se estiver rodando localmente, faça assim:

1. Entre na pasta `backend`.
2. Instale as dependências com `npm install`.
3. Copie [backend/.env.example](backend/.env.example) para `.env`.
4. Preencha os dados do Supabase no `.env`.
5. Rode `npm run migrate`.
6. Rode `npm run seed`.
7. Suba o backend com `npm start`.

Se estiver usando o Render, você pode abrir um shell da aplicação ou rodar esses comandos na sua máquina local, com o `.env` apontando para o banco do Supabase.

### Passo 6 — Verificar o banco no Supabase

1. No Supabase, entre em Table Editor.
2. Abra a tabela `usuarios`.
3. Confira se os registros do seed apareceram.
4. Faça o mesmo com `chapas`, `retalhos` e `cortes`.

Esse é o ponto principal para a banca: o professor consegue ver os dados pelo painel do Supabase sem precisar acessar sua máquina.

### Passo 7 — Preparar o frontend para o Vercel

1. No Vercel, clique em Add New > Project.
2. Conecte o repositório do GitHub.
3. Selecione a pasta `frontend` como root, se necessário.
4. O Vercel normalmente detecta Vite automaticamente.
5. Confirme o build command como `npm run build`.
6. Confirme o output directory como `dist`.

Nas variáveis de ambiente do frontend, configure:

- `VITE_API_URL` apontando para a URL pública do backend, por exemplo `https://sua-api.onrender.com/api`.

### Passo 8 — Ajustar CORS no backend

Depois que o frontend estiver publicado, copie a URL final do Vercel e coloque em `FRONTEND_URL` no backend.

Use a URL completa com `https://`, por exemplo `https://tetus-manager.vercel.app`. Se você colar só o domínio sem protocolo, o backend agora tenta corrigir isso automaticamente, mas a forma recomendada continua sendo usar a URL completa.

Isso é importante porque o backend bloqueia chamadas de origens diferentes por segurança.

### Passo 9 — Testar o sistema publicado

1. Abra a URL do frontend no Vercel.
2. Faça login com um usuário do seed.
3. Acesse o dashboard.
4. Tente listar chapas e retalhos.
5. Abra o Supabase e confira se os dados estão sendo lidos e gravados.

### Passo 10 — Se algo der errado

- Se o frontend não carregar dados, confira `VITE_API_URL`.
- Se o backend não conectar no banco, confira `DATABASE_URL` e `DB_SSL=true`.
- Se der erro de CORS, confira `FRONTEND_URL`.
- Se o login falhar, confira se o seed foi executado e se o `JWT_SECRET` foi definido.
- Se o deploy do backend falhar, verifique se o diretório correto é `backend` e se o start command é `npm start`.

### Passo a passo resumido

1. Crie um projeto no Supabase e copie as credenciais de conexão.
2. No Supabase, rode o conteúdo de [backend/database/migrations.sql](backend/database/migrations.sql) no SQL Editor.
3. Aponte o backend para esse banco com `DATABASE_URL` ou com `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` e `DB_SSL=true`.
4. Publique o backend no Render com o comando de start `npm start`.
5. Publique o frontend no Vercel com `VITE_API_URL` apontando para a URL pública do backend.
6. Rode o seed uma vez para popular o banco com dados de exemplo, usando o mesmo banco do Supabase.

### Variáveis de ambiente

Backend:

- `DATABASE_URL` opcional, se o provedor entregar uma URL única.
- `DB_SSL=true` para bancos gerenciados como Supabase.
- `FRONTEND_URL` com a URL pública do frontend.
- `JWT_SECRET` com uma chave longa e segura.

Frontend:

- `VITE_API_URL=https://sua-api.onrender.com/api`

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
