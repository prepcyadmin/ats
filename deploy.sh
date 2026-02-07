#!/bin/bash

# Deployment Script for Hostinger
# Run this script to prepare files for deployment

echo "🚀 Preparing deployment files..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment

# Copy frontend build
echo "📋 Copying frontend build..."
cp -r frontend/build/* deployment/frontend/

# Copy backend files
echo "📋 Copying backend files..."
mkdir -p deployment/backend
cp -r backend/* deployment/backend/
rm -rf deployment/backend/node_modules

# Copy .htaccess
echo "📋 Copying .htaccess..."
cp frontend/public/.htaccess deployment/frontend/

# Copy environment examples
echo "📋 Copying environment examples..."
cp backend/.env.example deployment/backend/
cp frontend/.env.production.example deployment/frontend/

echo "✅ Deployment package ready in 'deployment/' folder"
echo ""
echo "📝 Next steps:"
echo "1. Upload deployment/frontend/* to public_html/"
echo "2. Upload deployment/backend/* to ats-backend/"
echo "3. Create .env file in ats-backend/ with your production values"
echo "4. SSH into server and run: cd ats-backend && npm install && pm2 start ecosystem.config.js"
