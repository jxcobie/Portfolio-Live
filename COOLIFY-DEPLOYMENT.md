# Coolify Deployment Guide

Complete guide for deploying the Portfolio project to your VPS using Coolify.

## 📋 Prerequisites

- ✅ VPS with Coolify installed (v4+)
- ✅ Domain name pointing to your VPS
- ✅ GitHub repository set up
- ✅ SSH access to your VPS

## 🏗️ Architecture Overview

```
Your VPS (Coolify)
├── Portfolio-CMS (Backend)
│   ├── Docker Container
│   ├── Port: 3002
│   ├── Domain: api.yourdomain.com
│   └── SQLite Volume
│
└── Portfolio-Website (Frontend)
    ├── Docker Container
    ├── Port: 3000
    ├── Domain: yourdomain.com
    └── Environment: NEXT_PUBLIC_CMS_URL=https://api.yourdomain.com
```

---

## Part 1: Deploy Portfolio-CMS (Backend)

### Step 1: Create Dockerfile for CMS

Create `Portfolio-CMS/Dockerfile`:

```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directories
RUN mkdir -p uploads backups logs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
```

### Step 2: Create .dockerignore

Create `Portfolio-CMS/.dockerignore`:

```
node_modules/
npm-debug.log
.env
.env.local
*.db
*.db-journal
backups/
logs/
.git/
.gitignore
README.md
.DS_Store
```

### Step 3: Add Health Check Endpoint

Add to `Portfolio-CMS/server.js` (before other routes):

```javascript
// Health check endpoint for Coolify
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Step 4: Deploy CMS in Coolify

1. **Login to Coolify** → Navigate to your Projects

2. **Create New Resource** → Select "Docker Compose"

3. **Connect Repository**:
   - Repository: `git@github.com:jxcobie/Portfolio-Live.git`
   - Branch: `main`
   - Base Directory: `Portfolio-CMS`

4. **Build Configuration**:
   - Build Pack: `Dockerfile`
   - Dockerfile Location: `/Dockerfile`
   - Port: `3002`
   - Health Check Path: `/health`

5. **Environment Variables** (in Coolify UI):
   ```env
   NODE_ENV=production
   PORT=3002
   API_KEY=<generate-strong-random-key>
   DATABASE_PATH=/app/data/cms_database.db
   UPLOAD_DIR=/app/uploads
   MAX_FILE_SIZE=5242880
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

6. **Persistent Volumes** (Important!):
   - Source: `/app/data` → Destination: `/app/data` (for database)
   - Source: `/app/uploads` → Destination: `/app/uploads` (for uploads)
   - Source: `/app/backups` → Destination: `/app/backups` (for backups)

