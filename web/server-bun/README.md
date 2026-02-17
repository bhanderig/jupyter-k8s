# Jupyter K8s UI Backend (Bun)

High-performance TypeScript backend server powered by Bun for the Jupyter K8s UI.

## Why Bun?

- **Fast**: 3x faster than Node.js for HTTP requests
- **Native TypeScript**: No transpilation needed
- **Better DX**: Built-in test runner, bundler, and package manager
- **Smaller**: Single binary, no node_modules bloat
- **Modern**: ESM-first, Web APIs, and modern JavaScript features

## Quick Start

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies (from web directory)
cd web
bun install

# Run the server
bun run server-bun/index.ts
```

## Development

```bash
# Run with auto-reload
bun --watch server-bun/index.ts

# Run with environment variables
PORT=3000 bun run server-bun/index.ts
```

## Environment Variables

See `../.env` for configuration:

- `PORT` - Server port (default: 8090)
- `NODE_ENV` - Environment (development/production)
- `NAMESPACE` - Kubernetes namespace (default: default)
- `STATIC_DIR` - Static files directory (default: ./dist)
- `DEV_USER` - Development user override
- `DEV_ACCESS_TOKEN` - JWT token for development

## API Endpoints

### Authentication
- `GET /api/v1/me` - Get current user info

### Workspaces
- `GET /api/v1/workspaces` - List all workspaces
- `POST /api/v1/workspaces` - Create a workspace
- `GET /api/v1/workspaces/:name` - Get workspace details
- `PUT /api/v1/workspaces/:name` - Update workspace
- `DELETE /api/v1/workspaces/:name` - Delete workspace

### Templates
- `GET /api/v1/templates` - List workspace templates

### Health
- `GET /api/v1/health` - Health check

## Production Build

```bash
# Build standalone executable
bun build server-bun/index.ts --compile --outfile server

# Run the executable
./server
```

## Docker

See `../Dockerfile.production` for containerized deployment.

## Performance

Bun is significantly faster than Node.js:
- **HTTP requests**: ~3x faster
- **JSON parsing**: ~2x faster
- **Startup time**: ~4x faster
- **Memory usage**: ~50% less

## Migration from Node

This server is a drop-in replacement for the Node.js server in `../server/`. The API is identical, but the implementation uses Bun's native APIs for better performance.
