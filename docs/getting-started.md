# Getting Started

## Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose
- [Bun](https://bun.sh/) — frontend development only
- [.NET 10 SDK](https://dotnet.microsoft.com/download) — backend development only

## Run the full stack (recommended)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Interface (frontend) | http://localhost:3099 |
| API (backend) | http://localhost:5000 |
| Redis | localhost:6374 |

PostgreSQL is provided externally on the `bny_shared` Docker network (see `docker-compose.yaml`) — it is not started by this compose file.

## Run services individually

- Backend (API + dev PostgreSQL/Redis): [backend.md](backend.md)
- Frontend: [frontend.md](frontend.md)
