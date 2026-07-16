import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from "react-redux";
import { store, persistor } from "./Redux/Store";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import { BACKEND_BASE_URL } from "./Config";

// Every backend call carries the admin JWT; endpoints are admin-protected
// server-side, so requests without it now fail with 401/403.
axios.interceptors.request.use((config) => {
  if ((config.url || "").startsWith(BACKEND_BASE_URL)) {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const rawFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  if (typeof input === "string" && input.startsWith(BACKEND_BASE_URL)) {
    const token = localStorage.getItem("token");
    if (token) {
      const headers = new Headers(init.headers || {});
      if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
      init = { ...init, headers };
    }
  }
  return rawFetch(input, init);
};

// Web3 & RainbowKit Imports
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { base, baseSepolia } from 'wagmi/chains';

const chainId = parseInt(import.meta.env.VITE_CHAIN_ID || '84532');
const activeChain = chainId === 8453 ? base : baseSepolia;

const wagmiConfig = getDefaultConfig({
  appName: 'HyperTek Admin Dashboard',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder-set-vite-walletconnect-project-id',
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
