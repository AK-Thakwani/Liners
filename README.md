# 🌐 Liners - MERN Social Media Platform

A full-stack social media application built with the MERN stack (MongoDB, Express, React, Node.js). Features real-time messaging, secure authentication, and modern interactive UI.

## ✨ Features

- **🔐 User Authentication**: JWT + Google OAuth 2.0
- **💬 Real-time Chat**: Socket.io messaging
- **👥 Social Features**: Follow/unfollow, user profiles
- **🖼️ Media Sharing**: Cloudinary integration
- **🎨 3D UI**: Three.js interactive background
- **📱 Responsive Design**: Tailwind CSS + Bootstrap
- **🛡️ Security**: Helmet, bcrypt, input validation

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Tailwind CSS, Framer Motion, Three.js |
| **Backend** | Node.js, Express 5, Socket.io |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT, Google OAuth 2.0 |
| **Storage** | Cloudinary |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure (New Organization)

```
liners-fullstack/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React context providers
│   │   ├── utils/              # Helper functions
│   │   ├── assets/             # Images, icons, etc.
│   │   ├── App.js
│   │   └── index.js
│   ├── public/                 # Static files
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── backend/                     # Express backend
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Helper functions
│   ├── index.js                # Server entry point
│   ├── db.js                   # Database connection
│   ├── package.json
│   └── .env.example
│
├── deployment/                  # Deployment configs
│   ├── DEPLOYMENT_GUIDE.md     # 📖 Complete guide
│   ├── vercel-frontend.json
│   ├── vercel-backend.json
│   ├── render.yaml
│   ├── deploy-railway.sh
│   └── Procfile
│
├── .github/workflows/           # CI/CD automation
│   ├── deploy-frontend.yml
│   └── deploy-backend.yml
│
├── package.json                # Root scripts
├── .gitignore
├── .nvmrc
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (check `.nvmrc` for exact version)
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials

### 1️⃣ Set Up Local Environment

```bash
# Clone repository
git clone <your-repo-url>
cd liners-fullstack

# Install all dependencies
npm run install-all
```

### 2️⃣ Configure Environment Variables

**Create `frontend/.env`:**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_BASE_URL=http://localhost:5000
```

**Create `backend/.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/liners
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 3️⃣ Run Application

```bash
# Run frontend + backend concurrently
npm run start

# Or run separately in different terminals:
# Terminal 1
npm run start:frontend

# Terminal 2
npm run start:backend
```

Access at: **http://localhost:3000**

---

## 📖 Deployment

Complete deployment guide available in [`deployment/DEPLOYMENT_GUIDE.md`](./deployment/DEPLOYMENT_GUIDE.md)

### Quick Deploy

**Frontend (Vercel):**
```bash
cd frontend && vercel --prod
```

**Backend (Render/Railway):**
- Connect GitHub repo to Render/Railway
- Set environment variables
- Deploy automatically

---

## 📝 Available Scripts

### Root Level
```bash
npm run install-all          # Install all dependencies
npm start                     # Run frontend + backend
npm run dev                   # Development mode
npm run build                # Build production
npm run start:frontend       # Frontend only
npm run start:backend        # Backend only
```

### Frontend
```bash
cd frontend
npm start                    # Development server
npm run build               # Production build
npm test                    # Run tests
npm run eject               # Eject from react-scripts
```

### Backend
```bash
cd backend
npm run dev                 # Development with nodemon
npm start                   # Production
npm test                    # Run tests
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/follow` - Follow user

### Posts
- `GET /api/liners` - Get all posts
- `POST /api/liners` - Create post
- `DELETE /api/liners/:id` - Delete post

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message

### WebSocket Events
- `send_message` - Real-time messaging
- `user_status` - Online/offline status

---

## 🔐 Environment Variables

See [`frontend/.env.example`](./frontend/.env.example) and [`backend/.env.example`](./backend/.env.example)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Port 3000/5000 already in use" | `lsof -i :3000` then `kill -9 <PID>` |
| "MongoDB connection failed" | Check connection string and IP whitelist |
| "CORS errors" | Verify `FRONTEND_URL` in backend `.env` |
| "Module not found" | Run `npm run install-all` |

See [`deployment/DEPLOYMENT_GUIDE.md`](./deployment/DEPLOYMENT_GUIDE.md) for more troubleshooting.

---

## 📚 Learning Resources

- [MERN Stack Tutorial](https://www.freecodecamp.org/news/how-to-build-a-mern-application/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Socket.io Guide](https://socket.io/docs/v4/socket-io-server-api/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- MERN Stack community
- MongoDB, Express, React, Node.js teams
- All contributors and supporters

---

**Last Updated:** April 2026
**Status:** ✅ Production Ready
