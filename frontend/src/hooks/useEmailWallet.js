import { useGlobalEmailWallet } from '../context/EmailWalletContext';

export const useEmailWallet = () => {
  return useGlobalEmailWallet() || {};
};
