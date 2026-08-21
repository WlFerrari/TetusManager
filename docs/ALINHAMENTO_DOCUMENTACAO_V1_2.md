# TetusManager — Alinhamento funcional oficial v1.2

Este documento registra as decisões funcionais consolidadas durante o estágio e deve ser usado como referência ao lado das especificações formais em DOCX.

## Atores oficiais

- **Vendedor/Orçamentista**: consulta o estoque e visualiza detalhes de chapas e retalhos para apoiar orçamentos.
- **Estoquista**: herda as consultas do Vendedor/Orçamentista e gerencia chapas, retalhos, cortes e identificação física.
- **Administrador**: herda as funções do Estoquista e gerencia usuários, empresa, Dashboard e funções gerenciais.

> Por compatibilidade com o banco já implantado, o valor técnico do perfil comercial continua sendo `Vendedor`. A interface o apresenta como **Vendedor/Orçamentista**.

## Casos de uso oficiais

| Código | Caso de uso | Ator principal | Situação |
|---|---|---|---|
| UC01 | Gerenciar Usuários | Administrador | Implementado |
| UC02 | Visualizar Dashboard e Relatórios | Administrador | Dashboard implementado; Relatórios em evolução |
| UC03 | Gerenciar Chapas Brutas | Estoquista / Administrador | Implementado |
| UC04 | Registrar Corte e Gerar Retalho | Estoquista / Administrador | Implementado |
| UC05 | Gerar e Disponibilizar QR Code | Estoquista / Administrador | Implementado como serviço reutilizável |
| UC06 | Consultar Estoque | Vendedor/Orçamentista | Implementado |
| UC07 | Visualizar Detalhes da Peça | Vendedor/Orçamentista | Implementado |
| UC08 | Gerenciar Retalhos | Estoquista / Administrador | Implementado |

## Relacionamentos UML

- `UC04 <<include>> UC05` quando um corte gerar retalho reutilizável.
- `UC07 <<extend>> UC06` quando o usuário selecionar uma peça para abrir seus detalhes.
- **UC08 é independente**; não é `<<extend>>` de UC06.

## Regras de chapas

Estados oficiais:

1. `Disponível`
2. `Em uso`
3. `Inativa`

A exclusão operacional é **lógica**. O endpoint legado `DELETE /chapas/:id` foi mantido para compatibilidade, mas agora inativa a chapa e preserva o histórico.

Chapas podem registrar `localizacao` física opcional para aproximar o inventário digital do pátio.

O estado `Em uso` continua disponível no domínio para representar uma peça em processamento operacional. Entretanto, ao concluir o UC04, a chapa de origem passa para `Inativa`, pois ela não existe mais fisicamente com suas dimensões originais. Se houver sobra reutilizável, essa sobra passa a ser controlada exclusivamente como um novo retalho.

Uma chapa que já possui corte registrado não pode ser reativada como `Disponível`, evitando recriar no estoque uma área que já foi consumida ou transformada em retalho.

## Regras de retalhos

Estados oficiais:

1. `Disponível`
2. `Reservado`
3. `Consumido`
4. `Descartado`

O ciclo de vida passou a possuir operações explícitas de reservar e liberar reserva. Consumo e descarte preservam o registro e os campos de auditoria.

Retalhos podem ser:

- `AUTOMATICA`: gerados a partir de uma chapa pelo UC04;
- `MANUAL`: peças legadas que já existiam fisicamente antes da implantação.

Um retalho manual pode ter `origem = NULL`; não é criada uma chapa fictícia apenas para satisfazer o relacionamento.

## Registro de corte

Todo corte concluído transforma a chapa de origem em registro histórico `Inativa`. A chapa original não permanece simultaneamente no estoque com a sobra, pois isso duplicaria a quantidade física de material disponível.

Quando não existe sobra reutilizável:

- `cortes.retalho_id` permanece nulo;
- a chapa de origem é inativada;
- o histórico da OS continua registrado.

Quando existe sobra reutilizável:

- o retalho herda tipo, cor, espessura e localização da chapa quando esses valores não forem informados;
- recebe origem automática e vínculo com a chapa;
- recebe identificador e QR Code persistentes;
- a chapa de origem é inativada;
- somente o retalho representa a área física restante no estoque.

A operação de corte é transacional: corte, eventual retalho e inativação da chapa são confirmados ou revertidos juntos.

### Modelo geométrico atual

A versão atual usa um **modelo retangular simplificado de corte de guilhotina**. A interface calcula as duas sobras retangulares possíveis após o consumo informado e mantém a maior delas como retalho reutilizável. Geometrias irregulares e múltiplas sobras de um único corte estão fora do escopo desta versão.

## QR Code

O QR Code é um identificador estável, no formato lógico:

- `TETUS|CHAPA|<id>`
- `TETUS|RETALHO|<id>`

A etiqueta pode ser reimpressa sem gerar uma nova peça. Os dados mutáveis permanecem no sistema em vez de serem incorporados ao QR Code.

## Consulta de estoque

A consulta é baseada em filtros de banco de dados, não em IA. Os filtros suportados incluem, conforme o tipo de peça:

- nome/ID;
- tipo de rocha;
- status;
- espessura;
- dimensões mínimas;
- área mínima;
- origem do retalho;
- localização física.

## Segurança e rastreabilidade

- JWT continua obrigatório nas rotas protegidas.
- Permissões são verificadas no backend.
- Senhas são persistidas somente como hash.
- O sistema impede a inativação do último Administrador ativo.
- Exclusões de chapas, retalhos e usuários foram convertidas em operações lógicas para preservar rastreabilidade.

## Banco de dados

A migration `backend/database/alinhamento_v1_2.sql` complementa o schema existente com:

- `chapas.localizacao`;
- estado `Inativa` para chapa, substituindo `Esgotado`;
- `retalhos.origem_tipo`;
- `retalhos.localizacao`;
- garantia de `cortes.retalho_id` opcional;
- compatibilidade do número da OS como campo textual;
- correção de chapas antigas que permaneceram `Em uso` mesmo após possuir corte;
- índices auxiliares de localização e origem.

Execute normalmente:

```bash
cd backend
npm run migrate
npm run seed
```

O `migrate.js` executa primeiro a migration base e depois a migration de alinhamento.
