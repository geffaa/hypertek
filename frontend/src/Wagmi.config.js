import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { immutableZkEvmTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

const customImmutableTestnet = {
  ...immutableZkEvmTestnet,
  id: 13473,
  name: 'Immutable Testnet',
  iconUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-immutable-x-logo-icon-download-in-svg-png-gif-file-formats--crypto-cryptocurrency-logos-pack-icons-6297155.png?f=webp&w=256', // Optional: recognizable icon
  iconBackground: '#fff',
  nativeCurrency: { name: 'IMX', symbol: 'IMX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.immutable.com'] },
  },
  blockExplorers: {
    default: { name: 'Immutable Explorer', url: 'https://explorer.testnet.immutable.com' },
  },
};

export const config = getDefaultConfig({
  appName: 'NFT Marketplace',
  projectId: '7e0cd9b7bbfcc58fa687ceca07852807', // WalletConnect Project ID
  chains: [customImmutableTestnet],
  transports: {
    [customImmutableTestnet.id]: http(),
  },
  ssr: false,
});