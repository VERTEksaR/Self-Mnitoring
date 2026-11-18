# Self-Monitoring

> A personal dashboard for finances, workouts, language learning and Steam achievements — built with FastAPI and React.

---

## Overview

Self-Monitoring is a full-stack personal productivity app with four modules:

- **Finance** — income/expense tracking, account and category management, spending analytics
- **Workouts** — training log, exercise library, weight and performance progress tracking
- **Languages** — personal dictionary, grammar notes and spaced-repetition flashcards for any number of languages
- **Steam** — linked Steam accounts, tracked games, achievement progress and game news

All modules share one authentication system and a unified dark UI. Access is granted per user and per module.

---

## Features

### Finance

- Create and manage **accounts** and **expense categories**
- Log **transactions** (income / expense) with dates and descriptions
- Balance summary across all accounts for any period
- Toggle to include/exclude a category from analytics charts
- **Savings** accounts with an optional goal and a savings trend
- **Analytics**: income/expense trends, cumulative balance, savings rate, period-over-period comparison, day-of-week spending patterns, monthly averages, largest transaction

### Workouts

- Exercise library classified by **muscle group** and **type** (Strength / Cardio / Stretching)
- Training sessions logging **weight** and **reps** for each exercise
- Exercise profile: personal record, last workout date, full history, weight progress chart
- **Analytics**: workout frequency, training volume by period, muscle group distribution, top exercises by sets, personal records table

### Languages

- Several languages per user, each with a current and a target level (A1–C2)
- **Dictionary**: word, translation, transcription, part of speech, example and note; search by word or translation, pagination
- **Tags**: filter the dictionary by tag, create tags right from the word form, rename and delete them in the tag manager
- **Notes**: grammar notes and rules for each language
- **Spaced repetition** with Leitner boxes (next review in 1, 3, 7, 14, 30 days):
  - flashcards with keyboard shortcuts — `Space` show translation, `1` / `←` forgot, `2` / `→` remembered, `S` pronounce
  - review all due words or only words with a given tag
  - forgotten words come back at the end of the batch
  - word status: New / Learning / Learned
- **Pronunciation** via the browser Web Speech API — set a language code such as `es-ES` or `en-GB`

### Steam

- Sign in with Steam (OpenID) and link Steam accounts
- Player profile, owned and recently played games
- Tracked games with achievement progress, achievement details and game news

### Platform

- JWT authentication with automatic redirect on session expiry
- Per-user module access: new users get **Finance**, other modules are enabled by an admin
- Admin panel (SQLAdmin) at `/admin`, available to admin users only
- Redis cache for finance lists
- Telegram bot (work in progress)

---

## Tech Stack

### Backend

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Framework      | FastAPI 0.137                        |
| ORM            | SQLAlchemy 2.0 (async)               |
| DB driver      | asyncpg                              |
| Database       | PostgreSQL 16                        |
| Cache          | Redis 7                              |
| Migrations     | Alembic                              |
| Validation     | Pydantic v2                          |
| Authentication | python-jose (JWT) · passlib (bcrypt) |
| Server         | Uvicorn                              |
| Admin panel    | SQLAdmin                             |
| Bot            | aiogram 3                            |

### Frontend

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Framework | React 19                                      |
| Language  | JavaScript + TypeScript (API layer and types) |
| Bundler   | Vite (rolldown)                               |
| Routing   | React Router DOM 7                            |
| HTTP      | Axios                                         |
| Charts    | Recharts                                      |
| Icons     | Lucide React                                  |
| Speech    | Web Speech API                                |

### Infrastructure

Docker Compose: PostgreSQL, Redis, backend (Uvicorn) and frontend (nginx serving the build and proxying the API).

---

## Getting Started

### Requirements

- Python 3.11+
- Node.js 20.19+
- PostgreSQL 16
- Redis 7 — optional but recommended: without it the app works, but every finance request first waits for the Redis connection timeout

### Configuration

```
cp .env.template .env
```

Fill in at least `PASSWORD` and `SECRET_KEY`. The database connection is built from `HOST`, `PORT`, `DATABASE`, `DB_USERNAME` and `PASSWORD`.
Every Steam key must be present for the backend to start; `STEAM_API_KEY` may stay empty if you don't use the Steam module.

### Backend

```
pip install -r requirements.txt
alembic upgrade head
uvicorn backend.finance_app.app.main:app --reload
```

### Frontend

```
cd frontend
npm install
npm run dev
```

The dev server runs on `http://127.0.0.1:5173` and proxies API requests to `http://localhost:8000`.

### First run: modules and admin

Migrations create the tables but not the modules themselves. Create them **before** registering, so that new users get the Finance module:

```sql
INSERT INTO modules (name) VALUES ('finances'), ('trainings'), ('languages'), ('achievements');
```

Then register in the app and make yourself an admin with access to every module:

```sql
UPDATE users SET is_admin = true WHERE email = 'you@example.com';

INSERT INTO modules_users (user_id, module_id)
SELECT u.id, m.id FROM users u CROSS JOIN modules m
WHERE u.email = 'you@example.com'
ON CONFLICT DO NOTHING;
```

After that, modules for other users can be granted in the admin panel (`/admin`, the ModulesUsers table).

---

## Docker

```
cp .env.template .env      # fill in PASSWORD and SECRET_KEY
docker compose up --build
```

- The app is available at `http://localhost`; nginx serves the frontend and proxies the API, `/admin` and `/docs` to the backend
- PostgreSQL is created with `DB_USERNAME`, `PASSWORD` and `DATABASE` from `.env`
- The backend applies migrations on every start
- For Steam sign-in set `BASE_URL=http://localhost/` and `RETURN_STEAM_URL=http://localhost/steam/auth/callback/`

Run the first-run SQL from the section above inside the database container:

```
docker compose exec db psql -U <DB_USERNAME> -d <DATABASE>
```

---

## Project Structure

```
backend/finance_app/app/
  routers/      API endpoints: common (auth, users), finances, trainings, languages, steam
  schemas/      Pydantic schemas
  db/models/    SQLAlchemy models
  dependencies/ auth and per-module access
  utils/        shared helpers: 404/409 checks, cache keys, Leitner boxes
  admin/        SQLAdmin views
alembic/        database migrations
frontend/src/
  pages/        one page per module
  components/   UI by module
  api/          Axios clients
  types/        TypeScript types
  hooks/ utils/
telegram_bot/   Telegram bot (aiogram)
docs/           roadmaps
```

---

## API

Interactive documentation is available at `http://localhost:8000/docs` once the backend is running (`http://localhost/docs` in Docker).

## Roadmap

The Languages module roadmap — done and planned stages — is in [docs/languages-roadmap.md](docs/languages-roadmap.md).
