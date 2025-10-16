# Next.js Docker Deployment Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)

## Quick Start

### 1. Environment Setup

Create `.env` file in project root:

```bash
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000/api
```

### 2. Enable Standalone Output

Add to `next.config.js`:

```javascript
module.exports = {
  output: 'standalone',
  // ... existing config
}
```

### 3. Create Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
```

### 4. Build and Run

```bash
# Build and start containers
docker-compose build --no-cache
docker-compose up -d

# Verify deployment
curl http://localhost:3000/api/health
```

## File Structure

```
project-root/
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Container orchestration
├── .dockerignore          # Exclude files from build context
├── .env                   # Environment variables
├── next.config.js         # Next.js config (add output: 'standalone')
├── app/
│   └── api/
│       └── health/
│           └── route.ts   # Health check endpoint
└── package.json
```

## Docker Commands

### Build & Deployment

```bash
# Build from scratch (recommended for first build)
docker-compose build --no-cache

# Build with cache (faster, use after first build)
docker-compose build

# Start containers in detached mode
docker-compose up -d

# Start with logs visible
docker-compose up

# Rebuild and restart
docker-compose up -d --build
```

### Monitoring

```bash
# View live logs
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Check container status
docker-compose ps

# Resource usage
docker stats nextjs-app

# Health check status
docker inspect --format='{{json .State.Health}}' nextjs-app
```

### Container Management

```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Restart container
docker-compose restart

# Execute shell inside container
docker-compose exec nextjs sh
```

### Debugging

```bash
# View environment variables
docker-compose exec nextjs env

# Check build artifacts
docker-compose exec nextjs ls -la /app/.next

# Test health endpoint from inside container
docker-compose exec nextjs wget -qO- http://localhost:3000/api/health

# View Next.js build ID
docker-compose exec nextjs cat /app/.next/BUILD_ID
```

### Cleanup

```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove unused images
docker image prune -a

# Full system cleanup (CAUTION: removes all unused Docker resources)
docker system prune -a --volumes
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API endpoint | - | Yes |
| `NODE_ENV` | Node environment | `production` | No |
| `PORT` | Application port | `3000` | No |

### Resource Limits

Default container limits (adjust in `docker-compose.yml`):

- **CPU**: 2 cores max, 0.5 reserved
- **Memory**: 2GB max, 512MB reserved

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## Troubleshooting

### Build Failures

**Problem**: `Cannot find module lightningcss.linux-x64-musl.node`

**Solution**: Ensure build dependencies are installed:
```bash
docker-compose build --no-cache
```

**Problem**: Port 3000 already in use

**Solution**: 
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Runtime Issues

**Problem**: Container exits immediately

**Solution**: Check logs
```bash
docker-compose logs nextjs
```

**Problem**: Health check failing

**Solution**: Verify health endpoint exists
```bash
curl http://localhost:3000/api/health
docker-compose exec nextjs wget -qO- http://localhost:3000/api/health
```

**Problem**: Environment variables not loaded

**Solution**: 
1. Check `.env` file exists
2. Verify variable names match docker-compose.yml
3. Rebuild: `docker-compose up -d --build`

### Performance Issues

**Problem**: High memory usage

**Solution**: Adjust memory limits or optimize build
```bash
# Check current usage
docker stats nextjs-app

# Increase memory limit in docker-compose.yml
memory: 4G
```

**Problem**: Slow build times

**Solution**: 
- Use build cache: `docker-compose build` (without --no-cache)
- Optimize .dockerignore to exclude unnecessary files
- Use multi-stage builds (already implemented)

## Production Deployment

### 1. Build Production Image

```bash
# Build with specific tag
docker build -t registry.example.com/nextjs-app:v1.0.0 .

# Push to registry
docker push registry.example.com/nextjs-app:v1.0.0
```

### 2. Deploy on Production Server

```bash
# Pull image
docker pull registry.example.com/nextjs-app:v1.0.0

# Update docker-compose.yml to use specific image
# image: registry.example.com/nextjs-app:v1.0.0

# Deploy
docker-compose up -d
```

### 3. Zero-Downtime Deployment

```bash
# Pull new image
docker pull registry.example.com/nextjs-app:v1.0.1

# Update docker-compose.yml with new version
sed -i 's/v1.0.0/v1.0.1/g' docker-compose.yml

# Recreate container with new image
docker-compose up -d --no-deps --build nextjs
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_BACKEND_API_URL=${{ secrets.API_URL }} \
            -t ${{ secrets.REGISTRY }}/nextjs-app:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ${{ secrets.REGISTRY }}/nextjs-app:${{ github.sha }}
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            docker pull ${{ secrets.REGISTRY }}/nextjs-app:${{ github.sha }}
            docker-compose up -d
```

## Monitoring & Logging

### Log Management

Logs are configured in `docker-compose.yml`:
- Max file size: 10MB
- Max files: 3 (30MB total)

```bash
# View logs location
docker inspect --format='{{.LogPath}}' nextjs-app

# Follow logs with timestamps
docker-compose logs -f --timestamps nextjs
```

### Health Monitoring

```bash
# Continuous health check monitoring
watch -n 5 'docker inspect --format="{{.State.Health.Status}}" nextjs-app'

# Check last health check result
docker inspect --format='{{json .State.Health}}' nextjs-app | jq
```

## Security Considerations

1. **Non-root user**: Container runs as `nextjs` user (UID 1001)
2. **Minimal base image**: Uses Alpine Linux for smaller attack surface
3. **No secrets in image**: Use environment variables, not build args for sensitive data
4. **Read-only filesystem**: Consider adding `read_only: true` in production
5. **Network isolation**: Uses dedicated Docker network

## Performance Optimization

### Image Size

Current multi-stage build reduces image from ~1.5GB to ~150MB:

```bash
# Check image size
docker images nextjs-app
```

### Build Cache

```bash
# Leverage BuildKit for better caching
DOCKER_BUILDKIT=1 docker-compose build
```

### CDN Integration

For static assets, configure Next.js with CDN:

```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.CDN_URL || '',
  output: 'standalone',
}
```

## Backup & Recovery

### Container State Backup

```bash
# Create backup of container
docker commit nextjs-app nextjs-backup:$(date +%Y%m%d)

# Save image to file
docker save nextjs-app:latest | gzip > nextjs-backup.tar.gz
```

### Restore from Backup

```bash
# Load image
gunzip -c nextjs-backup.tar.gz | docker load

# Start container
docker-compose up -d
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:3000/api/health`
3. Review this documentation
4. Check Docker and Next.js documentation

## Version History

- **v1.0.0**: Initial Docker setup with multi-stage builds
- Alpine Linux base image
- Health checks configured
- Production-ready configuration