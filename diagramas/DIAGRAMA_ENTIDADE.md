# Diagrama de Entidades — TetusManager v1.2

Modelo lógico alinhado às especificações de caso de uso revisadas.

```mermaid
erDiagram
    USUARIOS ||--o{ CHAPAS : cria
    USUARIOS ||--o{ RETALHOS : cria
    USUARIOS ||--o{ CORTES : registra
    CHAPAS ||--o{ CORTES : recebe
    CHAPAS o|--o{ RETALHOS : origem
    RETALHOS o|--o{ CORTES : resultado

    USUARIOS {
        serial id PK
        varchar nome
        varchar email UK
        varchar senha_hash
        varchar perfil
        varchar status
        jsonb permissoes
    }

    CHAPAS {
        varchar id PK
        varchar nome
        varchar tipo
        varchar cor
        numeric largura
        numeric comprimento
        numeric espessura
        varchar status
        text localizacao
        text qr_code
        int criado_por FK
    }

    RETALHOS {
        varchar id PK
        varchar origem FK
        varchar origem_tipo
        varchar nome
        varchar tipo
        varchar cor
        numeric largura
        numeric comprimento
        numeric espessura
        numeric area
        varchar status
        text localizacao
        text qr_code
        int criado_por FK
        int consumido_por FK
        int descartado_por FK
    }

    CORTES {
        serial id PK
        varchar os_numero
        varchar chapa_id FK
        varchar retalho_id FK
        numeric comprimento_consumido
        numeric largura_consumida
        numeric area_consumida
        numeric area_retalho
        text observacao
        int criado_por FK
    }

    EMPRESA {
        int id PK
        varchar nome
        varchar cnpj
        varchar email
        varchar telefone
        text endereco
        text logo
        varchar plano
    }
```

## Regras importantes

- `RETALHOS.origem` é opcional para peças manuais/legadas.
- `RETALHOS.origem_tipo` usa `AUTOMATICA` ou `MANUAL`.
- `CORTES.retalho_id` é opcional porque um corte pode consumir a chapa sem gerar sobra reutilizável.
- `CHAPAS.localizacao` e `RETALHOS.localizacao` são opcionais.
- Chapas e retalhos utilizam exclusão lógica para preservar rastreabilidade.
