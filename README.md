
# OMNI Technical Challenge

## 1. Descrição
Você irá criar uma API REST simples para simular transações de dinheiro entre usuários. O objetivo é avaliar seu raciocínio lógico, organização do código e entendimento básico de backend.

## 2. O que você deve fazer
Implemente as rotas abaixo. Não se preocupe em fazer tudo perfeito! O importante é mostrar seu raciocínio, comentar o código e entregar algo funcional.


### 1. Cadastro de usuário
Crie uma rota para cadastrar novos usuários.

**Exemplo:**
```
POST /users/signup
{
  "username": "joao",
  "password": "123456",
  "birthdate": "2000-01-01"
}

Resposta (201 CREATED):
{
  "id": "1"
}
```

### 2. Login de usuário
Crie uma rota para login, que retorna um token simples

**Exemplo:**
```
POST /users/signin
{
  "username": "joao",
  "password": "123456"
}

Resposta (200 OK):
{
  "token": "abc123",
  "expiresIn": "1h"
}
```

### 3. Rotas de autenticação

#### a) Refresh de token
Permite renovar o token de autenticação antes do vencimento.

**Exemplo:**
```
POST /auth/refresh
Headers: Authorization: Bearer <token>

Resposta (200 OK):
{
  "token": "novoToken456",
  "expiresIn": "1h"
}
```

#### b) Logout (invalidação de token)
Permite invalidar o token atual (logout simples, pode ser apenas simbólico em memória).

**Exemplo:**
```
POST /auth/logout
Headers: Authorization: Bearer <token>

Resposta: 204 NO CONTENT
```

#### c) Validação de token
Permite verificar se um token é válido.

**Exemplo:**
```
POST /auth/validate
Headers: Authorization: Bearer <token>

Resposta (200 OK):
{
  "valid": true
}
```

### 4. Listar todos os usuários
Crie uma rota para listar todos os usuários cadastrados (mostre saldo, nome e data de nascimento). Precisa de autenticação.

**Exemplo:**
```
GET /users
Headers: Authorization: Bearer <token>

Resposta (200 OK):
[
  {
    "id": "1",
    "username": "joao",
    "birthdate": "2000-01-01",
    "balance": 100
  }
]
```

### 5. Consultar saldo de um usuário
Permita que o usuário autenticado consulte seu próprio saldo.

**Exemplo:**
```
GET /users/me/balance
Headers: Authorization: Bearer <token>

Resposta (200 OK):
{
  "balance": 150
}
```

### 6. Histórico de transações do usuário
Permita que o usuário autenticado veja seu histórico de transferências (enviadas e recebidas).

**Exemplo:**
```
GET /users/me/transactions
Headers: Authorization: Bearer <token>

Resposta (200 OK):
[
  {
    "type": "sent",
    "toId": "2",
    "amount": 50,
    "date": "2026-05-26T10:00:00Z"
  },
  {
    "type": "received",
    "fromId": "3",
    "amount": 20,
    "date": "2026-05-25T15:00:00Z"
  }
]
```

### 7. Transferência de dinheiro
Crie uma rota para transferir dinheiro de um usuário para outro. Use autenticação simples (token do login).

**Exemplo:**
```
POST /transfer
Headers: Authorization: Bearer <token>
{
  "toId": "2",
  "amount": 50
}

Resposta: 204 NO CONTENT
```

### 8. Atualizar dados do usuário
Permita que o usuário autenticado atualize seus dados

**Exemplo:**
```
PUT /users/me
Headers: Authorization: Bearer <token>
{
  ... a definir
}

Resposta (200 OK):
{
  ... a definir
}
```

### 9. Excluir usuário
Permita que o usuário autenticado exclua sua própria conta.

**Exemplo:**
```
DELETE /users/me
Headers: Authorization: Bearer <token>

Resposta: 204 NO CONTENT
```


## 3. Tecnologias sugeridas
- NestJS (ou Express, se preferir)
- Persistência em memória (array/objeto em JS) ou banco de dados simples (opcional)
- Testes automatizados (opcional, mas se quiser tentar, vale ponto extra!)
- Docker e deploy são totalmente opcionais

## 4. Dicas para o desafio
- Comente seu código explicando o que está fazendo
- Se não souber algo, explique na documentação como faria
- Faça commits frequentes mostrando seu raciocínio
- Se não conseguir terminar tudo, entregue o que fez e explique o que faltou

## 5. Recursos de apoio
- [Documentação NestJS](https://docs.nestjs.com/)
- [Documentação Express](https://expressjs.com/pt-br/)
- [Exemplo de API simples em Node.js](https://github.com/luizomf/simple-node-api)

Boa sorte! :)

---

## Documentação da implementação

Para detalhes sobre a arquitetura, pipeline CI/CD e as APIs implementadas (incluindo exemplos de request/response), consulte o arquivo [documentation.md](./documentation.md).
