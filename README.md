# Audio Archive

Self-hosted local audio library — browse, tag, and stream a personal music collection.

| Path | Stack | Role |
|---|---|---|
| [`backend/`](backend/) | .NET 10 / ASP.NET Core, PostgreSQL, Redis | REST API + static audio serving |
| [`frontend/`](frontend/) | Next.js (Bun) | Web interface |

> Built for local use only — not designed or tested for multi-user scale.

## Quick start

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Interface | http://localhost:3099 |
| API | http://localhost:5000 |
| Redis | localhost:6374 |

## Documentation

- [Getting started](docs/getting-started.md)
- [Backend](docs/backend.md)
- [Frontend](docs/frontend.md)
- [Environment variables](docs/environment-variables.md)
- [Backups](docs/backups.md)
