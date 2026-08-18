# Feature: Backend Control Panel (Blazor)

Status: Planning (features TBD)

## 1. Overview

Add an interactive **control panel** to the existing backend project, built with
**Blazor Interactive Server**, that lets an admin operate directly on the library
data. The existing public REST API (`/api/*`) and static media serving
(`/media/audio`) stay exactly as they are for the Next.js frontend; the panel is an
additional surface in the same host process.

## 2. Goals / Non-goals

Goals

- Add a Blazor-based UI hosted **inside** `backend/` (same process, same DI container).
- Reuse the existing services, `DatabaseContext`, and caching infrastructure.
- Keep the public API and the frontend contract unchanged.
- Provide a clean seam so the panel's actual data operations can be added incrementally.

Non-goals (for now)

- No authentication on the panel (decision below).
- No changes to the Next.js frontend.
- No new database schema unless a future panel feature requires it.

## 3. Decisions (confirmed)

| Decision | Choice | Rationale |
|---|---|---|
| Blazor hosting model | **Interactive Server** (SignalR) | Same process as the API, direct DI access to services/DB, no extra client build step. |
| Authentication | **None for now** | LAN/local trust model, matching the open API today. Leave a seam for later. |
| API contract | **Unchanged** | Public controllers, routes, and response shapes stay identical. |

## 4. Current architecture (relevant parts)

- `backend/Program.cs` is a minimal host using controllers:
  `AddControllers()` + `MapControllers()`, plus `AddOpenApi()`,
  `AddProblemDetails()`, global `CachingMiddleware`, CORS `AllowAll`, static files,
  and `MapControllers()`.
- Domain services registered in DI: `IAudioService`, `IArtistService`,
  `ICachingService` (singleton), and a hosted `TagCleanupService`.
- `DatabaseContext` is a single EF Core `DbContext` (PostgreSQL).
- Cache invalidation is handled globally by `CachingMiddleware` for `PUT/POST/PATCH/DELETE`
  on `api/artist`, `api/audio`, `api/tags` paths (note: `api/tag`, not `api/tags`, is the
  actual tag route — see Open Issues).

## 5. Proposed architecture

```
                            ┌─────────────────────────────────────────────┐
                            │              backend (ASP.NET Core)          │
        Next.js frontend ──►│  /api/*        REST controllers (unchanged)  │
                            │  /media/audio  static files (unchanged)      │
        admin browser    ──►│  /panel/*      Blazor Interactive Server      │
                            │                 reuses services + DbContext   │
                            └─────────────────────────────────────────────┘
```

- The panel lives under a dedicated route prefix, e.g. `/panel` (with a fallback for
  nested pages).
- Panel pages do **not** call the public API over HTTP; they resolve `IAudioService`,
  `IArtistService`, `DatabaseContext`, etc. from the same DI container.
- Any panel operation that mutates data must invalidate the corresponding Redis cache
  group(s) explicitly (see §8), because `CachingMiddleware` only observes `/api/*` paths.

## 6. Project structure additions

All new files go inside `backend/` (shown alongside existing files):

```
backend/
  AudioArchive.csproj            # add Blazor framework packages
  Program.cs                     # add RazorComponents + InteractiveServer wiring
  Components/
    _Imports.razor
    App.razor
    Routes.razor
    Layout/
      PanelLayout.razor          # shared chrome: nav + content
    Shared/                      # reusable panel components (tables, confirm dialogs, …)
  Pages/                         # one .razor page per panel feature (TBD)
    Home.razor
  Services/                      # existing services reused; add panel-specific ones here
```

Follow existing code conventions: no comments unless needed, C# primary-constructor
style for services/controllers, 2-space indentation, file-scoped usage where idiomatic.

## 7. Hosting / routing changes (`Program.cs`)

Add the Blazor Interactive Server stack while leaving the API pipeline intact:

```csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// ... existing service registrations unchanged ...

var app = builder.Build();

// ... existing middleware (CachingMiddleware, static files, CORS, HttpsRedirection) ...

app.MapControllers();

app.MapRazorComponents<AudioArchive.Components.App>()
    .AddInteractiveServerRenderMode();
```

