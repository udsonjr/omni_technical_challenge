# Documentação

## Visão Geral do Projeto

Este projeto é uma API REST desenvolvida com **NestJS 11** (Node.js + TypeScript) como solução para o desafio técnico da OMNI. 

Toda a persistência de dados é feita **em memória** — não há banco de dados externo. Cada repositório mantém um array privado que age como a fonte de dados durante o ciclo de vida da aplicação. Essa decisão foi tomada levando em conta a simplicidade de implementação, priorizando o investimento de tempo em partes mais cruciais de uma aplicação real, como padronização e testes.

---

## Estrutura e Organização

O projeto segue a arquitetura modular padrão do NestJS, com separação clara de responsabilidades em três camadas por módulo: **Controller → Service → Repository**.

```
src/
├── app.module.ts          # Módulo raiz — importa os três módulos da aplicação
├── main.ts                # Bootstrap da aplicação (porta 3000)
├── auth/                  # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.repository.ts
│   ├── auth.module.ts
│   ├── auth.interfaces.ts
│   ├── bearer-token.decorator.ts   # Decorator customizado para extrair o token do header
│   └── dto/
│       └── auth-token.dto.ts
├── transfer/              # Módulo de transferências
│   ├── transfer.controller.ts
│   ├── transfer.service.ts
│   ├── transfer.repository.ts
│   ├── transfer.module.ts
│   ├── transfer.interfaces.ts
│   └── dto/
│       └── transfer-request.dto.ts
└── users/                 # Módulo de usuários
    ├── users.controller.ts
    ├── users.service.ts
    ├── users.repository.ts
    ├── users.module.ts
    ├── users.interface.ts
    └── dto/
        ├── create-user.dto.ts
        ├── public-user.dto.ts
        ├── signin.dto.ts
        └── update-user.dto.ts

test/
└── unit/
    ├── auth/
    │   ├── auth.controller.spec.ts
    │   └── auth.service.spec.ts
    ├── transfer/
    │   ├── transfer.controller.spec.ts
    │   └── transfer.service.spec.ts
    └── users/
        ├── users.controller.spec.ts
        └── users.service.spec.ts
```

### Módulos

| Módulo | Responsabilidade |
|--------|-----------------|
| **UsersModule** | Cadastro, autenticação, consultas e gerenciamento do perfil do usuário |
| **AuthModule** | Gerenciamento do ciclo de vida dos tokens Bearer (criação, refresh, logout, validação) |
| **TransferModule** | Execução de transferências monetárias entre usuários; importa `AuthModule` e `UsersModule` |

### Persistência em memória

Cada repositório (`@Injectable()`) é um singleton gerenciado pelo contêiner de DI do NestJS. Isso significa que o array interno de cada repositório persiste durante toda a execução da aplicação, mas é perdido ao reiniciar o processo — comportamento adequado para o contexto do desafio.

---

## Pipeline CI/CD

O arquivo `.github/workflows/cicd-pipeline.yml` define uma pipeline executada automaticamente em todo **push** ou **pull request** para a branch `main`. Os jobs rodam em `ubuntu-latest` com Node.js 20.

### Etapas da pipeline

```
1. Checkout do código        → actions/checkout@v4
2. Configurar Node.js 20     → actions/setup-node@v4 (com cache do npm)
3. Instalar dependências     → npm ci
4. Executar testes unitários → npm test -- --no-coverage
5. Verificar lint            → npm run lint:check
6. Verificar formatação      → npm run format:check
```

### Testes unitários

Os testes ficam em `test/unit/` e são executados pelo **Jest** com transformação via `ts-jest`. Cada módulo possui specs para o Controller e o Service, com mocks manuais (`jest.fn()`) dos repositórios e dependências. Os casos cobertos incluem o caminho feliz e a propagação de exceções conhecidas (`BadRequestException`, `UnauthorizedException`).


### Lint e formatação

O projeto usa **ESLint** com configuração flat (`eslint.config.mjs`) integrado ao plugin `eslint-plugin-prettier`, o que faz o Prettier ser aplicado como uma regra de lint. As configurações do Prettier (`.prettierrc`) definem: aspas simples, vírgula trailing, largura de 100 caracteres, ponto-e-vírgula, LF como quebra de linha.

```bash
npm run lint:check        # verifica lint sem aplicar fixes (usado na CI)
npm run lint              # verifica lint e aplica fixes automáticos
npm run format:check      # verifica formatação sem alterar arquivos (usado na CI)
npm run format            # aplica formatação em src/ e test/
```

---

## APIs Implementadas

As APIs são listadas abaixo.

