import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './Redux/Store'; // make sure this path is correct
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // replace with your client ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={"338330586933-u9j6r5kre5a8tbht14pp2jokh7d32qi5.apps.googleusercontent.com"}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);
