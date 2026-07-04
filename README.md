# Self-Monitoring

> A personal dashboard for tracking finances and workouts — built with FastAPI and React.

---

## Overview

Self-Monitoring is a full-stack personal productivity app with two independent modules:

- **Finance** — income/expense tracking, account and category management, spending visualization
- **Workouts** — training log, exercise library, weight and performance progress tracking

Both modules share a single authentication system and a unified dark UI.

---

## Features

### Finance

- Create and manage **accounts** and **expense categories**
- Log **transactions** (income / expense) with dates and descriptions
- Balance summary across all accounts for any period
- Toggle to include/exclude a category from analytics charts
- **Analytics**: income/expense trends, cumulative balance, savings rate, period-over-period comparison, day-of-week spending patterns, monthly averages, largest transaction

### Workouts

- Exercise library classified by **muscle group** and **type** (Strength / Cardio / Stretching)
- Training sessions logging **weight** and **reps** for each exercise
- Exercise profile: personal record, last workout date, full history, weight progress chart
- **Analytics**: workout frequency, training volume by period, muscle group distribution, top exercises by sets, personal records table

### Platform

- JWT authentication with automatic redirect on session expiry
- Admin panel (SQLAdmin) for data management
- Telegram bot integration

---

## Tech Stack

### Backend

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Framework      | FastAPI 0.137                        |
| ORM            | SQLAlchemy 2.0 (async)               |
| DB driver      | asyncpg                              |
| Database       | PostgreSQL                           |
| Migrations     | Alembic                              |
| Validation     | Pydantic v2                          |
| Authentication | python-jose (JWT) · passlib (bcrypt) |
| Server         | Uvicorn                              |
| Admin panel    | SQLAdmin                             |
| Bot            | aiogram 3                            |

### Frontend

| Layer     | Technology          |
| --------- | ------------------- |
| Framework | React 19             |
| Bundler   | Vite (rolldown)      |
| Routing   | React Router DOM 7   |
| HTTP      | Axios                |
| Charts    | Recharts             |
| Icons     | Lucide React         |

---

## Getting Started

### Requirements

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend

```
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.template .env
# Fill in DATABASE_URL, SECRET_KEY, etc.

# Apply migrations
alembic upgrade head

# Start the server
uvicorn backend.finance_app.app.main:app --reload
```

### Frontend

```
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

---

## API

Interactive documentation is available at `http://localhost:8000/docs` once the server is running.
