import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import SearchImage from "../../assets/search.png";
import { BACKEND_BASE_URL } from "../../Config";

function Transactions() {
  const { user, token } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");

  const wallet = user?.WalletAddress || user?.MetaMaskAddress || "";

  useEffect(() => {
    if (!wallet) { setLoading(false); return; }
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/transactions/${encodeURIComponent(wallet)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(res.data.transactions || []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [wallet]);

  const filtered = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      (tx.txHash || "").toLowerCase().includes(q) ||
      (tx.itemName || "").toLowerCase().includes(q) ||
      (tx.buyer || "").toLowerCase().includes(q) ||
      (tx.seller || "").toLowerCase().includes(q)
    );
  });

  const shortHash = (hash) => hash ? `${hash.slice(0, 14)}....` : "—";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="w-full flex flex-col relative z-10">
      {/* Header */}
      <div className="w-full max-w-[426px] z-10 relative">
        <h1 className="font-inter font-semibold text-[22px] md:text-[25px] text-white mb-6">
          Transaction History
        </h1>

        {/* Search Box */}
        <div className="flex items-center w-full h-[43px] rounded-md gap-[15px] px-4 md:px-6 bg-[#FFFFFF1C] backdrop-blur-sm">
          <img src={SearchImage} alt="search" className="w-[16px] h-[16px] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by item, tx hash, wallet..."
            className="w-full bg-transparent border-none outline-none text-white font-inter font-medium text-[14px]"
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-8 space-y-4 z-10 relative">
        {loading ? (
          <p className="text-white/50 text-sm text-center py-12">Loading transactions...</p>
        ) : !wallet ? (
          <p className="text-white/50 text-sm text-center py-12">Connect your wallet to see your transaction history.</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/50 text-sm text-center py-12">
            {searchTerm ? `No transactions found matching "${searchTerm}"` : "No transactions yet."}
          </p>
        ) : (
          filtered.map((tx, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-start md:items-center w-full max-w-[954px] gap-4 p-4 md:p-0 bg-white/5 md:bg-transparent rounded-lg"
            >
              {/* Left — tx hash + date */}
              <div className="flex items-center gap-3 w-full md:w-[209px]">
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: "48px", height: "49px", background: tx.type === "buy" ? "#1a3a1a" : "#2a1a2a" }}
                >
                  <p className="text-sm font-bold" style={{ color: tx.type === "buy" ? "#4ade80" : "#c084fc" }}>
                    {tx.type === "buy" ? "BUY" : "SELL"}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {tx.txHash ? (
                    <a
                      href={`https://basescan.org/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-inter font-normal text-[14px] text-blue-400 hover:text-blue-300 underline m-0"
                    >
                      {shortHash(tx.txHash)}
                    </a>
                  ) : (
                    <span className="font-inter font-normal text-[14px] text-white/50">{tx.itemName}</span>
                  )}
                  <p className="font-inter font-normal text-[14px] text-white/50 m-0">{formatDate(tx.createdAt)}</p>
                </div>
              </div>

              {/* Center — item name + collection */}
              <div className="flex-1 w-full overflow-hidden">
                <p className="font-inter font-normal text-[14px] text-white/70 m-0 truncate">{tx.itemName}</p>
                <p className="font-inter font-normal text-[12px] text-white/40 m-0 truncate">{tx.collectionName}</p>
              </div>

              {/* Right — price */}
              <div className="w-full md:w-auto flex justify-between md:block">
                <span className="md:hidden text-white/50 text-[14px]">Amount:</span>
                <p className="font-inter font-normal text-[14px] text-white/70 m-0">
                  {tx.priceETH != null ? `${tx.priceETH} USDC` : "—"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Transactions;
