import { useState, useEffect, useCallback } from 'react';
import { passportInstance } from '../utils/immutablePassport';

export function useImmutableWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Initialize passport and check if user is already logged in
  useEffect(() => {
    const initPassport = async () => {
      try {
        // Only attempt to get user info if we think we might be logged in (stored in local storage by SDK)
        // However, getUserInfo throws if not logged in, so we can wrap it.
        const user = await passportInstance.getUserInfo();
        if (user) {
          setUserInfo(user);
          const passportProvider = await passportInstance.connectEvm();
          setProvider(passportProvider);
          const accounts = await passportProvider.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        }
      } catch (error) {
        // User is not logged in, which is expected on first load
        console.log("Immutable Passport: User not logged in");
      }
    };

    initPassport();
  }, []);

  const connect = useCallback(async () => {
    console.log("🚀 connectImmutable: Starting login flow...");
    setIsConnecting(true);
    try {
      // Login - this might trigger a popup or redirect
      console.log("🚀 Calling passportInstance.login()...");
      const user = await passportInstance.login();
      console.log("✅ Login success, user:", user);
      
      if (user) {
        setUserInfo(user);
        console.log("🚀 Connecting EVM provider...");
        const passportProvider = await passportInstance.connectEvm();
        console.log("🚀 Provider info:", passportProvider);
        
        if (passportProvider && passportProvider.request) {
            console.log("✅ Provider has request method. Setting provider...");
            setProvider(passportProvider);
            const accounts = await passportProvider.request({ method: 'eth_requestAccounts' });
            console.log("✅ Accounts received:", accounts);
            
            if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            }
        } else {
            console.error("❌ Provider is missing or has no request method:", passportProvider);
        }
      }
    } catch (error) {
      console.error("❌ Immutable Passport Login Error:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await passportInstance.logout();
      setAddress(null);
      setIsConnected(false);
      setProvider(null);
      setUserInfo(null);
    } catch (error) {
      console.error("Immutable Passport Logout Error:", error);
    }
  }, []);

  /* ==================== BALANCE LOGIC ==================== */
  const [balance, setBalance] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (provider && address) {
      try {
        const bal = await provider.request({ 
            method: 'eth_getBalance', 
            params: [address, 'latest'] 
        });
        // Convert hex to string first if needed, but usually it's hex wei
        // We can use a simple utility or just parse it.
        // Since we don't have ethers imported here, let's just store it as is or use a lightweight parser if possible.
        // Actually, let's keep it simple: pass the hex to the component or use Number() / 1e18 if precise enough for display.
        // Better: import ethers if this file allows? It uses @imtbl/sdk. 
        // Let's just return the raw hex or import formatting util?
        // Buy1.jsx uses ethers, so let's import ethers here too for standard formatting.
        
        // Wait, I can't easily add import to top without mess.
        // I will just return the hex value and let the UI format it, 
        // OR simpler: just do the math here if it's standard eth.
        setBalance(bal); 
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    }
  }, [provider, address]);

  useEffect(() => {
    if (isConnected) {
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }
  }, [isConnected, fetchBalance]);

  return {
    address,
    isConnected,
    provider,
    isConnecting,
    userInfo,
    balance, // Export balance
    connect,
    logout,
    refreshBalance: fetchBalance
  };
}
