import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './Redux/Store';
import { logout } from './Redux/AuthSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

// Global 401 interceptor — auto-logout when server rejects expired/invalid token
let sessionToastShown = false;
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && store.getState().auth.token) {
      store.dispatch(logout());
      if (!sessionToastShown) {
        sessionToastShown = true;
        toast("Session expired. Please sign in again.", {
          icon: "🔒",
          duration: 4000,
          style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
        });
        setTimeout(() => { sessionToastShown = false; }, 5000);
      }
      window.location.href = "/signin";
    }
    return Promise.reject(err);
  }
);

// Rainbow imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { config } from './Wagmi.config.js';

// Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

// Visual editor bridge — activates only when ?_hedit=1 is present (admin iframe mode)
import { initEditorBridge } from './utils/editorBridge.js';
initEditorBridge();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={config.chains[0]}>
          <Provider store={store}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <Toaster position="top-right" />
              <App />
            </GoogleOAuthProvider>
          </Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);





// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App.jsx';
// import { Provider } from 'react-redux';
// import { store } from './Redux/Store'; // make sure this path is correct
// import { GoogleOAuthProvider } from '@react-oauth/google';


// const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // replace with your client ID

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Provider store={store}>
//       <GoogleOAuthProvider clientId={"338330586933-u9j6r5kre5a8tbht14pp2jokh7d32qi5.apps.googleusercontent.com"}>
//         <App />
//       </GoogleOAuthProvider>
//     </Provider>
//   </StrictMode>
// );