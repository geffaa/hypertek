import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  ledgerWallet,
  phantomWallet,
  okxWallet,
  rabbyWallet,
  binanceWallet,
  uniswapWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig } from 'wagmi';
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

// Explicit, grouped wallet menu so players can bring almost any wallet they
// already own. WalletConnect at the end is the catch-all: any wallet not
// listed can still connect through its QR code.
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, coinbaseWallet, trustWallet, rainbowWallet],
    },
    {
      groupName: 'More wallets',
      wallets: [okxWallet, rabbyWallet, ledgerWallet, phantomWallet, binanceWallet, uniswapWallet, injectedWallet],
    },
    {
      groupName: 'Connect any other wallet',
      wallets: [walletConnectWallet],
    },
  ],
  {
    appName: 'Hyper Tek',
    projectId: walletConnectProjectId,
  }
);

export const config = createConfig({
  connectors,
  chains: [activeChain],
  transports: {
    [activeChain.id]: activeRpc,
  },
  ssr: false,
});
