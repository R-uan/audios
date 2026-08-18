# Backend

.NET 10 / ASP.NET Core REST API. Serves audio metadata (PostgreSQL) and static audio files, with Redis caching.

## Stack

- **Runtime** — .NET 10 / ASP.NET Core
- **Database** — PostgreSQL (Entity Framework Core / Npgsql)
- **Cache** — Redis
- **Containerization** — Docker

## Local development

Run PostgreSQL and Redis from `backend/` (this keeps the API itself out of Docker):

```bash
cd backend
docker compose up
```

This starts PostgreSQL on `localhost:5435` and Redis on `localhost:6375`.

Then run the API:

```bash
dotnet run
# or
dotnet watch
```

The API is available at http://localhost:8080.

## Database migrations

> Skip this if you already have a database backup.

```bash
# Local development database
dotnet ef database update

# A specific database
dotnet ef database update --connection "Host=localhost;Port=5435;Database=aateste;Username=postgres;Password=postgres"
```

## Media files

The backend serves static audio from the host directory configured by `StaticFiles`, exposed under `/media/audio`.

See [environment-variables.md](environment-variables.md) for configuration.
