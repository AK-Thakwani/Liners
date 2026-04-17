#!/bin/bash
# Railway deployment script for Liners

echo "🚀 Deploying Liners to Railway..."

# Install backend dependencies
cd backend
npm install
echo "✅ Backend dependencies installed"

# Build frontend
cd ../frontend
npm run build
echo "✅ Frontend built successfully"

echo "🎉 Deployment preparation complete!"
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Railway will auto-deploy on push"
echo "3. Configure environment variables in Railway dashboard"
