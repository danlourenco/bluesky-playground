# Deployment Guide

This guide covers deploying the Bluesky Playground application from development to production, including environment configuration, security considerations, and troubleshooting.

## Environment Configuration

### Development Environment

```bash
# .env.local (automatically used in development)
NODE_ENV=development
PUBLIC_URL=http://127.0.0.1:5174
# OAuth client_id uses localhost exception - no configuration needed
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
CLIENT_ID=https://your-domain.com/client-metadata.json
REDIRECT_URI=https://your-domain.com/auth/callback

# Optional: External services
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/db
```

## OAuth Client Registration

### Development (Localhost Exception)

No registration required! The app uses AT Protocol's localhost exception:

```typescript
const CLIENT_ID = `http://localhost?redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
```

### Production Registration

1. **Host client metadata endpoint:**

```json
// https://your-domain.com/client-metadata.json
{
  "client_id": "https://your-domain.com/client-metadata.json",
  "client_name": "Your App Name",
  "client_uri": "https://your-domain.com",
  "redirect_uris": ["https://your-domain.com/auth/callback"],
  "scope": "atproto transition:generic",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "private_key_jwt",
  "dpop_bound_access_tokens": true,
  "jwks_uri": "https://your-domain.com/jwks.json"
}
```

2. **Generate JWT keys for authentication:**

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem

# Convert to JWK format for jwks.json endpoint
```

3. **Update OAuth service configuration:**

```typescript
// For production with JWT authentication
const clientMetadata = {
  client_id: process.env.CLIENT_ID,
  token_endpoint_auth_method: 'private_key_jwt',
  // ... other metadata
};
```

## Deployment Options

### Option 1: Node.js Server

```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production node build/index.js
```

**Systemd service example:**
```ini
[Unit]
Description=Bluesky Playground
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/bluesky-playground
ExecStart=/usr/bin/node build/index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build/index.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PUBLIC_URL=https://your-domain.com
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Option 3: Platform Deployment

#### Vercel

```json
// vercel.json
{
  "functions": {
    "build/index.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "PUBLIC_URL": "https://your-app.vercel.app"
  }
}
```

#### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "20"
```

#### Railway/Render

```yaml
# render.yaml
services:
  - type: web
    name: bluesky-playground
    env: node
    buildCommand: npm run build
    startCommand: node build/index.js
    envVars:
      - key: NODE_ENV
        value: production
```

## Production Session Storage

### Redis Implementation

```typescript
// src/lib/server/bluesky/session-store.ts
import Redis from 'ioredis';

export class RedisSessionStore implements SessionStore {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async set(key: string, session: Session): Promise<void> {
    await this.redis.setex(
      `session:${key}`,
      86400, // 24 hours
      JSON.stringify(session)
    );
  }
  
  async get(key: string): Promise<Session | undefined> {
    const data = await this.redis.get(`session:${key}`);
    return data ? JSON.parse(data) : undefined;
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(`session:${key}`);
  }
}
```

### Database Implementation

```typescript
// Using Prisma as example
import { PrismaClient } from '@prisma/client';

export class DatabaseSessionStore implements SessionStore {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async set(key: string, session: Session): Promise<void> {
    await this.prisma.session.upsert({
      where: { id: key },
      update: { 
        data: JSON.stringify(session),
        expiresAt: new Date(Date.now() + 86400000)
      },
      create: { 
        id: key,
        data: JSON.stringify(session),
        expiresAt: new Date(Date.now() + 86400000)
      }
    });
  }
}
```

## Reverse Proxy Configuration

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # OAuth endpoints
    location ~ ^/(client-metadata|jwks)\.json$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### Caddy

```
your-domain.com {
    reverse_proxy localhost:3000
    
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    @oauth_metadata {
        path /client-metadata.json /jwks.json
    }
    
    handle @oauth_metadata {
        header Cache-Control "public, max-age=3600"
    }
}
```

## Security Hardening

### Environment Variables

```typescript
// src/lib/server/config.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PUBLIC_URL: z.string().url(),
  CLIENT_ID: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(32)
});

export const config = envSchema.parse(process.env);
```

