import React, { useState } from 'react';
import { passportInstance } from '../utils/immutablePassport';

export default function DebugImmutable() {
  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${msg}`;
    console.log(formatted);
    setLogs(prev => [...prev, formatted]);
  };

  const handleLogin = async () => {
    alert("Button Clicked!"); // Force feedback
    setStatus("Logging in...");
    addLog("🚀 Starting login flow...");
    try {
      if (!passportInstance) {
        alert("Passport Instance is MISSING");
        addLog("❌ Error: passportInstance is undefined!");
        setStatus("Error: Instance missing");
        return;
      }
      
      addLog("--> Calling passport.login()");
      console.log("Calling passport.login()...");
      const user = await passportInstance.login();
      alert("Login method returned!"); // Check if promise resolves
      console.log("Login returned:", user);
      addLog(`✅ Login resolved. User: ${JSON.stringify(user)}`);
      
      if (user) {
        setUserInfo(user);
        setStatus("Logged In!");
        
        addLog("--> Connecting EVM");
        const provider = await passportInstance.connectEvm();
        console.log("FULL PROVIDER OBJECT:", provider);
        
        if (provider) {
             const keys = Object.keys(provider);
             const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(provider));
             addLog(`--> Provider Keys: ${keys.join(", ")}`);
             addLog(`--> Provider Methods: ${methods.join(", ")}`);
             
             if (typeof provider.request === 'function') {
                 addLog("--> Requesting Accounts");
                 const accounts = await provider.request({ method: 'eth_requestAccounts' });
                 addLog(`✅ Accounts: ${accounts}`);
             } else {
                 addLog("❌ ERROR: provider.request is not a function");
                 // Try to fallback or find alternative
                 if (typeof provider.send === 'function') addLog("--> Found 'send' method");
                 if (typeof provider.sendAsync === 'function') addLog("--> Found 'sendAsync' method");
             }
        }
      } else {
        setStatus("Login returned null");
      }
    } catch (err) {
      addLog(`❌ ERROR: ${err.message}`);
      console.error(err);
      setStatus("Error caught");
    }
  };

  const handleLogout = async () => {
      addLog("--> Logging out");
      await passportInstance.logout();
      setUserInfo(null);
      setStatus("Logged out");
      addLog("✅ Logged out");
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white p-10 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Immutable Debugger</h1>
      
      <div className="flex gap-4">
        <button 
            onClick={handleLogin}
            className="bg-blue-600 px-6 py-3 rounded font-bold hover:bg-blue-500"
        >
            Login
        </button>
        <button 
            onClick={handleLogout}
            className="bg-red-600 px-6 py-3 rounded font-bold hover:bg-red-500"
        >
            Logout
        </button>
      </div>

      <div className="text-xl">
        Status: <span className="font-mono text-yellow-400">{status}</span>
      </div>
      
      {userInfo && (
        <div className="bg-green-900/30 p-4 rounded border border-green-500/50">
            <h3 className="font-bold">User Info:</h3>
            <pre className="text-sm">{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}

      <div className="bg-black/50 p-4 rounded h-96 overflow-auto font-mono text-sm border border-white/10">
        {logs.map((log, i) => (
            <div key={i} className="border-b border-white/5 py-1">{log}</div>
        ))}
      </div>
    </div>
  );
}
