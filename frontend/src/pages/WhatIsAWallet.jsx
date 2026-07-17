import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ShieldCheck, Boxes, Sparkles } from "lucide-react";

/* Our own "What is a Wallet?" explainer. The Connect a Wallet modal's
   built-in copy cannot be reworded, so its Learn More button points here,
   where we control every word and use the correct Hyper Tek terms. */

const CARDS = [
  {
    icon: Wallet,
    accent: "#38bdf8",
    title: "A wallet is your key, not a hard drive",
    body: "Your wallet does not store your artworks inside it like files on a hard drive. It holds the secure keys that prove the items are yours on the blockchain. The items live on the network; the wallet is how you unlock and control them.",
  },
  {
    icon: Sparkles,
    accent: "#22c55e",
    title: "You already have one on Hyper Tek",
    body: "When you sign up, Hyper Tek creates a secure wallet for you automatically. You do not need MetaMask or any other app to buy, hold, or sell. You hold your own keys, and you can export them from your profile at any time.",
  },
  {
    icon: Boxes,
    accent: "#fbbf24",
    title: "What your wallet can hold",
    body: "Your wallet can hold all three Hyper Tek asset types: Non-Fungible Assets (NFAs), Collectibles (NFCs), and Tokens (NFTs). It also holds USDC on the Base network, which is what purchases are made in.",
  },
  {
    icon: ShieldCheck,
    accent: "#a78bfa",
    title: "Bring your own wallet too",
    body: "Already have MetaMask, Coinbase Wallet, Trust, Rainbow, or another wallet? You can connect it to your Hyper Tek account, and anything you buy from it shows up right next to the items in your built-in wallet.",
  },
];

export default function WhatIsAWallet() {
  const navigate = useNavigate();
  const location = useLocation();
  // The connect modal's Learn More opens this page in a new tab, where there
  // is no history to go back to — fall back to the home page in that case.
  const goBack = () => {
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#060610] text-white">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        >
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-blue-400">Hyper Tek Basics</span>
          <h1 className="font-[Goldman] font-bold text-3xl md:text-4xl mt-3 mb-4">What is a Wallet?</h1>
          <p className="text-white/60 text-[15px] leading-relaxed mb-10">
            A crypto wallet sounds complicated, but on Hyper Tek it is simple. Here is what it actually is and how it works for you.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                className="rounded-2xl p-6 flex gap-4 items-start"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${c.accent}` }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${c.accent}1f`, border: `1px solid ${c.accent}55` }}>
                  <Icon size={18} style={{ color: c.accent }} />
                </div>
                <div>
                  <h2 className="text-[16px] md:text-[18px] font-bold mb-1.5" style={{ color: c.accent }}>{c.title}</h2>
                  <p className="text-white/70 text-[14px] leading-relaxed">{c.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => { navigate("/signup"); window.scrollTo(0, 0); }}
            className="px-7 py-3 rounded-xl text-[12px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:brightness-110"
            style={{ background: "#002AA8", fontFamily: "Orbitron, sans-serif" }}
          >
            Create my wallet
          </button>
          <button
            onClick={() => { navigate("/market-place"); window.scrollTo(0, 0); }}
            className="px-7 py-3 rounded-xl text-[12px] font-bold uppercase tracking-[0.12em] transition-all hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.18)", fontFamily: "Orbitron, sans-serif", color: "rgba(255,255,255,0.7)" }}
          >
            Explore the marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
