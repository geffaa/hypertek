import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './Redux/Store';

// Rainbow imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { config } from './Wagmi.config.js';

// Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

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