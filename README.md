# EBMS — Enterprise Banking Management System

Full-stack banking platform built for SOE 220 / INF 201. Implements 6 design patterns
(Factory, Adapter, Observer, Strategy, Chain of Responsibility, Decorator), a real-time
Anti-Fraud & Compliance Engine, JWT auth, and a React + Tailwind frontend.

## Stack

- Backend: Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA, Flyway, JJWT, springdoc OpenAPI
- Database: PostgreSQL (H2 for tests)
- Frontend: React 18, Vite, Tailwind CSS, Axios, React Router
- Build: Maven (backend), npm (frontend)

## Layout

```
bank-system/
├── backend/   Spring Boot REST API + fraud engine + observers
└── frontend/  React + Tailwind SPA
```

## Quick start

### 1. Database

Create a Postgres database called `ebms`:

```sql
CREATE DATABASE ebms;
```

Defaults: `localhost:5432`, user `postgres`, password `postgres`. Override via env vars
`DB_URL`, `DB_USER`, `DB_PASSWORD`.

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

API: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

A seed admin user is created automatically:
- Email: `admin@ebms.local`
- Password: `Admin12345`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000 (Vite proxies `/api` to the backend).

### 4. Tests

```bash
cd backend
mvn test
```

## Design patterns

| Category | Pattern | Location |
|---|---|---|
| Creational | Factory Method | `patterns/factory/AccountFactory.java` |
| Structural | Adapter | `patterns/adapter/{PaymentGateway, StripeAdapter, PayPalAdapter}.java` |
| Structural | Decorator | `patterns/decorator/{Encrypted, Logged}TransactionDecorator.java` |
| Behavioral | Observer | `patterns/observer/{TransactionEventPublisher, *Observer}.java` |
| Behavioral | Strategy | `patterns/fraud/FraudRule.java` + `Check*Rule.java` |
| Behavioral | Chain of Responsibility | `patterns/fraud/FraudFilterChain.java` |

## REST endpoints

Base URL: `http://localhost:8080/api`. All non-auth endpoints require `Authorization: Bearer <JWT>`.

- `POST /auth/register` — register
- `POST /auth/login` — login → returns JWT
- `POST /accounts/create` — create account (SAVINGS | CHECKING | PREMIUM)
- `GET  /accounts/my` — list current user accounts
- `GET  /accounts/{id}` — account detail
- `POST /transactions/deposit` — deposit (runs fraud check)
- `POST /transactions/withdraw` — withdraw (runs fraud check)
- `POST /transactions/transfer` — transfer (runs fraud check)
- `GET  /transactions/history?accountId=&page=&size=` — paginated history
- `GET  /admin/users` (admin) — all users
- `GET  /admin/accounts` (admin) — all accounts
- `PUT  /admin/users/{id}/deactivate` (admin) — soft-delete a user
- `GET  /fraud/alerts` (admin) — all flagged transactions
- `GET  /fraud/audit-log` (admin) — full compliance audit log
- `POST /fraud/rules/reload` (admin) — hot-reload fraud rules

## Fraud engine config (application.yml)

```yaml
ebms:
  fraud:
    velocity:
      window-minutes: 10
      max-tx: 10
    blocked-countries: KP,IR,SY
```

## Postman

Import `EBMS_API.postman_collection.json` from the repo root.
