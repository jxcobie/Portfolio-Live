# CMS Migration Guide

The Portfolio CMS has been extracted into its own independent directory for better separation of concerns.

## What Changed

### Before (Monorepo Structure)

```
JxcobCreations/
├── Portfolio-website/
│   ├── cms/              ← CMS was here
│   ├── app/
│   ├── components/
│   └── ...
```

### After (Separate Repositories)

```
JxcobCreations/
├── Portfolio-website/    ← Frontend only
│   ├── app/
│   ├── components/
│   └── ...
├── Portfolio-CMS/        ← NEW: Independent CMS
│   ├── server.js
│   ├── cms_database.db
│   ├── scripts/
│   └── ...
```

## Migration Steps

### Step 1: Stop the Running CMS Server

If you have the CMS server running, stop it first:

```bash
# Press Ctrl+C in the terminal running the CMS
```

### Step 2: Remove Old CMS Directory (Manual)

**IMPORTANT**: The CMS database file is currently locked. You need to manually remove it:

1. Close all applications that might be using the database
2. Open File Explorer
3. Navigate to: `C:\WORK\WEBSITE\JxcobCreations\Portfolio-website\`
4. Delete the `cms/` folder completely

**OR** use PowerShell:

```powershell
# In Portfolio-website directory
Remove-Item -Recurse -Force cms
```

### Step 3: Verify CMS is Removed from Portfolio-website

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-website
ls cms  # Should show "cannot access 'cms': No such file or directory"
```

### Step 4: Setup the New Independent CMS

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-CMS

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Set API_KEY, PORT, etc.

# Initialize database
npm run db:init

# Start CMS server
npm run dev
```

### Step 5: Update Portfolio-website Environment

Create/update `.env.local` in Portfolio-website:

```env
# CMS API Configuration
CMS_INTERNAL_URL=http://localhost:1337
NEXT_PUBLIC_CMS_URL=http://localhost:1337
CMS_API_KEY=your-api-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 6: Start Both Services

**Terminal 1 (CMS):**

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-CMS
npm run dev
```

**Terminal 2 (Website):**

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-website
npm run dev
```

## What's Different

### Portfolio-website Changes

✅ **Removed:**

- `cms/` directory
- CMS-related npm scripts: `cms`, `cms:dev`, `db:push`, `db:seed`, `dev:all`
- CMS dependencies: `concurrently`, `nodemon`

✅ **Updated:**

- `.gitignore` - CMS directory now ignored
- `package.json` - Removed CMS scripts
- `README.md` - Updated documentation

### Portfolio-CMS (New Independent Project)

✅ **Added:**

- Comprehensive `README.md` with full documentation
- `.gitignore` for CMS-specific files
- Proper project structure as standalone application

## Benefits of Separation

### 1. **Independent Deployment**

- Deploy CMS and website separately
- Scale them independently
- Different hosting providers if needed

### 2. **Cleaner Codebase**

- No mixing of frontend and backend code
- Separate dependency management
- Easier to maintain and debug

### 3. **Better Version Control**

- Separate git repositories (optional)
- Independent version numbers
- Clearer commit history

### 4. **Security**

- CMS can be on a private network
- Website on public CDN
- Better API key management

### 5. **Development Experience**

- Run only what you need
- Faster builds (no CMS in frontend build)
- Clear separation of concerns

## Git Repository Setup (Optional)

### Option 1: Keep Both in Same Repo (Current)

```bash
cd C:\WORK\WEBSITE\JxcobCreations
git add .
git commit -m "Separate CMS into independent directory"
git push
```

### Option 2: Separate Git Repositories

**Portfolio-website:**

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-website
git add .
git commit -m "Remove CMS from frontend project"
git push
```

**Portfolio-CMS:**

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-CMS
git init
git add .
git commit -m "Initial commit: Portfolio CMS"
git remote add origin <your-cms-repo-url>
git push -u origin main
```

## Troubleshooting

### Issue: Can't Delete CMS Directory

**Problem**: "Device or resource busy" error

**Solution**:

1. Stop the CMS server (Ctrl+C)
2. Close VS Code or any IDE with the folder open
3. Open Task Manager and end any Node.js processes
4. Try deleting again

### Issue: CMS Won't Start

**Problem**: Port 3002 already in use

**Solution**:

```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Or change port in .env
PORT=3003
```

### Issue: Website Can't Connect to CMS

**Problem**: "Failed to fetch" errors

**Solution**:

1. Ensure CMS is running: `http://localhost:3002`
2. Check `.env.local` has correct `NEXT_PUBLIC_CMS_URL`
3. Check CORS settings in CMS `.env`

### Issue: Database Not Found

**Problem**: "SQLITE_CANTOPEN" error

**Solution**:

```bash
cd C:\WORK\WEBSITE\JxcobCreations\Portfolio-CMS
npm run db:init
```

## Rollback (If Needed)

If you need to rollback to the old structure:

```bash
# Copy CMS back
cp -r Portfolio-CMS Portfolio-website/cms

# Restore old package.json scripts
git checkout HEAD -- Portfolio-website/package.json

# Install dependencies
cd Portfolio-website
npm install
```

## Next Steps

1. ✅ Delete old `cms/` folder from Portfolio-website
2. ✅ Test CMS independently: `http://localhost:3002`
3. ✅ Test website: `http://localhost:3000`
4. ✅ Commit changes to git
5. ✅ Update deployment scripts if any

## Support

For issues:

- Check [Portfolio-CMS/README.md](Portfolio-CMS/README.md)
- Check [Portfolio-website/README.md](Portfolio-website/README.md)
- Email: hello@jxcobcreations.com

---

**Migration completed successfully!** 🎉
