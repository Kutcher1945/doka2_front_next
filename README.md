# Cybert — Dota 2 Wagering Platform

Cybert is a real-money Dota 2 wagering platform. Players create or join lobbies with a set bet, connect their Steam account, and compete in live matches. Winnings are handled automatically after the game ends via a Steam bot that creates and manages in-game lobbies through the Dota 2 Game Coordinator.

**Production domains:**
- Frontend: `https://cybert.online`
- API: `https://api.cybert.online`

---

## Architecture Overview

```
┌─────────────────────┐     HTTPS/WS      ┌──────────────────────────────┐
│   Next.js Frontend  │ ◄────────────────► │   Django + Channels (ASGI)   │
│   (Vercel)          │                    │   Gunicorn / Daphne          │
└─────────────────────┘                    └──────────┬───────────────────┘
                                                      │
                              ┌───────────────────────┼───────────────────┐
                              │                       │                   │
                         ┌────▼────┐           ┌──────▼─────┐     ┌──────▼──────┐
                         │Postgres │           │   Redis     │     │  Celery     │
                         │   DB    │           │broker+layer │     │  Worker     │
                         └─────────┘           └────────────┘     └─────────────┘
                                                                         │
                                                               ┌─────────▼──────────┐
                                                               │  Steam Bot         │
                                                               │  Dota 2 GC client  │
                                                               └────────────────────┘
```

---

## Frontend

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand, React Query, NextAuth v5

### Pages

| Route | Description |
|---|---|
| `/` | Landing page; shows maintenance image if site is disabled |
| `/cabinet/lobby` | Browse and join active lobbies |
| `/cabinet/lobby/create` | Create a new lobby |
| `/cabinet/lobby/[id]` | Lobby room with real-time member updates |
| `/cabinet/wallet` | Wallet balances (regular / bonus / blocked) |
| `/cabinet/wallet/replenish` | Top up via card or Binance |
| `/cabinet/wallet/withdrawal` | Withdraw funds |
| `/cabinet/history` | Personal game history |
| `/cabinet/friends` | Friend list and incoming requests |
| `/cabinet/profile` | Profile, Steam connection, MMR |
| `/cabinet/profile/settings` | Change email, password, phone |
| `/recovery` | Password recovery |

### Auth

- **NextAuth v5** with Credentials provider
- Login hits `/token/login/` (djoser) → gets `auth_token` → fetches user from `/auth/data/`
- Token is stored in the JWT session and attached to every request via an Axios interceptor
- Middleware (`middleware.ts`) protects `/cabinet/*` — unauthenticated users are redirected to `/`

### API Client

All backend calls go through `/lib/api.ts` which exposes grouped clients: `authApi`, `lobbyApi`, `walletApi`, `communityApi`, `siteApi`.

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=<random>
STEAM_API_KEY=<key>
```

---

## Backend

**Stack:** Python 3.8, Django 3.2, Django REST Framework, Django Channels, Daphne, Celery

### Django Apps

| App | Responsibility |
|---|---|
| `authentication` | Registration, login, password recovery, Steam OpenID, SMS OTP |
| `authentication.verification` | KYC identity verification (Shuftipro) |
| `dota` | Lobbies, memberships, game history, player ratings, commission logic |
| `dota.report` | Player dispute reports |
| `payments.monetix` | Wallet management, card/Binance payments, multi-currency support |
| `payments.paybox` | Paybox payment gateway (secondary provider) |
| `community` | Friend system (send/accept/reject/remove) |
| `achievements` | Achievement tracking, async via Celery |
| `chat` | Pusher-based in-lobby chat |
| `accounting` | Platform earnings tracking per lobby |
| `sitestatus` | Maintenance toggle (`is_enabled` flag) |

### Key REST Endpoints

```
POST  /token/login/                  — get auth token
POST  /auth/users/                   — register
GET   /auth/data/                    — current user profile
PUT   /auth/data/                    — update profile
POST  /auth/send_sms/                — send OTP
POST  /auth/verify_sms_code/         — verify OTP
GET   /auth/steam/                   — initiate Steam OpenID
GET   /auth/steam/callback/          — Steam OpenID callback
POST  /auth/verification/verify/     — KYC submission

GET   /dota/lobby/                   — list lobbies
POST  /dota/lobby/                   — create lobby
GET   /dota/lobby/{id}/              — lobby detail
POST  /dota/membership/              — join lobby
DELETE /dota/membership/{id}/        — leave lobby
GET   /dota/lobby/current/           — user's active lobby
GET   /dota/game_history/            — personal game history
GET   /dota/game_history/commission/ — current commission rate

