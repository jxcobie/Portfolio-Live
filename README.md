# JxcobCreations Portfolio - Monorepo

Full-stack portfolio application with Next.js frontend and Express.js CMS backend.

## 🚀 Project Structure

```
JxcobCreations/
├── Portfolio-website/      # Next.js 15 Frontend
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities, types, validations
│   ├── middleware.ts     # Next.js middleware
│   └── package.json
│
├── Portfolio-CMS/         # Express.js Backend API
│   ├── server.js         # Express server
│   ├── scripts/          # Database utilities
│   ├── uploads/          # File uploads
│   └── package.json
│
└── CMS-MIGRATION-GUIDE.md # Separation documentation
```

## 📋 Prerequisites

- **Node.js**: 20.18.0+ (uses Volta for version management)
- **npm**: 10.8.2+
- **Git**: Latest version

## 🛠️ Quick Start

### 1. Clone Repository

```bash
git clone git@github.com:jxcobie/Portfolio-Live.git
cd Portfolio-Live
```

### 2. Setup Portfolio-CMS (Backend)

```bash
cd Portfolio-CMS

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API key and configuration

# Initialize database
npm run db:init

# Start CMS server
npm run dev
```

CMS will be available at: `http://localhost:3002`

### 3. Setup Portfolio-website (Frontend)

```bash
cd ../Portfolio-website

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add CMS-related variables

# Start development server
npm run dev
```

Website will be available at: `http://localhost:3000`

## 🔧 Environment Variables

> 🔒 Never commit `.env`, `.env.local`, or database files to version control. Use the provided `.env.example` templates and keep secrets in your deployment platform or a local `.env` ignored by Git.

### Portfolio-CMS (.env)

```env
CMS_PORT=1337
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key
DATABASE_PATH=./cms_database.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
CMS_BOOTSTRAP_ADMIN_USER=admin
CMS_BOOTSTRAP_ADMIN_PASSWORD=
CMS_BASE_URL=http://localhost:1337
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_AUTH_WINDOW_MINUTES=15
RATE_LIMIT_AUTH_REQUESTS=10
```

### Portfolio-website (.env.local)

```env
CMS_INTERNAL_URL=http://localhost:1337
NEXT_PUBLIC_CMS_URL=http://localhost:1337
CMS_API_KEY=your-api-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📦 Scripts

### Portfolio-CMS

```bash
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm run db:init      # Initialize database
npm run db:backup    # Backup database
npm run test:endpoints # Test API endpoints
```

### Portfolio-website

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run validate     # Run all checks (lint + type-check + format)
npm run test:ui      # Playwright visual regression tests
npm run test:ui:update # Refresh Playwright snapshots
npm run deploy       # Validate and build
```

## 🏗️ Tech Stack

### Frontend (Portfolio-website)

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript 5.7.3
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.1.13
- **Animations**: Framer Motion 12.23.12
- **Form Validation**: Zod + React Hook Form
- **Code Quality**: ESLint, Prettier, Husky

### Backend (Portfolio-CMS)

- **Runtime**: Node.js 20.18.0
- **Framework**: Express.js 4.21.2
- **Database**: SQLite3 5.1.7
- **File Upload**: Multer 1.4.5-lts.1
- **Security**: CORS, Rate Limiting

## 📚 Documentation

- **Frontend**: [Portfolio-website/README.md](Portfolio-website/README.md)
- **Backend**: [Portfolio-CMS/README.md](Portfolio-CMS/README.md)
- **Migration Guide**: [CMS-MIGRATION-GUIDE.md](CMS-MIGRATION-GUIDE.md)

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd Portfolio-website
npm run build
# Deploy to Vercel
vercel --prod
```

### Backend (VPS/Cloud)

```bash
cd Portfolio-CMS

# Using PM2
pm2 start server.js --name portfolio-cms
pm2 save
pm2 startup
```

## 🔒 Security

- API key authentication for write operations
- CORS protection
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- File upload restrictions (size, type)

## 🧪 Testing

### API Endpoints

```bash
cd Portfolio-CMS
npm run test:endpoints
```

### Frontend

```bash
cd Portfolio-website
npm run validate  # Runs lint + type-check + format check
```

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Jacob Jaballah**

- Email: hello@jxcobcreations.com
- GitHub: [@jxcobie](https://github.com/jxcobie)
- LinkedIn: [Jacob Jaballah](https://linkedin.com/in/jacob-jaballah)

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug? Please open an issue on GitHub with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Next.js 15 with App Router
- ✅ TypeScript throughout
- ✅ Custom CMS with SQLite
- ✅ Comprehensive validation with Zod
- ✅ Rate limiting and security middleware
- ✅ Responsive cyberpunk design
- ✅ Production-ready configurations

---

**Made with ❤️ by Jacob Jaballah**
