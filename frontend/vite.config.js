import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Wallet / Web3 — large, rarely changes
            if (id.includes('wagmi') || id.includes('viem') || id.includes('rainbowkit') || id.includes('walletconnect') || id.includes('@rainbow-me')) {
              return 'vendor-web3';
            }
            // MetaMask SDK
            if (id.includes('metamask') || id.includes('@metamask')) {
              return 'vendor-metamask';
            }
            // Animation
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // React core
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Everything else in node_modules
            return 'vendor';
          }
        },
      },
    },
  },
})
