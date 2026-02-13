import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'NFT Marketplace',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // https://cloud.walletconnect.com se free ID lein
  chains: [
    sepolia, // Testnet for development
    // mainnet, // Uncomment for production
  ],
  ssr: false, // Client-side only
});

// IMPORTANT: 
// WalletConnect Project ID banana hai:
// 1. https://cloud.walletconnect.com par jao
// 2. Sign up karein (free hai)
// 3. New Project banao
// 4. Project ID copy karo
// 5. Upar 'YOUR_WALLETCONNECT_PROJECT_ID' replace karo