# API Integration with Dev Containers

This guide explains how to configure the SOGo UI dev container to connect to your API running in a separate dev container. **The application automatically falls back to mock data if the API is unreachable (development mode only).**

## Quick Start

### 1. Configure Your API URL

Create `.env.development` in the project root:

```bash
REACT_APP_API_BASE_URL=http://host.docker.internal:8000
NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost
```

### 2. Rebuild and Start

```bash
# In VS Code: Cmd/Ctrl + Shift + P → "Dev Containers: Rebuild and Reopen in Container"
# Then run:
npm run dev
```

### 3. Check API Status

Open browser console (F12) to see:

- ✅ `API at http://host.docker.internal:8000 is reachable. Using real API.`
- Or ❌ `API at ... is not reachable.` → `➡️ Switching to /fakeApi (mock data)`

## How It Works (Development Mode Only)

1. **Host networking** (`--network=host`) - Container can access services on your host
2. **host.docker.internal** - DNS name that resolves to your host machine
3. **Environment variables** loaded from `.env.development` with defaults
4. **Automatic health check** (3-second timeout):
   - ✅ API responds → Uses real API
   - ❌ API unreachable → Falls back to `/fakeApi` mock
5. **Console feedback** - Status logged in browser console (F12)

## Configuration Examples

### Default: API in Separate Container

```bash
# Start your API
docker run -p 8000:8000 --name my-api my-api-image

# Configure UI (.env.development)
REACT_APP_API_BASE_URL=http://host.docker.internal:8000
```

Auto-fallback to mock if API is unreachable.

### Mock Data Only

```bash
REACT_APP_API_BASE_URL=/fakeApi
```

No health check performed.

### Different Port

```bash
REACT_APP_API_BASE_URL=http://host.docker.internal:5000
```

### Custom Docker Network

```bash
# Create network and start API
docker network create sogo-network
docker run --network=sogo-network --name sogo-api -p 8000:8000 my-api-image

# Update devcontainer.json runArgs
"runArgs": ["--network=sogo-network", "--add-host=host.docker.internal:host-gateway"]

# Configure UI
REACT_APP_API_BASE_URL=http://sogo-api:8000
```

## Automatic API Fallback (Development Only)

**Benefits:**

- Work seamlessly whether API is up or down
- Continue coding during API restarts
- Never crashes due to API unavailability
- Automatic recovery - just refresh after API is back

**Console Messages:**

API available:

```
🔍 Checking API connectivity: http://host.docker.internal:8000
✅ API at http://host.docker.internal:8000 is reachable. Using real API.
```

API unavailable:

```
🔍 Checking API connectivity: http://host.docker.internal:8000
❌ API at http://host.docker.internal:8000 is not reachable.
➡️  Switching to /fakeApi (mock data)
```

## Troubleshooting

### Using Mock Instead of Real API?

Check browser console (F12) for status messages, then:

```bash
# Verify API is running
docker ps | grep api

# Test connectivity (from host)
curl -fsS http://localhost:8000/api/user/v1/system || echo "API unreachable"

# From dev container
curl -fsS http://host.docker.internal:8000/api/user/v1/system || echo "API unreachable"

# Refresh page after fixing
```

### Environment Variables Not Loading?

```bash
# Check file exists
ls -la .env.development

# Create from example if needed
cp .env.example .env.development

# Verify in container
echo $REACT_APP_API_BASE_URL

# Check Next.js sees them
curl http://localhost:3000/env

# Rebuild container if needed
# Cmd/Ctrl + Shift + P → "Dev Containers: Rebuild Container"
```

### Common Issues

**❌ Using `localhost:8000`** → ✅ Use `host.docker.internal:8000` (inside container, localhost = container itself)

**Environment not updating** → Rebuild container and restart dev server

**CORS errors** → Check browser DevTools (F12) Console/Network tabs

## Advanced Configuration

### Environment Variable Priority

1. `.env.development` / `.env.local`
2. Default values in `devcontainer.json`
3. Hardcoded defaults in `src/app/env/route.ts`

### Dev Container Settings

Key configuration in `.devcontainer/devcontainer.json`:

- `--network=host` - Access host services
- `--add-host=host.docker.internal:host-gateway` - DNS to host
- `remoteEnv` - Loads vars with syntax: `${localEnv:VAR_NAME:default}`

## Quick Commands

```bash
# Setup
cp .env.example .env.development        # Create config
nano .env.development                   # Edit API URL

# Development
npm run dev                             # Start dev server

# Validate API connection
curl -fsS http://localhost:3000/env
curl -fsS http://127.0.0.1:5000/api/user/v1/system

# Debug
docker ps                               # Check containers
docker logs <api-container-name>        # Check API logs
curl http://localhost:3000/env          # Check env vars
curl http://host.docker.internal:8000   # Test API from container
```
