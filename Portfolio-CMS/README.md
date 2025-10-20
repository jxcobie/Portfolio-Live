# Portfolio CMS (Content Management System)

A lightweight, custom-built CMS for managing portfolio content with SQLite database.

## Features

- 📝 **Portfolio Management**: Manage personal info, skills, projects, and testimonials
- 🖼️ **File Upload**: Image upload with validation and storage
- 🔒 **Authentication**: Basic API key authentication
- 📊 **Analytics**: Track page views and user interactions
- 💾 **SQLite Database**: Lightweight, file-based database
- 🚀 **RESTful API**: Clean API endpoints for all operations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **File Upload**: Multer
- **CORS**: Enabled for frontend integration

## Directory Structure

```
Portfolio-CMS/
├── server.js           # Main Express server
├── cms_database.db     # SQLite database file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── scripts/            # Utility scripts
│   ├── init-db.js      # Initialize database schema
│   ├── backup-db.js    # Database backup utility
│   └── test-endpoints.js # API endpoint tests
├── uploads/            # Uploaded files storage
└── admin/              # Admin panel (if any)
```

## Installation

### 1. Install Dependencies

```bash
cd Portfolio-CMS
npm install
```

### 2. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
CMS_PORT=1337
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key
CMS_API_KEY=generated-service-token
DATABASE_PATH=./cms_database.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Bootstrap admin (set a strong password or leave blank to auto-generate on init)
CMS_BOOTSTRAP_ADMIN_USER=admin
CMS_BOOTSTRAP_ADMIN_PASSWORD=

# Optional overrides for scripts/tests
CMS_BASE_URL=http://localhost:1337
CMS_ADMIN_USER=
CMS_ADMIN_PASSWORD=

# Rate limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_AUTH_WINDOW_MINUTES=15
RATE_LIMIT_AUTH_REQUESTS=10

```

> 🔐 **Important:** Set `CMS_API_KEY` to a long random string and share it only with trusted services (e.g., the Next.js frontend). Every POST/PUT/DELETE request must include an `x-cms-api-key` header with this value or the CMS will return `401 Unauthorized`.

### 3. Initialize Database

```bash
npm run db:init
```

> ℹ️ If `CMS_BOOTSTRAP_ADMIN_PASSWORD` is empty, the init script will generate a temporary password and print it to the console. Store it securely and update your `.env` (or secrets manager) before deploying.

This creates the SQLite database with all required tables:

- `personal_info`
- `skills`
- `projects`
- `testimonials`
- `analytics`
- `messages`
- `bookings`

### 4. Start the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The CMS will be available at `http://localhost:3002`

## API Endpoints

### Portfolio Management

#### Get All Portfolio Data

```http
GET /api/portfolio/public
```

#### Update Portfolio Section

```http
PUT /api/portfolio
Headers: x-api-key: your-api-key
Body: {
  "section": "personal|skills|projects|testimonials",
  "data": {...}
}
```

#### Delete Portfolio Item

```http
DELETE /api/portfolio
Headers: x-api-key: your-api-key
Body: {
  "section": "projects|testimonials|skills",
  "id": number
}
```

### Projects

#### Get All Projects

```http
GET /api/projects/public?page=1&limit=12
```

#### Get Featured Projects

```http
GET /api/projects/featured
```

#### Get Project by ID

```http
GET /api/projects/public/:id
```

### Analytics

#### Track Event

```http
POST /api/analytics/track
Body: {
  "event_type": "page_view|button_click|...",
  "page_url": "/",
  "user_agent": "...",
  ...
}
```

### File Upload

#### Upload Image

```http
POST /api/upload
Headers: x-api-key: your-api-key
Body: multipart/form-data with "image" field
```

### Contact Messages

#### Submit Contact Form

```http
POST /api/contact
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello!"
}
```

## Scripts

| Script                   | Description                           |
| ------------------------ | ------------------------------------- |
| `npm start`              | Start production server               |
| `npm run dev`            | Start development server with nodemon |
| `npm run db:init`        | Initialize database                   |
| `npm run db:backup`      | Backup database                       |
| `npm run test:endpoints` | Test all API endpoints                |

## Database Schema

### personal_info

- `id` (INTEGER, PRIMARY KEY)
- `name`, `title`, `tagline`, `about`
- `email`, `linkedin`, `github`, `location`
- `experience`, `avatar`, `resume`

### skills

