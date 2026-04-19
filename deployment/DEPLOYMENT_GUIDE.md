# 🚀 Liners - Complete Deployment Guide

## Project Structure

```
liners-fullstack/
├── frontend/          # React frontend application
├── backend/           # Express.js backend API
├── deployment/        # Deployment configurations
├── .github/workflows/ # GitHub Actions CI/CD
└── package.json       # Root package.json (full-stack scripts)
```

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured locally
- [ ] All tests passing
- [ ] Frontend builds successfully (`npm run build:frontend`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] MongoDB connection verified
- [ ] Cloudinary credentials configured
- [ ] GitHub repository connected

---

## 🔧 Local Setup

### 1. Install Dependencies
```bash
# From root directory
npm run install-all
```

### 2. Create Environment Files

**Create `frontend/.env`:**
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Create `backend/.env`:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/liners
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 3. Run Locally

**Option A: Run both frontend and backend together**
```bash
npm run start
```

**Option B: Run separately (in different terminals)**
```bash
# Terminal 1: Frontend
npm run start:frontend

# Terminal 2: Backend
npm run start:backend
```

---

## ☁️ Deployment Platforms

### 🌐 Frontend Deployment (Vercel)

#### Automated (GitHub Actions)
1. Push to `main` branch
2. GitHub Actions automatically deploys to Vercel
3. Set secrets in GitHub:
   - `VERCEL_TOKEN`: From Vercel account settings
   - `VERCEL_ORG_ID`: From Vercel org settings
   - `VERCEL_FRONTEND_PROJECT_ID`: From Vercel project
   - `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth ID
   - `REACT_APP_API_URL`: Your backend URL
   - `REACT_APP_SOCKET_URL`: Your backend URL

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod
```

**Configuration File:** `deployment/vercel-frontend.json`

---

### 🔧 Backend Deployment (Render)

#### Automated (GitHub Actions)
1. Push to `main` branch
2. GitHub Actions triggers Render deployment
3. Set secrets in GitHub:
   - `RENDER_DEPLOY_HOOK`: From Render dashboard

#### Manual Deployment
1. Connect GitHub repo to Render
2. Set environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

**Build Command:** `cd backend && npm install && npm start`
**Configuration File:** `deployment/render.yaml`

---

### 🚆 Alternative: Railway Deployment

Use Railway for full-stack deployment:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
sh deployment/deploy-railway.sh
```

Set environment variables in Railway dashboard for:
- Backend: MONGODB_URI, JWT_SECRET, etc.
- Frontend: REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_API_BASE_URL

---

## 🔐 Environment Variables Reference

### Frontend (.env)
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_id
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/liners
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_id
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-frontend-url.com
PORT=5000
NODE_ENV=production
```

---

## 📦 Build Commands

### Frontend
```bash
cd frontend
npm run build
# Output: frontend/build/
```

### Backend
Backend doesn't need building but requires:
```bash
cd backend
npm install
npm start
```

### Full-stack Build
```bash
npm run build  # Builds both frontend and backend
```

---

## ✅ Post-Deployment Verification

- [ ] Frontend loads successfully
- [ ] Backend API responds to requests
- [ ] WebSocket connections work (messaging)
- [ ] Database queries execute
- [ ] Authentication flows work
- [ ] File uploads function (Cloudinary)
- [ ] CORS properly configured

---

## 🐛 Troubleshooting

### "Can't connect to backend"
- Verify `FRONTEND_URL` is set in backend `.env`
- Check CORS configuration in `backend/index.js`
- Ensure backend is running and accessible

### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Confirm database credentials

### "Cloudinary errors"
- Verify Cloudinary credentials in `.env`
- Check Cloudinary account settings
- Ensure upload folder exists in Cloudinary

### "CORS errors"
- Add frontend URL to `allowedOrigins` in backend
- Verify `FRONTEND_URL` environment variable

---

## 🚀 Quick Deploy Commands

```bash
# Prepare for deployment
npm run build

# Deploy frontend only
cd frontend && vercel --prod

# Deploy backend only
cd backend && npm start  # Then configure on Render/Railway

# Full deployment
npm run build && cd backend && npm start
```

---

## 📚 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

**Last Updated:** April 2026
**Project:** Liners - MERN Social Media Platform
