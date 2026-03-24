# Audio Archive — Backend

.NET 10 REST API for the Audio Archive project. Serves music metadata and static audio files, backed by PostgreSQL and Redis.
This is made with local usage only, not made or tested with user scaling in mind. 

## Stack

- **Runtime** — .NET 10 / ASP.NET Core
- **Database** — PostgreSQL
- **Cache** — Redis
- **ORM** — Entity Framework Core (Npgsql)
- **Containerization** — Docker

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) + Docker Compose
- PostgreSQL and Redis (or run them via Docker — see below)

---

## Getting Started

### Development (without Docker)

1. Clone the repo

```bash
git clone https://github.com/your-org/audio-archive-backend.git
cd audio-archive-backend
```

2. Start necessary containers

```bash
docker compose up
```

3. Apply migrations

```bash
dotnet ef database update
```

4. Run it

```bash
dotnet run

# or

dotnet watch
```

API will be available at `http://localhost:8080`.

---

### Running with Docker Compose

The recommended way — spins up the API, PostgreSQL, Redis, the backup and the front-end service together.

#### Related repositories

- **Frontend** — [audio-archive-frontend](https://github.com/R-uan/audio-archive-frontend) — Next.js + Bun
- **Infra** — [audio-archive](https://gist.github.com/R-uan/5aca099c35315b3b4dbbb99bede87b40) — Docker Compose, shared config

```
/parent/folder/
├── audio-archive-backend/ 
├── audio-archive-frontend/
└── docker-compose.yaml/
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
| `ASPNETCORE_ENVIRONMENT` | Runtime environment | `Production` |
| `ConnectionStrings__Postgres` | PostgreSQL connection string | `Host=postgres;Port=5432;...` |
| `ConnectionStrings__Redis` | Redis connection string | `redis:6379` |
| `StaticFiles` | Path to music files on the host | `<you-should-change-this>` |

These override anything in `appsettings.Development.json` at runtime.

---

## Database Migrations

### Apply migrations

> Don't do this if you have a backup already

```bash
# Against local DB
dotnet ef database update

# Against the running Docker container DB
dotnet ef database update --connection "Host=localhost;Port=5434;Database=prod;Username=postgres;Password=secret"
```

---

## Backups

> You should change the path where the backups will be stored.

PostgreSQL backups are handled by the `prodrigestivill/postgres-backup-local` container defined in the compose file. Backups are written to `<your-path-here>` on the host and organized into:

```
/your/path/here/
├── last/       # most recent backups
├── daily/
├── weekly/
└── monthly/
```

To restore from a backup:

```bash
gunzip -c backup.sql.gz | docker exec -i audio_archive_postgres psql -U postgres -d prod
```