7. **Domain Configuration**:
   - Domain: `api.yourdomain.com`
   - SSL: Enable (Let's Encrypt automatic)
   - WWW Redirect: Disabled

8. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Check logs for any errors

### Step 5: Initialize Database (First Time Only)

After first deployment, connect via SSH to run database initialization:

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Find the CMS container ID
coolify ps

# Or use docker
docker ps | grep cms

# Execute database initialization
docker exec -it <container-id> npm run db:init

# Verify database was created
docker exec -it <container-id> ls -la data/
```

### Step 6: Verify CMS Deployment

Test the CMS endpoints:

```bash
# Health check
curl https://api.yourdomain.com/health

# Get portfolio data
curl https://api.yourdomain.com/api/portfolio/public

# Test authentication (use your API key)
curl -X GET https://api.yourdomain.com/api/projects/public
```

---

## Part 2: Deploy Portfolio-Website (Frontend)

### Step 1: Create Dockerfile for Website

Create `Portfolio-website/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments (will be replaced by Coolify env vars)
ARG NEXT_PUBLIC_CMS_URL
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update next.config.ts

Add `output: 'standalone'` to your Next.js config:

```typescript
const nextConfig = {
  output: 'standalone', // Required for Docker
  // ... rest of your config
};
```

### Step 3: Create .dockerignore for Website

Create `Portfolio-website/.dockerignore`:

```
node_modules/
.next/
.git/
.gitignore
.env*.local
.DS_Store
*.log
coverage/
.vscode/
.idea/
README.md
```

### Step 4: Deploy Website in Coolify

1. **Create New Resource** → Select "Docker Compose"

2. **Connect Repository**:
   - Repository: `git@github.com:jxcobie/Portfolio-Live.git`
   - Branch: `main`
   - Base Directory: `Portfolio-website`

3. **Build Configuration**:
   - Build Pack: `Dockerfile`
   - Dockerfile Location: `/Dockerfile`
   - Port: `3000`

4. **Build Arguments** (Important for Next.js):
   - `NEXT_PUBLIC_CMS_URL`: `https://api.yourdomain.com`
   - `NEXT_PUBLIC_SITE_URL`: `https://yourdomain.com`

5. **Environment Variables**:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_CMS_URL=https://api.yourdomain.com
   CMS_API_KEY=<same-key-as-cms>
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

6. **Domain Configuration**:
   - Domain: `yourdomain.com`
   - SSL: Enable (Let's Encrypt)
   - WWW Redirect: Optional (redirect www to non-www)

7. **Deploy**:
   - Click "Deploy"
   - Wait for build (may take 5-10 minutes for first build)
   - Check logs for successful startup

### Step 5: Verify Website Deployment

1. Visit `https://yourdomain.com`
2. Check that data loads from CMS
3. Test contact form
4. Check console for errors

---

## Part 3: Advanced Configuration

### Auto-Deploy on Git Push

1. In Coolify, go to your resource settings
2. Enable "Automatic Deployment"
3. Set branch to `main`
4. Save

Now every push to `main` branch will trigger automatic deployment!

### Database Backups

Create a backup script in Coolify:

1. **Go to CMS Resource** → **Scripts** tab

2. **Add Backup Script**:
   ```bash
   #!/bin/bash
   docker exec <cms-container-id> npm run db:backup
   ```

3. **Schedule**: Set to run daily at 2 AM

### Monitoring with Coolify

1. **Go to Resource** → **Metrics**
2. Enable monitoring for:
   - CPU usage
   - Memory usage
   - Network traffic
   - Container restarts

### Logs

View logs in Coolify:
```
Dashboard → Select Resource → Logs Tab
```

Or via SSH:
```bash
# CMS logs
docker logs <cms-container-id> -f

# Website logs
docker logs <website-container-id> -f
```

---

## Part 4: Environment Management

### Coolify Environment Variables Best Practices

1. **Secrets** (API keys, database passwords):
   - Store in Coolify's encrypted variables
   - Never commit to git
   - Rotate regularly

2. **Public Variables** (URLs):
   - Can be in git as `.env.example`
   - Override in Coolify for production

3. **Build-time vs Runtime**:
   - `NEXT_PUBLIC_*` variables: Build-time (must be in Build Args)
   - Other variables: Runtime (can be in Environment Variables)

### Generate Secure API Key

```bash
# Generate a strong API key
openssl rand -base64 32
```

Use this for both CMS and Website `CMS_API_KEY`.

---

## Part 5: SSL & Domain Configuration

### DNS Setup

Point your domains to your VPS:

```
A Record:
  yourdomain.com → your-vps-ip

CNAME Record:
  api.yourdomain.com → yourdomain.com

Optional (if you want www):
  www.yourdomain.com → yourdomain.com
```

### SSL Certificates

Coolify handles SSL automatically with Let's Encrypt:

1. Add domain in Coolify
2. Enable SSL
3. Wait 2-5 minutes for certificate generation
4. Done! 🎉

### Force HTTPS

In Coolify domain settings:
- Enable "Force HTTPS"
- All HTTP requests will redirect to HTTPS

---

## Part 6: Scaling & Performance

### Enable Caching

Add to `next.config.ts`:

```typescript
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};
```

### Database Optimization

For SQLite in production:

```javascript
// In server.js, add connection options
const db = new sqlite3.Database(DATABASE_PATH, {
  mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
});

// Enable WAL mode for better concurrency
db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA synchronous = NORMAL;');
```

### CDN for Static Assets

Use Cloudflare in front of Coolify:

1. Point domain to Cloudflare
2. Set DNS to proxy (orange cloud)
3. Enable caching rules
4. Use Page Rules for static assets

---

## Part 7: Troubleshooting

### CMS Container Won't Start

**Check logs:**
```bash
docker logs <cms-container-id>
```

**Common issues:**
- Missing environment variables
- Port already in use
- Database file permissions

**Solution:**
```bash
# Fix permissions
docker exec -it <cms-container-id> chown -R node:node /app/data
```

### Website Can't Connect to CMS

**Check:**
1. ✅ CMS is running: `curl https://api.yourdomain.com/health`
2. ✅ CORS origins include website domain
3. ✅ API key matches in both services
4. ✅ Firewall allows port 3002

**Fix CORS:**
```env
# In CMS environment variables
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Build Fails

**Check:**
1. Node version matches (20.18.0)
2. Dependencies install correctly
3. Environment variables set properly
4. Dockerfile syntax is correct

**View build logs in Coolify:**
Dashboard → Resource → Builds → View Logs

### Database Lost After Redeploy

**Cause:** Persistent volumes not configured

**Fix:**
1. Stop container
2. Add persistent volumes in Coolify
3. Re-deploy
4. Restore from backup if needed

---

## Part 8: Maintenance

### Update Dependencies

```bash
# Locally
cd Portfolio-CMS
npm update
npm audit fix

cd ../Portfolio-website
npm update
npm audit fix

# Commit and push
git add .
git commit -m "chore: update dependencies"
git push

# Coolify will auto-deploy if enabled
```

### Database Backup & Restore

**Backup:**
```bash
# Via Coolify script (automated)
# Or manually:
docker exec <cms-container-id> npm run db:backup

# Download backup to local
docker cp <cms-container-id>:/app/backups/cms_database_*.db ./local-backup.db
```

**Restore:**
```bash
# Upload backup to server
docker cp ./local-backup.db <cms-container-id>:/app/data/cms_database.db

# Restart container
docker restart <cms-container-id>
```

### Monitor Resource Usage

In Coolify Dashboard:
- CPU should be < 50% average
- Memory should be < 80%
- Disk usage < 70%

**If too high:**
- Optimize database queries
- Add indexes to database
- Enable caching
- Consider upgrading VPS

---

## Part 9: Security Checklist

- ✅ Strong API keys (32+ characters)
- ✅ HTTPS enabled on all domains
- ✅ CORS properly configured
- ✅ Rate limiting enabled in middleware
- ✅ File upload restrictions in place
- ✅ Database not publicly accessible
- ✅ `.env` files not committed
- ✅ Regular backups scheduled
- ✅ Firewall configured (only 80, 443, 22 open)
- ✅ SSH key authentication (disable password)

---

## Part 10: Useful Commands

### Coolify CLI

```bash
# List all resources
coolify ls

# View logs
coolify logs <resource-name>

# Restart resource
coolify restart <resource-name>

# Deploy resource
coolify deploy <resource-name>
```

### Docker Commands

```bash
# List containers
docker ps

# View logs
docker logs <container-id> -f --tail 100

# Execute command in container
docker exec -it <container-id> sh

# Restart container
docker restart <container-id>

# View container stats
docker stats <container-id>
```

### Database Commands

```bash
# Access SQLite database
docker exec -it <cms-container-id> sqlite3 data/cms_database.db

# Common SQL queries
SELECT * FROM projects;
SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 10;
.tables
.schema projects
.exit
```

---

## 🎉 Deployment Complete!

Your portfolio is now live on:
- **Frontend**: https://yourdomain.com
- **CMS API**: https://api.yourdomain.com

### Next Steps

1. ✅ Test all functionality
2. ✅ Set up automated backups
3. ✅ Configure monitoring alerts
4. ✅ Add your domain to Google Search Console
5. ✅ Set up analytics
6. ✅ Create content via CMS

---

## 📚 Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [SQLite Performance Tips](https://www.sqlite.org/performance.html)

## 🆘 Support

Need help?
- Coolify Discord: https://coolify.io/discord
- Email: hello@jxcobcreations.com

---

**Happy Deploying!** 🚀
