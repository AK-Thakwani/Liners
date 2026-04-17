import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import SplineViewer from '../components/SplineViewer';
import logo from '../assets/logo.png';

// Simple WebGL availability check
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (_) {
    return false;
  }
}

// Error boundary to catch runtime errors from the viewer
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('Spline viewer error:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [isForgot, setIsForgot] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1: email, 2: otp verify, 3: reset pw
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtpDigits, setFpOtpDigits] = useState(['', '', '', '', '', '']);
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState('');
  const [fpError, setFpError] = useState('');

  const [webglReady, setWebglReady] = useState(true);
  useEffect(() => {
    setWebglReady(isWebGLAvailable());
  }, []);

  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password,
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user?._id) {
          localStorage.setItem('userId', res.data.user._id);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        onLogin();
        navigate('/home');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/google-login`, {
        token: credential,
      });

      // eslint-disable-next-line no-console
      console.log('Google login backend response:', res);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user?._id) {
          localStorage.setItem('userId', res.data.user._id);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        // eslint-disable-next-line no-console
        console.log(localStorage.getItem('token'));
        onLogin();
        navigate('/home');
      } else {
        setError(res.data.message || 'Google login failed');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Google login failed'
      );
    }
  };

  // Forgot Password: Step 1 - Request OTP
  const requestOTP = async (e) => {
    e?.preventDefault?.();
    setFpError('');
    setFpMsg('');
    if (!validateEmail(fpEmail)) {
      setFpError('Please enter a valid email.');
      return;
    }
    setFpLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { email: fpEmail });
      if (res.data?.success) {
        setFpMsg('OTP sent to your email (valid for 10 minutes).');
        setFpStep(2);
      } else {
        setFpError(res.data?.message || 'Failed to send OTP');
      }
    } catch (err) {
      setFpError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setFpLoading(false);
    }
  };

  // Forgot Password: Step 2 - Verify OTP
  const verifyOTP = async (e) => {
    e?.preventDefault?.();
    setFpError('');
    setFpMsg('');
    const code = fpOtpDigits.join('');
    if (!code || code.length !== 6) {
      setFpError('Enter the 6-digit OTP.');
      return;
    }
    setFpLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify-otp`, { email: fpEmail, otp: code });
      if (res.data?.success) {
        setFpMsg('OTP verified. Please set a new password.');
        setFpStep(3);
      } else {
        setFpError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setFpError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setFpLoading(false);
    }
  };

  // Forgot Password: Step 3 - Reset password
  const resetPassword = async (e) => {
    e?.preventDefault?.();
    setFpError('');
    setFpMsg('');
    const code = fpOtpDigits.join('');
    if (fpNewPassword.length < 8) {
      setFpError('Password must be at least 8 characters.');
      return;
    }
    if (fpNewPassword !== fpConfirm) {
      setFpError('Passwords do not match.');
      return;
    }
    setFpLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password-with-otp`, {
        email: fpEmail,
        otp: code,
        newPassword: fpNewPassword,
      });
      if (res.data?.success) {
        setFpMsg('Password updated successfully. You can now sign in.');
        // Reset forgot flow and prefill email in login form
        setIsForgot(false);
        setEmail(fpEmail);
        setPassword('');
        setFpStep(1);
        setFpEmail('');
        setFpOtpDigits(['', '', '', '', '', '']);
        setFpNewPassword('');
        setFpConfirm('');
      } else {
        setFpError(res.data?.message || 'Failed to reset password');
      }
    } catch (err) {
      setFpError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setFpLoading(false);
    }
  };

  const otpRefs = Array.from({ length: 6 }, () => React.createRef());
  const onOtpChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...fpOtpDigits];
    next[idx] = val;
    setFpOtpDigits(next);
    if (val && idx < 5) {
      otpRefs[idx + 1].current?.focus();
    }
  };
  const onOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !fpOtpDigits[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs[idx - 1].current?.focus();
    if (e.key === 'ArrowRight' && idx < 5) otpRefs[idx + 1].current?.focus();
  };
  const onOtpPaste = (e) => {
    const pasted = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length) {
      e.preventDefault();
      const next = pasted.padEnd(6, ' ').split('').map(ch => (/[0-9]/.test(ch) ? ch : ''));
      setFpOtpDigits(next);
      const focusIdx = Math.min(pasted.length, 5);
      otpRefs[focusIdx].current?.focus();
    }
  };

  return (
    <div style={styles.container} className="login-container">
      {/* Left: Login / Forgot Form */}
      <div style={styles.left} className="login-left">
        <motion.div
          style={styles.card}
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!isForgot ? (
            <>
              <div style={styles.logoWrapper}>
                <img src={logo} alt="Liners" style={styles.logo} />
              </div>
              <h2 style={styles.title} className="login-title">Welcome Back</h2>
              <p style={styles.subtitle}>Sign in to your account</p>

              {error && <div style={styles.error}>{error}</div>}

              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      style={styles.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={styles.showPasswordBtn}
                      tabIndex={-1}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div style={styles.options}>
                  <label style={styles.checkbox}>
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setIsForgot(true); setFpEmail(email); }} style={{ ...styles.link, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Forgot password?</button>
                </div>

                <button
                  type="submit"
                  style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                  className="login-button"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div style={styles.divider}><span>or</span></div>

                <div style={styles.googleContainer}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => setError('Google login failed')}
                  />
                </div>

                <p style={styles.register}>
                  Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <h2 style={styles.title}>Reset Password</h2>
              <p style={styles.subtitle}>Securely reset your password in three steps</p>

              {fpError && <div style={styles.error}>{fpError}</div>}
              {fpMsg && <div style={{ ...styles.error, background: '#001b1b', color: '#43e97b' }}>{fpMsg}</div>}

              {fpStep === 1 && (
                <form onSubmit={requestOTP} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      placeholder="Enter your account email"
                      style={styles.input}
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" style={{ ...styles.button, opacity: fpLoading ? 0.7 : 1 }} disabled={fpLoading}>
                    {fpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button type="button" onClick={() => { setIsForgot(false); setFpStep(1); setFpError(''); setFpMsg(''); }} style={{ ...styles.link, marginTop: 8 }}>Back to Sign in</button>
                </form>
              )}

              {fpStep === 2 && (
                <form onSubmit={verifyOTP} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Enter OTP</label>
                    <div style={{ display: 'flex', gap: 8 }} onPaste={onOtpPaste}>
                      {fpOtpDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          style={{ ...styles.input, width: 48, textAlign: 'center' }}
                          value={d}
                          onChange={(e) => onOtpChange(i, e.target.value.replace(/[^0-9]/g, ''))}
                          onKeyDown={(e) => onOtpKeyDown(i, e)}
                          required
                        />
                      ))}
                    </div>
                  </div>
                  <button type="submit" style={{ ...styles.button, opacity: fpLoading ? 0.7 : 1 }} disabled={fpLoading}>
                    {fpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" onClick={requestOTP} style={{ ...styles.link, marginTop: 8 }}>Resend OTP</button>
                  <button type="button" onClick={() => { setIsForgot(false); setFpStep(1); setFpError(''); setFpMsg(''); }} style={{ ...styles.link, marginTop: 8 }}>Back to Sign in</button>
                </form>
              )}

              {fpStep === 3 && (
                <form onSubmit={resetPassword} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>New Password</label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      style={styles.input}
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      style={styles.input}
                      value={fpConfirm}
                      onChange={(e) => setFpConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" style={{ ...styles.button, opacity: fpLoading ? 0.7 : 1 }} disabled={fpLoading}>
                    {fpLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button type="button" onClick={() => { setIsForgot(false); setFpStep(1); setFpError(''); setFpMsg(''); }} style={{ ...styles.link, marginTop: 8 }}>Back to Sign in</button>
                </form>
              )}
            </>
          )}
        </motion.div>
      </div>
      {/* Right: Spline Viewer (safe) */}
      <div style={styles.right} className="login-right">
        <ErrorBoundary fallback={
          <div style={{ color: '#bbb', textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>3D preview unavailable</div>
            <div style={{ fontSize: 13 }}>WebGL is not supported on this device/browser.</div>
          </div>
        }>
          {webglReady ? (
            <SplineViewer />
          ) : (
            <div style={{ color: '#bbb', textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>3D preview unavailable</div>
              <div style={{ fontSize: 13 }}>Enable hardware acceleration or try another browser.</div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    background: '#000', // Solid black background
    position: 'relative',
    overflow: 'hidden',
    // Responsive: stack vertically on small screens
  },
  left: {
    width: '520px', // Increased width for larger login card
    minWidth: '320px',
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000', // Solid black for left panel
    zIndex: 2,
    boxShadow: '0 0 40px 0 rgba(0,0,0,0.10)',
    backdropFilter: 'blur(2px)',
  },
  right: {
    flex: 2, // Make Spline area visually larger
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    zIndex: 3,
    position: 'relative',
    margin: 'auto',
    marginTop: '5vh',
    background: 'rgba(20, 0, 40, 0.80)', // Increased opacity for readability
    padding: '56px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    color: '#fff',
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'white',
    padding: '6px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
    color: '#fff', // White text
  },
  subtitle: {
    textAlign: 'center',
    color: '#bbb', // Light gray
    marginBottom: '32px',
    fontSize: '16px',
  },
  error: {
    background: '#2d0000',
    color: '#ff6b6b',
    padding: '14px', // Slightly larger
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '15px',
    textAlign: 'center', // Center error text
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    color: '#fff', // White text
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff', // White text
  },
  input: {
    padding: '14px 18px', // Larger for easier use
    background: '#111',
    border: '2px solid #a259f7', // More visible border
    borderRadius: '8px',
    fontSize: '17px',
    outline: 'none',
    color: '#fff',
    transition: 'border-color 0.2s',
  },
  // Add a focus style for input fields
  inputFocus: {
    borderColor: '#fff',
    boxShadow: '0 0 0 2px #a259f7',
  },
  showPasswordBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#a259f7', // Purple accent
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#fff', // White text
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#fff', // White text
  },
  link: {
    color: '#a259f7', // Purple accent
    textDecoration: 'none',
    fontWeight: '500',
  },
  button: {
    padding: '16px', // Larger button
    background: 'linear-gradient(135deg, #6e00ff 0%, #a259f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.2s',
  },
  // Add a hover/focus style for the button
  buttonHover: {
    background: 'linear-gradient(135deg, #a259f7 0%, #6e00ff 100%)',
    transform: 'scale(1.03)',
  },
  divider: {
    textAlign: 'center',
    color: '#bbb', // Light gray
    fontSize: '14px',
    margin: '10px 0',
  },
  googleContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  register: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#bbb', // Light gray
    marginTop: '20px',
  },
};

// Responsive styles using a CSS-in-JS approach
const mobileStyles = `
  @media (max-width: 900px) {
    .login-container {
      flex-direction: column;
    }
    .login-left, .login-right {
      width: 100vw !important;
      min-width: 0 !important;
      max-width: 100vw !important;
      box-shadow: none !important;
    }
    .login-card {
      max-width: 95vw !important;
      padding: 28px !important;
      margin-top: 32px !important;
    }
  }
  @media (max-width: 600px) {
    .login-card {
      max-width: 99vw !important;
      padding: 16px !important;
      font-size: 15px !important;
    }
    .login-title {
      font-size: 22px !important;
    }
    .login-button {
      font-size: 16px !important;
      padding: 12px !important;
    }
  }
`;

// Inject responsive styles into the document head
if (typeof document !== 'undefined' && !document.getElementById('login-mobile-styles')) {
  const style = document.createElement('style');
  style.id = 'login-mobile-styles';
  style.innerHTML = mobileStyles;
  document.head.appendChild(style);
}


export default Login;
