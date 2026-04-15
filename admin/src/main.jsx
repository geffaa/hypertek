import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from "react-redux";
import { store, persistor } from "./Redux/Store";
import { PersistGate } from "redux-persist/integration/react";

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
  projectId: '298db395e54d6f83652ce8a16db3ac79',
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
