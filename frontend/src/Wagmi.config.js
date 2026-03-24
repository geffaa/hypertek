import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 8453;
const activeChain = chainId === 84532 ? baseSepolia : base;
const activeRpc = chainId === 84532
  ? http('https://base-sepolia-rpc.publicnode.com')
  : http();

export const config = getDefaultConfig({
  appName: 'Hyper-Tek Game Marketplace',
  projectId: '7e0cd9b7bbfcc58fa687ceca07852807',
  chains: [activeChain],
  transports: {
    [activeChain.id]: activeRpc,
  },
  ssr: false,
});