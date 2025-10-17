# GitHub Commit Guide

Step-by-step guide to commit your portfolio project to GitHub.

## Current Status

✅ Git repository initialized
✅ Files ready to commit
✅ .gitignore configured
✅ README created

## Files to be Committed

```
JxcobCreations/
├── .gitignore                    # Git ignore rules
├── .prettierignore               # Prettier ignore rules
├── README.md                     # Main documentation
├── CMS-MIGRATION-GUIDE.md        # CMS separation guide
├── Portfolio-website/            # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── middleware.ts
│   └── ... (all source files)
└── Portfolio-CMS/                # Backend (Express)
    ├── server.js
    ├── scripts/
    ├── .env.example
    └── ... (all source files)
```

## What's Excluded (via .gitignore)

- ❌ `.claude/` - IDE settings
- ❌ `husky-backup/` - Backup folder
- ❌ `node_modules/` - Dependencies
- ❌ `.env` files - Secrets
- ❌ `*.db` files - Databases
- ❌ Build artifacts (`.next/`, `dist/`, etc.)

## Step-by-Step Commit Process

### Step 1: Verify Repository Status

```bash
cd C:\WORK\WEBSITE\JxcobCreations
git status
```

**Expected output:**
```
On branch master
Untracked files:
  .gitignore
  .prettierignore
  CMS-MIGRATION-GUIDE.md
  Portfolio-CMS/
  Portfolio-website/
  README.md
```

### Step 2: Add All Files

```bash
git add .
```

This stages all untracked files (except those in `.gitignore`).

### Step 3: Verify What's Staged

```bash
git status
```

**Expected output:**
```
On branch master
Changes to be committed:
  new file:   .gitignore
  new file:   .prettierignore
  new file:   CMS-MIGRATION-GUIDE.md
  new file:   Portfolio-CMS/...
  new file:   Portfolio-website/...
  new file:   README.md
```

### Step 4: Create Initial Commit

```bash
git commit -m "feat: initial commit - full-stack portfolio with Next.js and CMS

- Frontend: Next.js 15 with TypeScript, Tailwind CSS, Framer Motion
- Backend: Express.js CMS with SQLite database
- Features: Rate limiting, validation, security middleware, responsive design
- Documentation: Comprehensive README and migration guide
- Code quality: ESLint, Prettier, Husky pre-commit hooks"
```

### Step 5: Rename Branch to Main

```bash
git branch -M main
```

This renames the default `master` branch to `main`.

### Step 6: Add GitHub Remote

```bash
git remote add origin git@github.com:jxcobie/Portfolio-Live.git
```

### Step 7: Verify Remote

```bash
git remote -v
```

**Expected output:**
```
origin  git@github.com:jxcobie/Portfolio-Live.git (fetch)
origin  git@github.com:jxcobie/Portfolio-Live.git (push)
```

### Step 8: Push to GitHub

```bash
git push -u origin main
```

The `-u` flag sets up tracking, so future pushes can just use `git push`.

## Complete Command Sequence

Here's the complete sequence to copy-paste:

```bash
# Navigate to project root
cd C:\WORK\WEBSITE\JxcobCreations

# Check status
git status

# Stage all files
git add .

# Verify staged files
git status

# Commit with message
git commit -m "feat: initial commit - full-stack portfolio with Next.js and CMS

- Frontend: Next.js 15 with TypeScript, Tailwind CSS, Framer Motion
- Backend: Express.js CMS with SQLite database
- Features: Rate limiting, validation, security middleware, responsive design
- Documentation: Comprehensive README and migration guide
- Code quality: ESLint, Prettier, Husky pre-commit hooks"

# Rename branch to main
git branch -M main

# Add remote repository
git remote add origin git@github.com:jxcobie/Portfolio-Live.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

## Troubleshooting

### Issue: Pre-commit Hook Fails

**Problem**: Husky pre-commit hook runs and fails due to ESLint warnings.

**Solution**: The ESLint config is already set to allow warnings. If it still fails:

```bash
# Skip hooks for initial commit
git commit --no-verify -m "your message"
```

### Issue: Remote Already Exists

**Problem**: `fatal: remote origin already exists`

**Solution**:
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin git@github.com:jxcobie/Portfolio-Live.git
```

### Issue: SSH Key Not Set Up

**Problem**: `Permission denied (publickey)`

**Solution**:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "hello@jxcobcreations.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH Keys → New SSH Key
```

**OR** use HTTPS instead:
```bash
git remote set-url origin https://github.com/jxcobie/Portfolio-Live.git
```

### Issue: Large Files

**Problem**: `error: file too large`

**Solution**: Files larger than 100MB need Git LFS. Check `.gitignore` to ensure large files are excluded.

```bash
# Check file sizes
find . -type f -size +50M

# If found, add to .gitignore
```

## Post-Commit Checklist

After successful push:

1. ✅ Visit GitHub repository: https://github.com/jxcobie/Portfolio-Live
2. ✅ Verify all files are present
3. ✅ Check README renders correctly
4. ✅ Add repository description and topics
5. ✅ Configure repository settings (if needed)
6. ✅ Add collaborators (if any)

## GitHub Repository Settings

### Recommended Settings

1. **About Section**:
   - Description: "Full-stack portfolio with Next.js 15 and custom CMS"
   - Website: Your deployed URL
   - Topics: `nextjs`, `typescript`, `portfolio`, `cms`, `react`, `tailwindcss`

2. **Branch Protection** (for `main`):
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

3. **Secrets** (Settings → Secrets):
   - Add `CMS_API_KEY` for GitHub Actions (if using CI/CD)

## Future Commits

For subsequent commits:

```bash
# Make changes...

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "type: description

- detail 1
- detail 2"

# Push
git push
```

### Conventional Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve navbar highlighting issue"
git commit -m "docs: update CMS API documentation"
git commit -m "refactor: extract validation logic to lib"
```

## Deployment

After pushing to GitHub:

### Frontend (Vercel)

1. Import project in Vercel
2. Framework: Next.js
3. Build command: `npm run build`
4. Add environment variables:
   - `NEXT_PUBLIC_CMS_URL`
   - `CMS_API_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### Backend (VPS/Cloud)

1. SSH into server
2. Clone repository
3. Navigate to `Portfolio-CMS`
4. Setup .env
5. Install dependencies: `npm install`
6. Initialize database: `npm run db:init`
7. Start with PM2: `pm2 start server.js`

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Documentation: https://git-scm.com/doc
- SSH Keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

**Ready to commit!** 🚀

Follow the steps above to push your project to GitHub.
