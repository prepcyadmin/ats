# Setting Up Custom Domain on Render.com

This guide will help you connect your `prepcy.com` domain to your Render.com applications.

## Current Setup

- **Domain**: prepcy.com (in Cloudflare)
- **Frontend**: Deployed on Render.com (Static Site)
- **Backend**: Deployed on Render.com (Web Service)

## Option 1: Use Subdomain (Easier - Recommended)

Use `ats.prepcy.com` instead of `prepcy.com/ats`. This is much easier with Render.com.

### Step 1: Configure Frontend on Render.com

1. **Go to Render.com Dashboard**
2. **Click on your Frontend Static Site** (`ats-frontend-uhwh`)
3. **Go to Settings tab**
4. **Scroll down to "Custom Domains" section**
5. **Click "Add Custom Domain"**
6. **Enter**: `ats.prepcy.com`
7. **Click "Add"**

Render will show you DNS records to add.

### Step 2: Configure DNS in Cloudflare

1. **Login to Cloudflare Dashboard**
2. **Select your domain** `prepcy.com`
3. **Go to DNS → Records**
4. **Add CNAME Record**:
   - **Type**: CNAME
   - **Name**: `ats` (or `ats.prepcy.com`)
   - **Target**: `ats-frontend-uhwh.onrender.com`
   - **Proxy status**: ✅ Proxied (orange cloud)
   - **TTL**: Auto
5. **Click "Save"**

### Step 3: Update Frontend Configuration

Since we're using a subdomain, we need to update the homepage:

1. **Update `frontend/package.json`**:
   ```json
   {
     "homepage": "."
   }
   ```
   (Remove the `/ats` from homepage)

2. **Rebuild and redeploy**:
   ```bash
   cd frontend
   npm run build
   git add .
   git commit -m "Update for subdomain deployment"
   git push
   ```

### Step 4: Configure Backend (Optional - for custom domain)

If you want `api.prepcy.com` for backend:

1. **Go to Backend Web Service** on Render.com
2. **Settings → Custom Domains**
3. **Add**: `api.prepcy.com`
4. **In Cloudflare**: Add CNAME `api` → `ats-backend-df54.onrender.com`

**OR** keep backend on Render subdomain (easier):
- Backend stays at: `ats-backend-df54.onrender.com`
- Frontend calls it directly (already configured)

### Step 5: Update CORS in Backend

1. **Go to Backend on Render.com**
2. **Settings → Environment Variables**
3. **Update `CORS_ORIGIN`**:
   ```
   https://ats.prepcy.com,https://prepcy.com
   ```
4. **Save** (Render will redeploy automatically)

### Step 6: Wait for DNS Propagation

- DNS changes take 5-30 minutes
- Check status in Render.com dashboard (Custom Domains section)
- When it shows "Active", you're ready!

### Step 7: Test

Visit:
- ✅ `https://ats.prepcy.com` - Main app
- ✅ `https://ats.prepcy.com/#admin` - Admin dashboard

---

## Option 2: Use Subdirectory prepcy.com/ats (More Complex)

If you MUST use `prepcy.com/ats` (subdirectory), you have two choices:

### Choice A: Use Hostinger (Recommended for subdirectory)

1. **Build frontend** with `homepage: "/ats"` (already configured)
2. **Upload to Hostinger** `public_html/ats/` folder
3. **Point prepcy.com DNS** to Hostinger nameservers
4. **Keep backend on Render.com**

See `SUBDIRECTORY_SETUP.md` for detailed instructions.

### Choice B: Use Render + Reverse Proxy

This requires:
1. **Another service** (like Nginx) to route `/ats` to Render
2. **More complex setup**
3. **Not recommended** - use subdomain instead

---

## Recommended Setup (Easiest)

**Use Subdomain**: `ats.prepcy.com`

### DNS Configuration in Cloudflare:

```
Type    Name    Target                              Proxy
CNAME   ats     ats-frontend-uhwh.onrender.com     ✅ Proxied
```

### Render.com Configuration:

**Frontend:**
- Custom Domain: `ats.prepcy.com`
- Homepage: `.` (root)

**Backend:**
- Keep on: `ats-backend-df54.onrender.com`
- CORS: `https://ats.prepcy.com`

---

## Step-by-Step: Render.com Custom Domain Setup

### For Frontend (Static Site):

1. **Render Dashboard** → Your Frontend Service
2. **Settings** → **Custom Domains**
3. **Add Custom Domain**: `ats.prepcy.com`
4. **Copy the DNS record** shown (CNAME)
5. **Add to Cloudflare**:
   - Type: CNAME
   - Name: `ats`
   - Target: `ats-frontend-uhwh.onrender.com`
   - Proxy: ✅ ON
6. **Wait 5-30 minutes** for DNS propagation
7. **Render will automatically issue SSL certificate**

### For Backend (Web Service):

**Option 1: Keep on Render subdomain** (Easier)
- No changes needed
- Backend stays: `ats-backend-df54.onrender.com`
- Update CORS to allow `ats.prepcy.com`

**Option 2: Use custom domain** (Optional)
- Add custom domain: `api.prepcy.com`
- Add CNAME in Cloudflare: `api` → `ats-backend-df54.onrender.com`
- Update frontend API URL to use `api.prepcy.com`

---

## Update Frontend for Subdomain

Since we're switching from `/ats` to subdomain, update:

1. **`frontend/package.json`**:
   ```json
   {
     "homepage": "."
   }
   ```

2. **Rebuild**:
   ```bash
   cd frontend
   npm run build
   git add .
   git commit -m "Update for subdomain ats.prepcy.com"
   git push
   ```

3. **Render will auto-deploy**

---

## Environment Variables on Render

### Frontend (Static Site):
```
REACT_APP_API_URL=https://ats-backend-df54.onrender.com/api/v1
```

### Backend (Web Service):
```
CORS_ORIGIN=https://ats.prepcy.com,https://prepcy.com
PORT=10000
NODE_ENV=production
```

---

## Testing Checklist

After setup, test:

- [ ] `https://ats.prepcy.com` loads correctly
- [ ] File upload works
- [ ] Resume analysis works
- [ ] Admin dashboard: `https://ats.prepcy.com/#admin`
- [ ] No CORS errors in browser console
- [ ] SSL certificate is active (green lock)

---

## Troubleshooting

### Issue: "Domain not found" or "Not Active"
- **Solution**: Wait 5-30 minutes for DNS propagation
- Check Cloudflare DNS records are correct
- Verify CNAME target matches Render subdomain

### Issue: SSL Certificate Pending
- **Solution**: Wait 10-30 minutes
- Render automatically issues SSL via Let's Encrypt
- Check Render dashboard for status

### Issue: CORS Errors
- **Solution**: Update backend `CORS_ORIGIN` environment variable
- Add: `https://ats.prepcy.com`
- Restart backend service

### Issue: 404 Errors
- **Solution**: Check `homepage` in `package.json` is `.` (not `/ats`)
- Rebuild and redeploy frontend

---

## Quick Summary

**Easiest Setup:**
1. ✅ Use subdomain: `ats.prepcy.com`
2. ✅ Add CNAME in Cloudflare: `ats` → `ats-frontend-uhwh.onrender.com`
3. ✅ Add custom domain in Render.com frontend settings
4. ✅ Update `package.json` homepage to `.`
5. ✅ Update backend CORS to include `https://ats.prepcy.com`
6. ✅ Wait for DNS/SSL (5-30 minutes)
7. ✅ Done!

**Your app will be live at:** `https://ats.prepcy.com`
