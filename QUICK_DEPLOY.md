# ⚡ Quick Deployment Checklist for Hostinger

## ✅ Pre-Deployment Checklist

- [ ] All hardcoded `localhost:5000` URLs updated (✅ Done)
- [ ] Frontend built for production
- [ ] Environment variables configured
- [ ] Files ready to upload

## 🚀 Deployment Steps

### Step 1: Build Frontend with Production API URL

```bash
# Create .env.production in frontend folder
cd frontend
echo "REACT_APP_API_URL=https://prepcy.com/api" > .env.production

# Build
npm run build
```

### Step 2: Upload Frontend

**Via Hostinger File Manager:**
1. Go to `public_html/` folder
2. **Delete old files** (backup first!)
3. Upload ALL files from `frontend/build/` folder
4. Upload `.htaccess` file to `public_html/`

**Files to upload:**
- `index.html`
- `static/` folder (entire folder)
- `.htaccess`

### Step 3: Upload Backend

**Via SSH (Recommended):**
```bash
# Connect via SSH
ssh username@your-server-ip

# Create backend directory (if not exists)
mkdir -p ~/ats-backend
cd ~/ats-backend

# Upload backend files (via SCP, FTP, or Git)
# Then:
npm install --production
```

**Create `.env` file:**
```bash
nano .env
# Paste:
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://prepcy.com
MAX_FILE_SIZE=10485760
KEYWORD_COUNT=30
```

### Step 4: Start Backend with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the instructions it gives you
```

### Step 5: Verify Deployment

1. **Test Frontend:** `https://prepcy.com`
2. **Test Backend:** `https://prepcy.com/api/v1/resumes/health`
3. **Test Full Flow:** Upload resume and analyze

## 🔧 Important Configuration

### Backend .env (in `ats-backend/` folder)
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://prepcy.com
```

### Frontend .env.production (before build)
```env
REACT_APP_API_URL=https://prepcy.com/api
```

### Cloudflare Settings
- SSL/TLS: Full or Full (strict)
- Always Use HTTPS: ON
- DNS: prepcy.com → Your Hostinger IP

## 🐛 Troubleshooting

**Backend not working:**
```bash
pm2 logs          # Check logs
pm2 list          # Check if running
pm2 restart all   # Restart
```

**Frontend shows old version:**
- Clear browser cache
- Clear Cloudflare cache
- Verify new files uploaded

**API 404 errors:**
- Check .htaccess file is in public_html/
- Check PM2 is running backend
- Check backend .env has correct PORT

## 📞 Quick Commands

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs ats-backend

# Restart backend
pm2 restart ats-backend

# Stop backend
pm2 stop ats-backend
```
