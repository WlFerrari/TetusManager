# Diagrama de Classes Minimalista (Backend + Frontend)

> Objetivo: diagrama enxuto com **atributos principais** e **relacionamentos entre classes**.

```mermaid
classDiagram
direction TB
%% =========================
%% Backend (Node/Express)
%% =========================

class AuthController {
  +login(req, res)
}

class ChapasController {
  +list(req, res)
  +show(req, res)
  +create(req, res)
  +update(req, res)
  +delete(req, res)
  +stats(req, res)
}

class RetalhosController {
  +list(req, res)
  +show(req, res)
  +create(req, res)
  +update(req, res)
  +consume(req, res)
  +delete(req, res)
  +stats(req, res)
}

class CortesController {
  +create(req, res)
}

class UsuariosController {
  +list(req, res)
  +create(req, res)
  +toggle(req, res)
  +updatePerms(req, res)
  +delete(req, res)
}

class EmpresaController {
  +get(req, res)
  +update(req, res)
}

class ChapaRepository {
  +findAll()
  +findById()
  +insert()
  +update()
  +delete()
  +stats()
}

class RetalhoRepository {
  +findAll()
  +findById()
  +insert()
  +update()
  +consume()
  +delete()
  +stats()
}

class UserRepository {
  +findAll()
  +findById()
  +findByEmail()
  +insert()
  +update()
  +toggle()
  +delete()
}

class EmpresaRepository {
  +get()
  +update()
}

class Usuario {
  +id
  +nome
  +email
}

class Chapa {
  +id
  +nome
  +tipo
  +status
  +criadoPor
}

class Retalho {
  +id
  +origem
  +status
  +criadoPor
  +consumidoPor
}

class AuthMiddleware {
  +authMiddleware(req, res, next)
  +requirePerm(perm)
}

class DatabaseConnection {
  +query(sql, params)
}

%% =========================
%% Frontend (React)
%% =========================

class ApiService {
  +apiFetch(url, options)
  +get(url)
  +post(url, body)
  +put(url, body)
  +patch(url, body)
  +del(url)
}

class ChapasApi {
  +listar()
  +criar()
  +atualizar()
  +deletar()
  +stats()
}

class RetalhosApi {
  +listar()
  +criar()
  +atualizar()
  +consumir()
  +deletar()
  +stats()
}

class UsuariosApi {
  +listar()
  +criar()
  +toggle()
  +permissoes()
  +deletar()
}

class AuthApi {
  +login()
}

class EmpresaApi {
  +get()
  +update()
}

class CortePage {
  -estadoForm
  +onSubmit()
}

class ChapasPage {
  -filtro
  +carregar()
}

class RetalhosPage {
  -filtro
  +carregar()
}

class UsuariosPage {
  -filtro
  +carregar()
}

class DashboardPage {
  +carregar()
}

class LoginPage {
  -credenciais
  +onSubmit()
}

%% =========================
%% Relacionamentos (com cardinalidade)
%% =========================

AuthController "1" --> "1" UserRepository
ChapasController "1" --> "1" ChapaRepository
RetalhosController "1" --> "1" RetalhoRepository
CortesController "1" --> "1" RetalhoRepository
UsuariosController "1" --> "1" UserRepository
EmpresaController "1" --> "1" EmpresaRepository

AuthMiddleware "1" --> "1" UserRepository
ChapaRepository "1" --> "1" DatabaseConnection
RetalhoRepository "1" --> "1" DatabaseConnection
UserRepository "1" --> "1" DatabaseConnection
EmpresaRepository "1" --> "1" DatabaseConnection

ChapaRepository "1" --> "0..*" Chapa
RetalhoRepository "1" --> "0..*" Retalho
UserRepository "1" --> "0..*" Usuario

Usuario "1" --> "0..*" Chapa : criadoPor
Usuario "1" --> "0..*" Retalho : criadoPor
Usuario "1" --> "0..*" Retalho : consumidoPor
Chapa "1" --> "0..*" Retalho : origem

ChapasApi "1" --> "1" ApiService
RetalhosApi "1" --> "1" ApiService
UsuariosApi "1" --> "1" ApiService
AuthApi "1" --> "1" ApiService
EmpresaApi "1" --> "1" ApiService

CortePage "1" --> "1" ChapasApi
CortePage "1" --> "1" RetalhosApi
ChapasPage "1" --> "1" ChapasApi
RetalhosPage "1" --> "1" RetalhosApi
UsuariosPage "1" --> "1" UsuariosApi
DashboardPage "1" --> "1" ChapasApi
DashboardPage "1" --> "1" RetalhosApi
LoginPage "1" --> "1" AuthApi
