# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (free tier) so your analytics data persists across deployments.

## Why MongoDB?

- **Free Forever**: 512MB free database
- **Persistent**: Data survives server restarts AND code deployments
- **Cloud-Based**: No server management needed
- **Reliable**: Industry-standard database

## Step 1: Create MongoDB Atlas Account

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** for a free account
3. **Verify your email**

## Step 2: Create a Free Cluster

1. **Login to MongoDB Atlas**
2. **Click "Build a Database"**
3. **Choose "M0 FREE"** (Free tier)
4. **Select Cloud Provider**: AWS (or any)
5. **Select Region**: Choose closest to your Render.com region (e.g., `us-east-1`)
6. **Cluster Name**: `ats-scanner-cluster` (or any name)
7. **Click "Create"**

Wait 3-5 minutes for cluster to be created.

## Step 3: Create Database User

1. **Go to "Database Access"** (left sidebar)
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `ats-admin` (or any username)
5. **Password**: Generate a strong password (click "Autogenerate Secure Password")
6. **Save the password** - you'll need it!
7. **Database User Privileges**: "Atlas admin" (or "Read and write to any database")
8. **Click "Add User"**

## Step 4: Configure Network Access

1. **Go to "Network Access"** (left sidebar)
2. **Click "Add IP Address"**
3. **Click "Allow Access from Anywhere"** (for Render.com)
   - Or add specific IP: `0.0.0.0/0`
4. **Click "Confirm"**

## Step 5: Get Connection String

1. **Go to "Database"** (left sidebar)
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Driver**: Node.js
5. **Version**: 6.0 or later
6. **Copy the connection string**

It will look like:
```
mongodb+srv://ats-admin:<password>@ats-scanner-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 6: Update Connection String

Replace `<password>` with your actual password:

```
mongodb+srv://ats-admin:YOUR_PASSWORD_HERE@ats-scanner-cluster.xxxxx.mongodb.net/ats_scanner?retryWrites=true&w=majority
```

**Important**: Add database name at the end: `/ats_scanner`

## Step 7: Add to Render.com Environment Variables

1. **Go to Render.com Dashboard**
2. **Click your Backend Web Service** (`ats-backend-df54`)
3. **Go to Settings → Environment Variables**
4. **Click "Add Environment Variable"**
5. **Key**: `MONGODB_URI`
6. **Value**: Paste your connection string (with password replaced)
7. **Click "Save"**

Render will automatically redeploy.

## Step 8: Verify It's Working

1. **Wait 1-2 minutes** for redeploy
2. **Check backend logs** in Render.com:
   - Should see: `✅ MongoDB connected - Analytics will persist across deployments`
3. **Test the app**: Upload a resume
4. **Check admin dashboard**: `https://ats.prepcy.com/#admin`
5. **Redeploy backend** (to test persistence)
6. **Check admin dashboard again** - data should still be there!

## Troubleshooting

### Issue: "MongoServerError: Authentication failed"
- **Solution**: Check password in connection string is correct
- Make sure you replaced `<password>` with actual password

### Issue: "MongoServerError: IP not whitelisted"
- **Solution**: Go to Network Access in MongoDB Atlas
- Add `0.0.0.0/0` to allow all IPs

### Issue: "Connection timeout"
- **Solution**: Check cluster region matches Render.com region
- Verify network access is configured

### Issue: Still using file storage
- **Solution**: Check `MONGODB_URI` environment variable is set correctly
- Check backend logs for connection errors

## Security Best Practices

1. **Use strong password** for database user
2. **Restrict IP access** if possible (but `0.0.0.0/0` is needed for Render.com)
3. **Don't commit** connection string to Git
4. **Rotate password** periodically

## What Happens Now?

- ✅ **Data persists** across server restarts
- ✅ **Data persists** across code deployments
- ✅ **No more resets to 0**!
- ✅ **All analytics** stored permanently in MongoDB

## Free Tier Limits

MongoDB Atlas Free Tier:
- **512MB storage** (plenty for analytics)
- **Shared RAM/CPU**
- **No credit card required**
- **Free forever**

For analytics data, 512MB is more than enough!

---

## Quick Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user with password
- [ ] Configured network access (0.0.0.0/0)
- [ ] Got connection string
- [ ] Replaced `<password>` in connection string
- [ ] Added database name `/ats_scanner` to connection string
- [ ] Added `MONGODB_URI` to Render.com environment variables
- [ ] Backend redeployed successfully
- [ ] Verified connection in logs
- [ ] Tested analytics persistence

---

## Example Connection String Format

```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/ats_scanner?retryWrites=true&w=majority
```

Make sure to:
1. Replace `username` with your database username
2. Replace `password` with your actual password
3. Replace `cluster-name.xxxxx` with your cluster address
4. Add `/ats_scanner` before the `?` (database name)

---

Once set up, your analytics will persist forever! 🎉
