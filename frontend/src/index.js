import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log("DEBUG: Env Var Type:", typeof process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log("DEBUG: Env Var Value:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>
);
