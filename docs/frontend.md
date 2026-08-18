# Frontend

Next.js (Bun) web interface that talks to the backend to browse and stream the library.

## Stack

- **Runtime** — Bun
- **Framework** — Next.js (App Router)
- **Containerization** — Docker

## Local development

1. Install dependencies:

   ```bash
   cd frontend
   bun install
   ```

2. Create `.env.local` with the required variables (see [environment-variables.md](environment-variables.md)):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_MEDIA_URL=http://localhost:5000/media
   ```

3. Run it:

   ```bash
   bun run dev
   ```

   The interface is available at http://localhost:3000.

> The backend must be running — either locally or via `docker compose up`.
