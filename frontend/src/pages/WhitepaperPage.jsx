import { Link } from "react-router-dom";

function WhitepaperPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-white">
      <div className="max-w-2xl w-full text-center">
        <h1 className="font-inter font-bold text-4xl md:text-5xl mb-4 tracking-tight">
          Whitepaper
        </h1>
        <p className="text-white/60 text-lg mb-10">
          The HyperTek whitepaper is being finalised. Check back soon for the full technical overview, tokenomics, and roadmap.
        </p>

        <div
          className="rounded-2xl p-8 mb-8 text-left"
          style={{
            background: "rgba(0,42,168,0.12)",
            border: "1px solid rgba(0,42,168,0.3)",
          }}
        >
          <h2 className="font-semibold text-xl mb-4 text-white/90">What to expect</h2>
          <ul className="space-y-3 text-white/70 text-sm leading-relaxed">
            <li>• HyperTek ecosystem overview — NFAs, NFCs &amp; Materials</li>
            <li>• HyperBucks (HB) economy — earn, spend &amp; cashout mechanics</li>
            <li>• Buyback guarantee system for NFA holders</li>
            <li>• Smart contract architecture &amp; security audits</li>
            <li>• Roadmap &amp; milestone delivery plan</li>
            <li>• Team &amp; legal structure</li>
          </ul>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200"
          style={{ background: "#002AA8" }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default WhitepaperPage;
