# Audio Web Playlist

A lightweight web interface for [audio-archive](https://github.com/R-uan/audio-archive) — browse and filter your audio library, build playlists, and queue tracks for playback.

## Overview

This project pairs with the `audio-archive` backend to give a proper listening experience for personal, isolated audio sources. It supports filtering audio lists, organizing content into playlists, and managing a playback queue.

> Primarily tested with remote audio source URLs. Local file support is not yet fully validated.

## Requirements

- [Bun](https://bun.sh)
- TypeScript

> A Nix flake is available for reproducible dev environments.

## Development

```bash
bun run dev
```

## Deployment

### Docker

```bash
docker compose up --build
```

### Bun Build

```bash
bun run build
bun run start
```
