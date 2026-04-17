import React, { lazy, Suspense } from 'react';
import './App.css';
import './index.css'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import { UserProvider } from './contexts/UserContext';
import Messaging from './components/Messaging';
import { ChatProvider } from './contexts/ChatContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Footer from './components/Footer';
import Background3D from './components/Background3D';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', background: '#0f172a' }}>
          <h1 style={{ color: '#fff', fontSize: '40px' }}>⚠️ Something went wrong</h1>
          <p style={{ color: '#999', fontSize: '16px', maxWidth: '500px', textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <a href="/home" style={{ color: '#6366f1', textDecoration: 'none', padding: '10px 20px', border: '1px solid #6366f1', borderRadius: '8px' }}>
            Go Home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const FollowRequests = lazy(() => import('./pages/FollowRequests'));
const CreatePost = lazy(() => import('./components/CreatePost'));
const PostList = lazy(() => import('./components/PostList'));
const ContentModeration = lazy(() => import('./components/ContentModeration'));
const Terms = lazy(() => import('./pages/Terms'));
const SafetyNotice = lazy(() => import('./pages/SafetyNotice'));

// Simple Loading Spinner for Suspense
const PageLoader = () => (
  <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Error Fallback for routes
const NotFoundPage = () => (
  <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
    <h1 style={{ color: '#fff', fontSize: '60px' }}>404</h1>
    <p style={{ color: '#999', fontSize: '20px' }}>Page Not Found</p>
    <a href="/home" style={{ color: '#6366f1', textDecoration: 'none', padding: '10px 20px', border: '1px solid #6366f1', borderRadius: '8px' }}>
      Go Home
    </a>
  </div>
);

function AnimatedRoutes({ handleLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignedIn = localStorage.getItem("token") !== null; // ✅ using JWT stored in localStorage
  const hasSeenKamui = localStorage.getItem("kamui_seen") === "true";
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', width: '100%', position: 'relative', overflowX: 'hidden' }}>
      {!isAuthPage && <Background3D canvasOpacity={0.1} />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <ErrorBoundary>
            {isSignedIn ? (
              <>
                <Navbar />
                <Routes location={location} key={location.pathname}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Navigate to="/home" />} />
                  <Route path="/register" element={<Navigate to="/home" />} />
                  <Route path="/landing" element={<Navigate to="/home" />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user/:userId" element={<UserProfile />} />
                  <Route path="/follow-requests" element={<FollowRequests />} />
                  <Route path="/create" element={<CreatePost />} />
                  <Route path="/feed" element={<PostList />} />
                  <Route path="/moderation" element={<ContentModeration />} />
                  <Route path="/messages" element={<Messaging isOpen={true} onClose={() => navigate(-1)} />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/safety" element={<SafetyNotice />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </>
            ) : (
              <Routes location={location} key={location.pathname}>
                <Route path="/landing" element={hasSeenKamui ? <Navigate to="/login" /> : <Home />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={hasSeenKamui ? <Navigate to="/login" /> : <Navigate to="/landing" />} />
              </Routes>
            )}
          </ErrorBoundary>
        </Suspense>
      </AnimatePresence>
      {isSignedIn && <Footer />}
    </div>
  );
}

function App() {
  const handleLogin = () => {
    // Do something on login, e.g., set auth state
    console.log('User logged in!');
  };

  return (
    <UserProvider>
      <ChatProvider>
        <Router>
          <AnimatedRoutes handleLogin={handleLogin} />
        </Router>
      </ChatProvider>
    </UserProvider>
  );
}

export default App;
