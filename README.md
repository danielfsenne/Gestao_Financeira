# Gestão Financeira Pessoal

Aplicação full stack para controle de finanças pessoais — gerencie receitas, despesas, categorias e metas de economia com dashboard visual e relatórios exportáveis em PDF.

---

## Funcionalidades

- **Autenticação** — cadastro e login com JWT
- **Dashboard** — resumo de receitas, despesas e saldo com gráfico de categorias
- **Transações** — cadastro, edição e exclusão de receitas e despesas
- **Categorias** — organização das transações por categoria
- **Metas de Economia** — criação de metas com valor alvo, progresso e prazo
- **Relatórios** — gráficos mensais e por categoria com export para PDF
- **Dark Mode** — alternância entre tema claro e escuro
- **Responsivo** — layout adaptado para mobile, tablet e desktop

---

## Tecnologias

### Backend
| Tecnologia | Versão |
|------------|--------|
| Java | 17 |
| Spring Boot | 3.3.0 |
| Spring Security + JWT | — |
| Spring Data JPA + Hibernate | — |
| PostgreSQL | 16 |
| Maven | 3.9 |
| Docker | — |

### Frontend
| Tecnologia | Versão |
|------------|--------|
| Angular | 17 |
| Angular Material | 17 |
| Chart.js | 4 |
| jsPDF | 4 |
| TypeScript | 5 |
| SCSS | — |

---

## Estrutura do Projeto

```
gestao_financeira/
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/gestao/financeira/
│   │   ├── controller/       # Endpoints REST
│   │   ├── service/          # Regras de negócio
│   │   ├── entity/           # Entidades JPA
│   │   ├── repository/       # Repositórios Spring Data
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── security/         # JWT + Spring Security
│   │   └── exception/        # Tratamento de erros
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                 # Angular SPA
│   ├── src/app/
│   │   ├── pages/            # Dashboard, Transações, Relatórios, Metas
│   │   ├── services/         # Serviços HTTP
│   │   ├── models/           # Interfaces TypeScript
│   │   ├── guards/           # Auth guard
│   │   ├── interceptors/     # JWT interceptor
│   │   └── environments/     # Config dev/prod
│   └── vercel.json
├── docker-compose.yml
└── render.yaml
```

---

## Rodando Localmente

### Pré-requisitos
- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 16

### Backend

1. Crie o banco de dados:
```sql
CREATE DATABASE gestao_financeira;
```

2. Inicie o servidor:
```bash
cd backend
mvn spring-boot:run
```

API disponível em `http://localhost:8081`  
Swagger UI em `http://localhost:8081/swagger-ui.html`

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

Aplicação disponível em `http://localhost:4200`

### Com Docker (backend + banco)

```bash
docker-compose up --build
```

---

## Variáveis de Ambiente (Backend)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DB_URL` | URL JDBC do PostgreSQL | `jdbc:postgresql://localhost:5432/gestao_financeira` |
| `DB_USERNAME` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `123456` |
| `JWT_SECRET` | Chave secreta para assinar tokens | valor padrão no `application.yml` |
| `JWT_EXPIRATION` | Expiração do token em ms | `86400000` (24h) |

---

## API — Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Cadastro de usuário |
| `POST` | `/auth/login` | Login |
| `GET` | `/dashboard` | Resumo financeiro |
| `GET/POST` | `/transactions` | Listar / criar transação |
| `PUT/DELETE` | `/transactions/{id}` | Editar / excluir transação |
| `GET/POST` | `/categories` | Listar / criar categoria |
| `GET/POST` | `/goals` | Listar / criar meta |
| `PUT/DELETE` | `/goals/{id}` | Editar / excluir meta |

Todos os endpoints (exceto `/auth/**`) exigem header:
```
Authorization: Bearer <token>
```

---

## Deploy

| Serviço | Plataforma |
|---------|------------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Banco de dados | Render PostgreSQL |

### Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npx ng build`
- Output Directory: `dist/frontend/browser`

### Backend (Render)
- Runtime: Docker
- Root Directory: `backend`
- Dockerfile: `./Dockerfile`

---

## Licença

MIT
