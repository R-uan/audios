# Backups & Restore

All persistent data lives in the backend's PostgreSQL database. The frontend holds no state.

## Backup

Use `pg_dump` against the database, adjusting the host/credentials to match your environment:

```bash
pg_dump -h <host> -p <port> -U <user> -d audio_archive -Fc -f backup.dump
```

## Restore

```bash
pg_restore -h <host> -p <port> -U <user> -d audio_archive backup.dump
```

> The root `docker-compose.yaml` does not define the PostgreSQL service — it connects to an external instance on the `bny_shared` network. Point the commands above at that instance.
