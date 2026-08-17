# Audio Archive — Frontend
Next.js + Bun client for the Audio Archive project. Interfaces with the backend to browse and stream music from a local file system.
This is made with local usage only, not made or tested with user scaling in mind.
## Stack
- **Runtime** — Bun
- **Framework** — Next.js
- **Containerization** — Docker
---
## Prerequisites
- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) + Docker Compose
- Backend running locally or via Docker — see below
---
## Getting Started
### Development (without Docker)
1. Clone the repo
```bash
git clone https://github.com/R-uan/audio-archive-frontend.git
cd audio-archive-frontend
```
2. Install dependencies
```bash
bun install
```
3. Set up your local environment
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MEDIA_URL=http://localhost:5000/media
API_URL=http://localhost:5000/api
```
4. Run it
```bash
bun run dev
```
Interface will be available at `http://localhost:3000`.

> Make sure the backend is running — either locally or via Docker Compose.

---
### Running with Docker Compose
The recommended way — spins up the frontend, backend, PostgreSQL, Redis, and the backup service together.
#### Related repositories
- **Backend** — [audio-archive-backend](https://github.com/R-uan/audio-archive-backend) — .NET 10 / ASP.NET Core
- **Infra** — [audio-archive](https://gist.github.com/R-uan/5aca099c35315b3b4dbbb99bede87b40) — Docker Compose, shared config
```
/parent/folder/
├── audio-archive-backend/
├── audio-archive-frontend/
└── docker-compose.yaml
```
```bash
docker compose up --build
```
| Service    | Exposed Host URL      |
|------------|-----------------------|
| Interface  | http://localhost:3099 |
| API        | http://localhost:5000 |
| PostgreSQL | localhost:5434        |
| Redis      | localhost:6374        |
---
## Environment Variables
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL for browser-side calls | `http://localhost:5000/api` |
| `NEXT_PUBLIC_MEDIA_URL` | Media base URL for browser-side streaming | `http://localhost:5000/media` |
| `API_URL` | API base URL for server-side calls (SSR) | `http://backend:8080/api` |

> `NEXT_PUBLIC_` variables are baked in at **build time** and exposed to the browser. `API_URL` is server-only and used during SSR — it can reference the internal Docker hostname directly.
---
## Backups
The frontend holds no persistent state — all data lives in the backend's PostgreSQL instance. See the [backend README](https://github.com/R-uan/audio-archive-backend) for backup instructions.
