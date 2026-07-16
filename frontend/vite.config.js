import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    // Precompress build output; nginx serves the .gz/.br files directly.
    compression({ algorithms: ['gzip'], threshold: 1024 }),
    compression({ algorithms: ['brotliCompress'], threshold: 1024 }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return 'react-vendor'
          }
          if (/node_modules\/(wagmi|@wagmi|@rainbow-me|viem|@coinbase|ox)\//.test(id)) {
            return 'wallet'
          }
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) {
            return 'motion'
          }
          return undefined
        },
      },
    },
  },
})
