import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, immutableZkEvmTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'NFT Marketplace',
  projectId: '7e0cd9b7bbfcc58fa687ceca07852807', // WalletConnect Project ID
  chains: [sepolia, immutableZkEvmTestnet],
  transports: {
    [sepolia.id]: http(),
    [immutableZkEvmTestnet.id]: http(),
  },
  ssr: false,
});