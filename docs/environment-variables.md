# Environment Variables

## Backend

| Variable | Description | Example |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Runtime environment | `Production`, `Development` |
| `ConnectionStrings__Postgres` | PostgreSQL connection string | `Host=127.0.0.1;Port=5435;Database=aateste;Username=postgres;Password=postgres;` |
| `ConnectionStrings__Redis` | Redis connection string | `localhost:6375` |
| `StaticFiles` | Host path to the audio files | `/mnt/hdd/home/music` |

Local development defaults live in `backend/appsettings.Development.json`. These are overridden at runtime by environment variables.

## Frontend

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL (browser-side calls) | `http://localhost:5000/api` |
| `NEXT_PUBLIC_MEDIA_URL` | Media base URL (browser-side streaming) | `http://localhost:5000/media` |
| `API_URL` | API base URL (server-side/SSR calls) | `http://backend:8080/api` |

> `NEXT_PUBLIC_*` variables are inlined at build time and exposed to the browser. `API_URL` is server-only and can reference the internal Docker hostname directly.
