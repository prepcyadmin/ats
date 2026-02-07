# 🏗️ Hostinger Quick Setup Guide

## Quick Steps to Deploy

### 1. Prepare Files Locally

```bash
# Build frontend
cd frontend
npm run build
cd ..

# The build folder is ready to upload
```

### 2. Upload to Hostinger

#### Frontend (React Build)
- **Location:** `public_html/` folder
- **Files to upload:** Everything from `frontend/build/` folder
- **Also upload:** `.htaccess` file (from `frontend/public/.htaccess`)

#### Backend (Node.js)
- **Location:** `ats-backend/` folder (create this in your home directory, NOT in public_html)
- **Files to upload:** All files from `backend/` folder
- **Create:** `.env` file (see below)

### 3. Backend Setup via SSH

```bash
# Connect to Hostinger via SSH
ssh your-username@your-server-ip

# Navigate to backend
cd ~/ats-backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Paste the environment variables (see below)

# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Backend .env File

Create `ats-backend/.env` with:

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://prepcy.com
MAX_FILE_SIZE=10485760
KEYWORD_COUNT=30
```

### 5. Frontend Environment (Before Build)

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://prepcy.com/api
```

Then rebuild:
```bash
cd frontend
npm run build
```

### 6. Cloudflare Configuration

1. **DNS:**
   - `prepcy.com` → Your Hostinger IP (A Record)
   - `www.prepcy.com` → Your Hostinger IP (A Record)

2. **SSL/TLS:**
   - Set to "Full" or "Full (strict)"

3. **Always Use HTTPS:** Enable

### 7. Test

- Frontend: `https://prepcy.com`
- Backend API: `https://prepcy.com/api/v1/resumes/health`

## 🔄 Updating After Changes

### Update Frontend:
```bash
cd frontend
npm run build
# Upload build/ folder contents to public_html/
```

### Update Backend:
```bash
# Via SSH
cd ~/ats-backend
# Upload new files or git pull
npm install
pm2 restart ecosystem.config.js
```

## 📁 File Structure on Hostinger

```
/home/your-username/
├── public_html/              # Frontend (React build)
│   ├── index.html
│   ├── static/
│   └── .htaccess
│
└── ats-backend/              # Backend (Node.js)
    ├── server.js
    ├── package.json
    ├── .env
    ├── ecosystem.config.js
    └── [other backend files]
```

## ⚠️ Important Notes

1. **Backend should NOT be in public_html** - it's a security risk
2. **Use PM2** to keep backend running 24/7
3. **Update CORS_ORIGIN** in backend .env to match your domain
4. **Clear Cloudflare cache** after deployment
5. **Check PM2 logs** if backend isn't working: `pm2 logs`

## 🐛 Common Issues

**Backend not accessible:**
- Check PM2: `pm2 list` and `pm2 logs`
- Check port: Backend should run on port 5000
- Check .htaccess has API proxy rules

**Frontend shows old version:**
- Clear browser cache
- Clear Cloudflare cache
- Verify new files are uploaded

**CORS errors:**
- Update CORS_ORIGIN in backend .env
- Check Cloudflare SSL settings
