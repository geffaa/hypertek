import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Hyper-Tek Game Marketplace',
  projectId: '7e0cd9b7bbfcc58fa687ceca07852807', // WalletConnect Project ID
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http('https://base-sepolia-rpc.publicnode.com'),
    [base.id]: http(),
  },
  ssr: false,
});