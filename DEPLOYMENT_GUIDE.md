# 🚀 Hostinger Deployment Guide

Complete guide to deploy your AI ATS Scanner to Hostinger (prepcy.com)

## 📋 Prerequisites

1. Hostinger hosting account with:
   - Node.js support (VPS or Business hosting)
   - SSH access
   - Domain: prepcy.com (already configured)

2. Cloudflare account (already set up)

## 🗂️ Deployment Structure

```
Hostinger Server:
├── /home/username/
│   ├── public_html/          # Frontend (React build)
│   │   ├── index.html
│   │   ├── static/
│   │   └── .htaccess
│   │
│   └── ats-backend/          # Backend (Node.js)
│       ├── server.js
│       ├── package.json
│       ├── .env
│       └── ecosystem.config.js (PM2)
```

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Update API URLs** (Already done - using environment variables)
2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   This creates a `build` folder with production files.

### Step 2: Upload Files to Hostinger

#### Option A: Using File Manager (Easiest)

1. **Upload Frontend:**
   - Go to Hostinger File Manager
   - Navigate to `public_html` folder
   - Delete old files (backup first!)
   - Upload all files from `frontend/build/` folder
   - Upload `.htaccess` file (see below)

2. **Upload Backend:**
   - Create folder: `ats-backend` (outside public_html)
   - Upload all files from `backend/` folder
   - Upload `.env` file (see below)

#### Option B: Using FTP/SFTP

1. Connect via FTP client (FileZilla, WinSCP)
2. Upload frontend build to `public_html/`
3. Upload backend to `ats-backend/` folder

#### Option C: Using SSH (Recommended)

```bash
# Connect via SSH
ssh username@your-server-ip

# Navigate to your home directory
cd ~

# Create backend directory
mkdir -p ats-backend

# Upload files (use SCP or Git)
```

### Step 3: Configure Backend

1. **SSH into your Hostinger server**

2. **Navigate to backend folder:**
   ```bash
   cd ~/ats-backend
   ```

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Create `.env` file:**
   ```bash
   nano .env
   ```
   
   Add these variables:
   ```env
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://prepcy.com
   MAX_FILE_SIZE=10485760
   KEYWORD_COUNT=30
   ```

5. **Install PM2 (Process Manager):**
   ```bash
   npm install -g pm2
   ```

6. **Start backend with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Step 4: Configure Frontend

1. **Create `.htaccess` in `public_html/`:**
   - See `.htaccess` file below
   - This handles React Router and API proxy

2. **Create `.env.production` in frontend (before build):**
   ```env
   REACT_APP_API_URL=https://prepcy.com/api
   ```
   
   Then rebuild:
   ```bash
   cd frontend
   npm run build
   ```

### Step 5: Configure Cloudflare

1. **DNS Settings:**
   - A Record: `prepcy.com` → Your Hostinger IP
   - A Record: `www.prepcy.com` → Your Hostinger IP
   - CNAME: `api.prepcy.com` → `prepcy.com` (optional, for subdomain)

2. **SSL/TLS:**
   - Set to "Full" or "Full (strict)"
   - Enable "Always Use HTTPS"

3. **Page Rules (Optional):**
   - `prepcy.com/api/*` → Cache Level: Bypass

### Step 6: Configure Hostinger

1. **Node.js Version:**
   - Go to Hostinger hPanel
   - Select Node.js version (18.x or 20.x recommended)

2. **Port Configuration:**
   - Backend runs on port 5000 (or configure in .env)
   - May need to configure reverse proxy in Apache/Nginx

## 🔧 Configuration Files

### Backend `.env` (Create in `ats-backend/`)

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://prepcy.com
MAX_FILE_SIZE=10485760
KEYWORD_COUNT=30
COSINE_WEIGHT=0.5
KEYWORD_MATCH_WEIGHT=0.5
MAX_BOOST_POINTS=20
```

### Frontend `.env.production` (Create before build)

```env
REACT_APP_API_URL=https://prepcy.com/api
```

### PM2 Ecosystem Config (`ecosystem.config.js`)

See file below - place in `ats-backend/` folder

### Apache `.htaccess` (For `public_html/`)

See file below - handles React Router and API proxy

## 🔄 Updating Your Deployment

1. **Update Frontend:**
   ```bash
   cd frontend
   npm run build
   # Upload build/ folder contents to public_html/
   ```

2. **Update Backend:**
   ```bash
   cd ~/ats-backend
   git pull  # or upload new files
   npm install
   pm2 restart ecosystem.config.js
   ```

## 🧪 Testing

1. **Test Frontend:**
   - Visit: `https://prepcy.com`
   - Should load your new ATS scanner

2. **Test Backend:**
   - Visit: `https://prepcy.com/api/v1/resumes/health`
   - Should return: `{"success":true,"message":"ATS Scanner API is running"}`

3. **Test Full Flow:**
   - Upload a resume
   - Enter job description
   - Click "Analyze Resume"
   - Should see results

## 🐛 Troubleshooting

### Backend not starting:
- Check PM2 logs: `pm2 logs`
- Check port: `netstat -tulpn | grep 5000`
- Check .env file exists and has correct values

### Frontend shows old version:
- Clear browser cache (Ctrl+Shift+Delete)
- Clear Cloudflare cache
- Check .htaccess is in public_html/

### CORS errors:
- Update CORS_ORIGIN in backend .env
- Check Cloudflare SSL settings

### 404 errors:
- Check .htaccess file
- Verify API routes are correct
- Check PM2 is running backend

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Apache/Nginx error logs
3. Check browser console for errors
4. Verify all environment variables are set