### Security Headers

```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  if (import.meta.env.PROD) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
  
  return response;
};
```

### Rate Limiting

```typescript
// src/lib/server/rate-limiter.ts
import { RateLimiter } from 'limiter';

const limiters = new Map<string, RateLimiter>();

export function getRateLimiter(ip: string): RateLimiter {
  if (!limiters.has(ip)) {
    limiters.set(ip, new RateLimiter({
      tokensPerInterval: 100,
      interval: 'minute'
    }));
  }
  return limiters.get(ip)!;
}

// Usage in routes
export const GET: RequestHandler = async ({ getClientAddress }) => {
  const limiter = getRateLimiter(getClientAddress());
  
  if (!await limiter.tryRemoveTokens(1)) {
    throw error(429, 'Too many requests');
  }
  
  // Continue with request...
};
```

## Monitoring & Logging

### Application Monitoring

```typescript
// src/lib/server/monitoring.ts
import * as Sentry from '@sentry/node';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1
  });
}

export function logError(error: Error, context?: any) {
  console.error('Application error:', error, context);
  
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { extra: context });
  }
}
```

### Health Checks

```typescript
// src/routes/health/+server.ts
export const GET: RequestHandler = async () => {
  const checks = {
    app: 'ok',
    redis: 'ok',
    oauth: 'ok'
  };
  
  try {
    // Check Redis connection
    await redis.ping();
  } catch {
    checks.redis = 'error';
  }
  
  try {
    // Check OAuth service
    const bluesky = getBlueskyService();
    await bluesky.healthCheck();
  } catch {
    checks.oauth = 'error';
  }
  
  const healthy = Object.values(checks).every(v => v === 'ok');
  
  return json(checks, { status: healthy ? 200 : 503 });
};
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Development
lsof -i :5174
kill -9 [PID]

# Production
sudo netstat -tlnp | grep :3000
sudo kill -9 [PID]
```

#### OAuth Redirect Mismatch

**Problem:** "redirect_uri_mismatch" error

**Solution:** Ensure redirect URI matches exactly:
- Check trailing slashes
- Verify protocol (http vs https)
- Confirm port number
- Match URL encoding

#### Session Not Persisting

**Check:**
1. Cookie settings match domain
2. SameSite attribute is appropriate
3. Secure flag matches HTTPS usage
4. Session store is working

```typescript
// Debug cookies
console.log('Setting cookie for domain:', request.headers.get('host'));
console.log('Cookie options:', {
  httpOnly: true,
  secure: request.url.startsWith('https'),
  sameSite: 'lax',
  path: '/'
});
```

#### Token Refresh Failing

**Debug steps:**
```typescript
// Add logging to OAuth service
async getAuthenticatedAgent(userDid: DID) {
  console.log('Getting agent for:', userDid);
  const session = await this.sessionStore.get(userDid);
  console.log('Session exists:', !!session);
  console.log('Token expiry:', session?.expiresAt);
  // ...
}
```

### Performance Issues

#### Slow API Responses

1. **Enable caching:**
```typescript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCached(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

2. **Implement connection pooling:**
```typescript
// For database connections
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Memory Leaks

Monitor memory usage:
```typescript
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
  });
}, 60000);
```

## Backup & Recovery

### Session Backup

```bash
# Redis backup
redis-cli BGSAVE

# PostgreSQL backup
pg_dump -U user -d database > backup.sql

# Restore
psql -U user -d database < backup.sql
```

### Disaster Recovery Plan

1. **Regular backups:** Schedule automated backups
2. **Test restores:** Verify backup integrity
3. **Document procedures:** Keep runbooks updated
4. **Monitor health:** Set up alerts for failures
5. **Plan failover:** Have redundancy strategy

## Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  app:
    image: bluesky-playground:latest
    deploy:
      replicas: 3
    environment:
      - REDIS_URL=redis://redis:6379
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### Vertical Scaling

Optimize Node.js performance:
```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" node build/index.js

# Use cluster mode
PM2_INSTANCES=4 pm2 start build/index.js
```