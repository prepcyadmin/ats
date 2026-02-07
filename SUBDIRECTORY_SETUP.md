# Setting Up ATS Scanner at prepcy.com/ats

This guide will help you deploy the ATS Scanner application to work at `prepcy.com/ats`.

## Prerequisites

- Domain: `prepcy.com` (already configured)
- Hostinger hosting account
- Backend deployed on Render.com: `https://ats-backend-df54.onrender.com`

## Step 1: Build the Frontend for Subdirectory

The frontend is already configured with `"homepage": "/ats"` in `package.json`. 

Build the frontend:
```bash
cd frontend
npm install
npm run build
```

This will create a `build` folder with all static files configured for `/ats` path.

## Step 2: Upload Files to Hostinger

### Option A: Using File Manager (Recommended)

1. **Login to Hostinger cPanel**
2. **Navigate to File Manager**
3. **Go to `public_html` folder**
4. **Create a new folder called `ats`** (if it doesn't exist)
5. **Upload all files from `frontend/build/` to `public_html/ats/`**

   Files to upload:
   - `index.html`
   - `static/` folder (contains CSS, JS, images)
   - `favicon.ico`
   - `manifest.json`
   - `robots.txt` (if exists)
   - `.htaccess` (from `frontend/public/.htaccess`)

### Option B: Using FTP

1. **Connect to your Hostinger FTP**
2. **Navigate to `public_html/ats/`**
3. **Upload all files from `frontend/build/`**

## Step 3: Configure .htaccess

The `.htaccess` file should already be in your `frontend/public/` folder. Make sure it's uploaded to `public_html/ats/.htaccess`.

The `.htaccess` file should contain:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /ats/

  # Handle API requests - proxy to backend (Render.com)
  RewriteCond %{REQUEST_URI} ^/ats/api/(.*)$
  RewriteRule ^ats/api/(.*)$ https://ats-backend-df54.onrender.com/api/$1 [P,L]

  # Handle React Router - serve index.html for all routes under /ats
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/ats/api/
  RewriteCond %{REQUEST_URI} ^/ats
  RewriteRule . /ats/index.html [L]
</IfModule>
```

## Step 4: Update Environment Variables

### On Hostinger (if using Node.js)

If you're running Node.js on Hostinger, set:
```bash
REACT_APP_API_URL=https://ats-backend-df54.onrender.com/api/v1
```

### For Static Hosting

The API URL is already configured in the code to use the Render backend.

## Step 5: Test the Setup

1. **Visit `https://prepcy.com/ats`** - Should show the ATS Scanner home page
2. **Visit `https://prepcy.com/ats/#admin`** - Should show the admin dashboard
3. **Test file upload** - Upload a resume and check if it analyzes correctly

## Step 6: Update Backend CORS (if needed)

Make sure your backend on Render.com allows requests from `prepcy.com`:

In Render.com backend environment variables:
```
CORS_ORIGIN=https://prepcy.com,https://prepcy.com/ats
```

## Troubleshooting

### Issue: 404 Error on prepcy.com/ats
- **Solution**: Make sure all files are in `public_html/ats/` folder
- Check that `index.html` exists in `public_html/ats/`

### Issue: API calls failing
- **Solution**: Check `.htaccess` file is in `public_html/ats/`
- Verify backend URL in `.htaccess` matches your Render backend
- Check browser console for CORS errors

### Issue: CSS/JS files not loading
- **Solution**: Check that `static/` folder is uploaded correctly
- Verify file paths in browser Network tab
- Make sure `homepage: "/ats"` is set in `package.json`

### Issue: React Router not working
- **Solution**: Ensure `.htaccess` rewrite rules are correct
- Check that `mod_rewrite` is enabled on Hostinger
- Verify `RewriteBase /ats/` is set correctly

## File Structure on Hostinger

```
public_html/
├── index.html (your main site)
├── ats/
│   ├── index.html
│   ├── .htaccess
│   ├── favicon.ico
│   ├── manifest.json
│   └── static/
│       ├── css/
│       ├── js/
│       └── media/
```

## Alternative: Using Render.com Static Site

If you prefer to keep everything on Render.com:

1. **Deploy frontend as Static Site on Render.com**
2. **Set Custom Domain**: `ats.prepcy.com` (subdomain)
3. **Point DNS**: Add CNAME record `ats` → `ats-frontend-uhwh.onrender.com`

This is simpler but requires a subdomain instead of subdirectory.

## Quick Deploy Script

Create a script to automate the build and upload:

```bash
#!/bin/bash
cd frontend
npm run build
# Then use FTP or File Manager to upload build/ contents to public_html/ats/
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server error logs in Hostinger
3. Verify all file paths are correct
4. Test API endpoint directly: `https://ats-backend-df54.onrender.com/api/v1/resumes/health`
