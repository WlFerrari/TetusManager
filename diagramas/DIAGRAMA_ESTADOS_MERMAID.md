# Diagrama de Estados — TetusManager v1.2

Versão alinhada às especificações oficiais. Chapa e Retalho possuem ciclos de vida distintos.

## Chapa

```mermaid
stateDiagram-v2
    [*] --> Disponivel
    Disponivel --> EmUso: registrar corte / há sobra reutilizável
    Disponivel --> Inativa: registrar corte / sem sobra
    Disponivel --> Inativa: inativar chapa
    EmUso --> Inativa: inativar chapa
    Inativa --> Disponivel: reativar / quando permitido
```

Estados persistidos:

- `Disponível`
- `Em uso`
- `Inativa`

A inativação é lógica e preserva cortes e retalhos relacionados.

## Retalho

```mermaid
stateDiagram-v2
    [*] --> Disponivel
    Disponivel --> Reservado: reservar
    Reservado --> Disponivel: liberar reserva
    Disponivel --> Consumido: consumir
    Reservado --> Consumido: consumir
    Disponivel --> Descartado: descartar
    Reservado --> Descartado: descartar
    Consumido --> [*]
    Descartado --> [*]
```

Estados persistidos:

- `Disponível`
- `Reservado`
- `Consumido`
- `Descartado`

Retalhos consumidos e descartados permanecem no banco para rastreabilidade.
