import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const chainId = Number(import.meta.env.VITE_CHAIN_ID) || 8453;
const activeChain = chainId === 84532 ? baseSepolia : base;
const activeRpc = chainId === 84532
  ? http('https://base-sepolia-rpc.publicnode.com')
  : http();

// WalletConnect Cloud (Reown) project ID. Must be OUR project, never the old
// developers' one: whoever owns the ID sees connection analytics and can
// revoke it. Injected wallets (MetaMask/Coinbase extensions) work even
// without it; the ID is needed for WalletConnect/mobile-QR connections.
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder-set-vite-walletconnect-project-id';

export const config = getDefaultConfig({
  appName: 'Hyper-Tek Game Marketplace',
  projectId: walletConnectProjectId,
  chains: [activeChain],
  transports: {
    [activeChain.id]: activeRpc,
  },
  ssr: false,
});