GET   /monetix/wallet/               — wallet balances
GET   /monetix/payments_handler/     — initiate payment
POST  /monetix/callback/replenish    — payment webhook
POST  /monetix/callback/withdrawal   — withdrawal webhook

GET   /community/friends/list/
POST  /community/friends/request/
POST  /community/friends/accept/
POST  /community/friends/reject/

GET   /site-status/                  — public, no auth required
```

### WebSockets (Django Channels)

Connected at `ws://<host>/ws/lobby/<lobby_id>/`

| Command | Direction | Description |
|---|---|---|
| `new_membership` | server → client | Someone joined the lobby |
| `remove_membership` | server → client | Someone left |
| `status_ready` | client → server | Player marked as ready |

Redis is the channel layer backend (`channels_redis`).

### Celery

- **Broker:** Redis (`redis://redis:6379`)
- **Result backend:** Django DB (`django-db` via `django_celery_results`)
- **Main task:** `controller_dota_task` — manages the full lifecycle of a Dota 2 match:
  1. Allocates a free Steam bot
  2. Debits each player's balance to `blocked_balance`
  3. Connects the bot to Steam + Dota 2 GC
  4. Creates in-game lobby, invites players
  5. Monitors game start and completion
  6. Settles winnings and releases blocked balances

---

## External Services

| Service | Purpose |
|---|---|
| **Steam OpenID** | Link user's Steam account |
| **Dota 2 GC** | Bot creates and manages in-game lobbies |
| **Monetix** | Card and Binance payments (multi-currency) |
| **Paybox** | Secondary payment gateway |
| **Shuftipro** | KYC / identity verification |
| **Twilio** | SMS OTP verification |
| **Pusher** | Real-time lobby chat |
| **OpenDota** | Dota 2 match stats |
| **Gmail SMTP** | Transactional email |

---

## Game Flow

```
1. User creates lobby (bet amount, game mode, slots)
          ↓
2. Other players join → real-time WebSocket updates to room
          ↓
3. All players ready → Celery task fires
   - Bets moved to blocked_balance
   - Steam bot allocated
          ↓
4. Bot connects to Dota 2 GC, creates lobby, invites players
          ↓
5. Match plays out
          ↓
6. Game ends → post-game handler settles wallets
   - Winner credited, loser's blocked balance cleared
   - Platform commission deducted (floating rate, decreases with games played)
          ↓
7. Game recorded in history, players can rate each other
```

---

## Wallet System

Each user has three balance fields:

| Field | Description |
|---|---|
| `balance` | Available funds |
| `bonus_balance` | Promotional balance |
| `blocked_balance` | Funds locked during an active match |

Supported currencies: KZT, USD, UAH, RUB, UZS

---

## Infrastructure

### Docker Compose (Backend)

```
services:
  db       — Postgres 15
  redis    — Redis 7 (broker + channel layer)
  web      — Django/Gunicorn on :8000
  celery   — Celery worker
```

Run:
```bash
cd doka2_back
docker compose up --build
```

### Gunicorn

- Bind: `0.0.0.0:8000`
- Workers: 3
- Timeout: 120s
- Config: `gunicorn_config.py`

### First-time Setup

```bash
# Grant DB permissions (PostgreSQL 15+)
sudo -u postgres psql -d cybert_db -c "GRANT ALL ON SCHEMA public TO cybert;"

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Environment Variables (Backend)

```env
SECRET_KEY=
DB_NAME=cybert_db
DB_USER=cybert
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

MONETIX_PROJECT_ID=
MONETIX_KEY=

SHUFTIPRO_CLIENT_ID=
SHUFTIPRO_SECRET_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=ap2

EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

---

## Project Structure

```
doka2/
├── doka2_back/                  # Django backend
│   ├── core/                    # Settings, URLs, ASGI, Celery config
│   ├── authentication/          # Users, Steam, SMS, KYC
│   ├── dota/                    # Lobbies, game logic, history
│   ├── payments/
│   │   ├── monetix/             # Primary payments
│   │   └── paybox/              # Secondary payments
│   ├── community/               # Friends
│   ├── achievements/
│   ├── chat/                    # Pusher chat
│   ├── accounting/
│   ├── sitestatus/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── requirements.txt
└── doka2_front_next/            # Next.js frontend (deployed on Vercel)
    ├── app/                     # App Router pages
    ├── components/
    ├── lib/
    │   └── api.ts               # Centralized API client
    ├── store/                   # Zustand stores
    ├── hooks/
    └── types/
```