### API 1 — Cadastro de usuário *(pública)*

```
POST /users/signup
```

Recebe `username`, `password` e `birthdate` no body. Valida se o username já está em uso e cria o usuário na memória.

**Resposta — 201 Created**
```json
{
  "id": "b3e1c2d4-..."
}
```

---

### API 2 — Login de usuário *(pública)*

```
POST /users/signin
```

Recebe `username` e `password`. Valida as credenciais e, em caso de sucesso, cria um token Bearer com TTL de 1 hora.

**Resposta — 200 OK**
```json
{
  "token": "e296a16e-...",
  "expiresAt": "2026-05-29T14:00:00.000Z"
}
```

---

### API 3a — Refresh de token *(autenticada)*

```
POST /auth/refresh
Authorization: Bearer <token>
```

Expira o token atual e gera um novo com TTL renovado.

**Resposta — 200 OK**
```json
{
  "token": "f4a7b8c9-...",
  "expiresAt": "2026-05-29T15:00:00.000Z"
}
```

---

### API 3b — Logout *(autenticada)*

```
POST /auth/logout
Authorization: Bearer <token>
```

Expira o token imediatamente, invalidando a sessão do usuário.

**Resposta — 204 No Content** *(sem corpo)*

---

### API 3c — Validação de token *(autenticada)*

```
POST /auth/validate
Authorization: Bearer <token>
```

Verifica se o token existe e não está expirado.

**Resposta — 200 OK**
```json
{
  "valid": true
}
```

> Retorna `401 Unauthorized` caso o token seja inválido ou expirado.

---

### API 4 — Lista de usuários *(autenticada)*

```
GET /users
Authorization: Bearer <token>
```

Retorna a lista de todos os usuários cadastrados (excluindo usuários deletados e campos sensíveis como senha).

**Resposta — 200 OK**
```json
[
  {
    "id": "b3e1c2d4-...",
    "username": "joao1",
    "birthdate": "2000-01-01",
    "balance": 1000
  }
]
```

---

### API 5 — Saldo do usuário *(autenticada)*

```
GET /users/me/balance
Authorization: Bearer <token>
```

Retorna o saldo atual do usuário autenticado.

**Resposta — 200 OK**
```json
{
  "balance": 1000
}
```

---

### API 6 — Histórico de transações *(autenticada)*

```
GET /users/me/transactions
Authorization: Bearer <token>
```

Retorna o array de transações do usuário autenticado (transferências enviadas e recebidas).

**Resposta — 200 OK**
```json
[
  {
    "type": "sent",
    "toId": "c9f2e1a0-...",
    "amount": 50,
    "date": "2026-05-29T13:00:00.000Z"
  },
  {
    "type": "received",
    "fromId": "a1b2c3d4-...",
    "amount": 200,
    "date": "2026-05-29T12:00:00.000Z"
  }
]
```

---

### API 7 — Transferência entre usuários *(autenticada)*

```
POST /transfer
Authorization: Bearer <token>
Body: { toId, amount }
```

Valida o token, o usuário de destino e impede auto-transferência. Deduz o `amount` do saldo do remetente, adiciona ao saldo do destinatário e registra a transação em ambos os perfis.

**Resposta — 204 No Content** *(sem corpo)*

---

### API 8 — Atualizar dados do usuário *(autenticada)*

```
PUT /users/me
Authorization: Bearer <token>
Body: { birthdate }
```

Atualiza os dados do usuário autenticado. Nesta implementação, apenas o campo `birthdate` é atualizável.

**Resposta — 200 OK**
```json
{
  "id": "b3e1c2d4-...",
  "username": "joao1",
  "birthdate": "2026-05-29",
  "balance": 1000
}
```

---

### API 9 — Excluir usuário *(autenticada)*

```
DELETE /users/me
Authorization: Bearer <token>
```

Realiza a exclusão lógica do usuário (soft delete via campo `deletedAt`) e expira o token da sessão ativa.

**Resposta — 204 No Content** *(sem corpo)*

---

## Testando as APIs

O arquivo [`postman_collection.json`](./postman_collection.json) contém uma coleção do **Postman** com todas as 9 APIs pré-configuradas, incluindo método, endpoint e body de exemplo.

### Como importar

1. Abra o [Postman](https://www.postman.com/)
2. Clique em **Import** e selecione o arquivo `postman_collection.json`
3. Configure a variável de ambiente `env` com a URL base da aplicação (ex.: `http://localhost:3000`)
4. Execute as requisições na ordem numérica: comece pelo **cadastro (1)** e **login (2)** para obter um token, depois use-o nas rotas autenticadas