- `id` (INTEGER, PRIMARY KEY)
- `category` (TEXT)
- `skills` (JSON array)
- `icon`, `level`, `order`

### projects

- `id` (INTEGER, PRIMARY KEY)
- `title`, `slug`, `description`
- `status`, `technologies` (JSON)
- `liveUrl`, `repoUrl`, `coverImage`
- `featured` (BOOLEAN)
- `createdAt`, `updatedAt`

### testimonials

- `id` (INTEGER, PRIMARY KEY)
- `name`, `company`, `position`
- `text`, `rating` (1-5)
- `date`, `avatar`, `verified`

### analytics

- `id` (INTEGER, PRIMARY KEY)
- `event_type`, `event_data` (JSON)
- `page_url`, `user_agent`
- `ip_address`, `timestamp`

### messages

- `id` (INTEGER, PRIMARY KEY)
- `name`, `email`, `subject`, `message`
- `status` (new|read|replied|archived)
- `createdAt`, `readAt`, `repliedAt`

## Security

### Authentication

- **API Key**: All write operations require `x-api-key` header
- Store API key securely in `.env` file
- Never commit `.env` to version control

### CORS

- Configured allowed origins in `.env`
- Default: `http://localhost:3000`
- Update for production domains

### File Upload

- Max file size: 5MB (configurable)
- Allowed formats: jpg, jpeg, png, gif, webp
- Files stored in `./uploads/` directory

### Rate Limiting

- Implement rate limiting in production
- Use Redis or memory store
- Recommended: 100 requests per 15 minutes

## Deployment

### Production Checklist

1. **Environment Variables**

   ```env
   NODE_ENV=production
   PORT=3002
   API_KEY=<strong-random-key>
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Database Backup**

   ```bash
   npm run db:backup
   ```

3. **Process Manager**

   ```bash
   # Using PM2
   pm2 start server.js --name portfolio-cms
   pm2 save
   pm2 startup
   ```

4. **Reverse Proxy (Nginx)**

   ```nginx
   location /api/ {
       proxy_pass http://localhost:3002;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

5. **SSL Certificate**
   - Use Let's Encrypt with Certbot
   - Or use Cloudflare for SSL termination

### Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t portfolio-cms .
docker run -p 3002:3002 --env-file .env portfolio-cms
```

## Database Maintenance

### Backup

```bash
npm run db:backup
# Creates: backups/cms_database_YYYY-MM-DD_HH-MM-SS.db
```

### Restore

```bash
cp backups/cms_database_YYYY-MM-DD_HH-MM-SS.db cms_database.db
```

### Reset Database

```bash
rm cms_database.db
npm run db:init
```

## Integration with Portfolio Website

### Environment Setup (Portfolio-website)

Add to `.env.local`:

```env
CMS_INTERNAL_URL=http://localhost:1337
NEXT_PUBLIC_CMS_URL=http://localhost:1337
CMS_API_KEY=your-api-key-here
```

### Fetching Data

```typescript
// In your Next.js app
const cmsBaseUrl =
  process.env.CMS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  "http://localhost:1337";

const response = await fetch(`${cmsBaseUrl}/api/portfolio/public`);
const data = await response.json();
```

### Updating Data (Admin Only)

```typescript
const cmsBaseUrl =
  process.env.CMS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  "http://localhost:1337";

const response = await fetch(`${cmsBaseUrl}/api/portfolio`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.CMS_API_KEY,
  },
  body: JSON.stringify({
    section: "projects",
    data: {
      /* ... */
    },
  }),
});
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3002
netstat -ano | findstr :3002  # Windows
lsof -i :3002                 # Mac/Linux

# Kill process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

### Database Locked

```bash
# Close all connections to database
rm cms_database.db-journal

# If persists, restart server
```

### CORS Errors

1. Check `ALLOWED_ORIGINS` in `.env`
2. Ensure origins include protocol: `https://domain.com`
3. Restart server after changing `.env`

## Development

### Adding New Endpoints

1. Add route in `server.js`
2. Implement handler function
3. Add to `scripts/test-endpoints.js`
4. Test with `npm run test:endpoints`
5. Update this README

### Database Migrations

1. Backup current database
2. Modify schema in `scripts/init-db.js`
3. Create migration script
4. Test on development database first

## License

MIT

## Support

For issues and questions:

- Create an issue in the repository
- Email: hello@jxcobcreations.com

---

**Made with ❤️ by Jacob Jaballah**