Notes

- `MapRazorComponents<App>()` must be mapped **after** `MapControllers()` so the
  `/api/*` routes win and the Blazor router handles everything else.
- Keep `UseStaticFiles`/`UseDirectoryBrowser` for `/media/audio` untouched; the Blazor
  framework's own static assets (`/_framework/*`) are served automatically by
  `MapRazorComponents`/`AddInteractiveServerComponents`.
- `UseHttpsRedirection()` and CORS do not interfere with server-side Blazor (SignalR
  connections are same-origin; no CORS needed for the panel).

### `AudioArchive.csproj`

Blazor Server components ship in the shared framework for `net10.0`, so only the
component/endpoint packages are added (versions aligned to .NET 10):

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.AspNetCore.Components.Web" Version="10.0.0" />
  <PackageReference Include="Microsoft.AspNetCore.Components.Server" Version="10.0.0" />
  <PackageReference Include="Microsoft.AspNetCore.Components.Endpoints" Version="10.0.0" />
</ItemGroup>
```

(Confirm exact package set/versions against the .NET 10 SDK at implementation time.)

## 8. Cache invalidation responsibility

Today `CachingMiddleware` clears the `audio`/`artist`/`tag` Redis groups after API
mutations. Since the panel mutates via services directly, it must clear caches itself:

- Inject `ICachingService` into panel components/services and call
  `DeleteGroupAsync("audio")` / `DeleteGroupAsync("artist")` / `DeleteGroupAsync("tag")`
  after any write.
- Prefer centralizing writes in panel-specific service methods (e.g.
  `PanelAudioService`) so invalidation is consistent and not scattered across `.razor`
  files.

Alternative (rejected for now): have the panel call the existing REST controllers via
`HttpClient` and reuse `CachingMiddleware` invalidation. This adds latency and a base-URL
dependency without benefit; revisit if we want the panel to be a pure API consumer later.

## 9. Deployment / Docker

- `backend/Dockerfile` publishes `AudioArchive.dll` — no change required; Blazor assets
  are part of the same publish output. Interactive Server needs outbound WebSockets
  (SignalR) between the browser and the backend.
- Root `docker-compose.yaml` already maps `5000:8080`; the panel is reachable at
  `http://localhost:5000/panel` with no extra port.
- For local dev, `http://localhost:8080/panel` (per `launchSettings.json` http profile).

## 10. Configuration

No new environment variables are required for the panel shell. If later panel features
need settings (e.g. scan paths, concurrency), add them to `appsettings*.json` +
[environment-variables.md](../environment-variables.md).

## 11. Rollout plan

1. **Scaffold** — add packages, `App`/`Routes`/`PanelLayout`, `/panel` mapping, empty
   `Home.razor`; verify the API and static files still work and `/panel` renders.
2. **Navigation & layout** — panel shell with links to future feature pages.
3. **Feature pages** — add one page per operation the user specifies (TBD), reusing
   services and following the cache-invalidation rule in §8.
4. **Polish** — shared components, consistent UI, error handling via the existing
   `GlobalExceptionHandler` pattern where applicable.
5. **Docs** — update `backend.md` and `README.md` with the `/panel` entry.

## 12. Open issues / TBD

- **What the panel actually does** — feature list to be provided by the user; will drive
  §6 pages and any new services/models.
- **Route prefix** — `/panel` proposed; confirm naming (`/panel` vs `/admin`).
- **`api/tags` vs `api/tag`** — `CachingMiddleware` clears the `tag` group on
  `api/tags`, but `TagController` is routed at `api/tag`; verify invalidation actually
  fires for tag mutations (pre-existing, unrelated to this feature but worth fixing).
- **Auth seam** — even with "no auth for now", keep the panel behind its own layout and
  avoid mixing panel routes into the API; adding a simple login later should be possible
  without restructuring.
- **SignalR in production** — confirm the reverse proxy / firewall allows WebSocket
  upgrade for the panel (local app, likely fine).
