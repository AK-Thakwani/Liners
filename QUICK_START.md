# 🎯 Quick Reference Card

## 📦 Folder Structure

```
mernstack/
├── frontend/           ← React app (copy from liners/src & liners/public)
├── backend/            ← Express API (copy from liners/backend)
├── deployment/         ← Deployment configs (ready to use)
├── .github/workflows/  ← GitHub Actions CI/CD (auto-deployment)
└── package.json        ← Full-stack scripts
```

## ⚡ Common Commands

```bash
# First time setup
npm run install-all                 # Install all dependencies

# Local development
npm run start                        # Run frontend + backend
npm run start:frontend              # Frontend only (port 3000)
npm run start:backend               # Backend only (port 5000)

# Production
npm run build                        # Build frontend + backend
npm run build:frontend              # Build frontend only
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** Check backend routes in `/backend/routes/`

## 🔐 Environment Variables

### Frontend (`frontend/.env`)
```
REACT_APP_GOOGLE_CLIENT_ID=your_id
REACT_APP_API_BASE_URL=http://localhost:5000
```

### Backend (`backend/.env`)
```
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## 🚀 Deployment Platforms

| Platform | Frontend | Backend | Config |
|----------|----------|---------|--------|
| **Vercel** | ✅ Recommended | ❌ (Limited) | `vercel-frontend.json` |
| **Render** | ✅ Works | ✅ Recommended | `render.yaml` |
| **Railway** | ✅ Works | ✅ Works | `deploy-railway.sh` |

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview & features |
| `MIGRATION_GUIDE.md` | How to copy files from old `/liners` structure |
| `deployment/DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `PROJECT_STRUCTURE.md` | This structure summary |

## 🔄 First Time Migration

1. **Copy frontend:**
   ```bash
   cp -r liners/src/* frontend/src/
   cp -r liners/public/* frontend/public/
   ```

2. **Copy backend:**
   ```bash
   cp -r liners/backend/models/* backend/models/
   cp -r liners/backend/routes/* backend/routes/
   cp -r liners/backend/middleware/* backend/middleware/
   cp -r liners/backend/utils/* backend/utils/
   cp liners/backend/index.js backend/
   cp liners/backend/db.js backend/
   ```

3. **Setup environment:**
   ```bash
   cp liners/.env frontend/.env
   cp liners/backend/.env backend/.env
   # Edit both .env files with your credentials
   ```

4. **Install & run:**
   ```bash
   npm run install-all
   npm run start
   ```

See `MIGRATION_GUIDE.md` for detailed instructions!

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | `npm run install-all` |
| Port in use | `lsof -i :3000` then `kill -9 PID` |
| CORS errors | Check `FRONTEND_URL` in backend `.env` |
| Can't connect to backend | Verify `REACT_APP_API_BASE_URL` in frontend `.env` |
| MongoDB connection failed | Check `MONGODB_URI` in backend `.env` |

See `deployment/DEPLOYMENT_GUIDE.md` for more!

## 🎛️ Project Info

- **Stack:** MERN (MongoDB, Express, React, Node.js)
- **Frontend:** React 19 + Tailwind CSS + Three.js
- **Backend:** Express 5 + Socket.io + MongoDB
- **Deployment:** Vercel (frontend) + Render (backend)
- **Node Version:** 18.19.0 (see `.nvmrc`)

## ✅ Next Steps

1. Read `MIGRATION_GUIDE.md`
2. Copy files from `/liners` to `/frontend` and `/backend`
3. Configure `.env` files
4. Run `npm run start`
5. Deploy using `deployment/DEPLOYMENT_GUIDE.md`

---

**Last Updated:** April 2026
**Need Help?** See README.md or deployment/DEPLOYMENT_GUIDE.md
