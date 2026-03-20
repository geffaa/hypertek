import { Link } from "react-router-dom";

const LAST_UPDATED = "March 2025";

const SIDEBAR_LINKS = [
  { label: "Terms of Service", href: "/terms",       active: true },
  { label: "Whitepaper",       href: "/whitepapers", active: false },
];

const SECTIONS = [
  { id: "s1",  title: "1. Agreement to Terms" },
  { id: "s2",  title: "2. Privacy Policy" },
  { id: "s3",  title: "3. Changes to Terms or Services" },
  { id: "s4",  title: "4. Who May Use the Services" },
  { id: "s5",  title: "5. The HyperTek Platform" },
  { id: "s6",  title: "6. Digital Assets — NFAs and NFCs" },
  { id: "s7",  title: "7. Marketplace Fees and Royalties" },
  { id: "s8",  title: "8. HyperBucks (HB)" },
  { id: "s9",  title: "9. Wallet and Account Security" },
  { id: "s10", title: "10. Intellectual Property" },
  { id: "s11", title: "11. User Conduct" },
  { id: "s12", title: "12. Third-Party Services" },
  { id: "s13", title: "13. Disclaimers" },
  { id: "s14", title: "14. Limitation of Liability" },
  { id: "s15", title: "15. Indemnification" },
  { id: "s16", title: "16. Termination" },
  { id: "s17", title: "17. Dispute Resolution" },
  { id: "s18", title: "18. Governing Law" },
  { id: "s19", title: "19. General" },
  { id: "s20", title: "20. Contact" },
];

function S({ id, title, children }) {
  return (
    <div id={id} className="mb-10 scroll-mt-24">
      <h2 className="font-semibold text-sm text-white mb-3">{title}</h2>
      <div className="text-white/60 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  const goTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen text-white pt-[72px]">
      <div className="flex max-w-[1200px] mx-auto px-4">

        {/* ── SPACER — reserves space for the fixed sidebar ── */}
        <div className="hidden md:block shrink-0 w-[220px]" />

        {/* ── SIDEBAR — fixed, always visible ── */}
        <aside
          className="hidden md:flex flex-col"
          style={{
            position: "fixed",
            top: 72,
            width: 220,
            height: "calc(100vh - 72px)",
            overflowY: "auto",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            padding: "32px 16px 32px 0",
          }}
        >
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-3">
            Legal
          </p>
          {SIDEBAR_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="block px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors"
              style={{
                background:  l.active ? "rgba(0,42,168,0.35)"        : "transparent",
                color:       l.active ? "#fff"                        : "rgba(255,255,255,0.45)",
                borderLeft:  l.active ? "2px solid #002AA8"           : "2px solid transparent",
              }}
            >
              {l.label}
            </Link>
          ))}

          <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mt-7 mb-2">
            Sections
          </p>
          {SECTIONS.map(({ id, title }) => (
            <button
              key={id}
              onClick={() => goTo(id)}
              className="w-full text-left px-3 py-1.5 rounded text-xs text-white/35 hover:text-white transition-colors"
            >
              {title}
            </button>
          ))}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="px-10 py-10">
          <h1 className="font-bold text-2xl md:text-3xl mb-1">Terms of Service</h1>
          <p className="text-white/35 text-xs mb-8">Last Updated: {LAST_UPDATED}</p>

          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Please read these Terms of Service (the{" "}
            <strong className="text-white/85">"Terms"</strong>) carefully because they govern
            your use of the website and platform located at{" "}
            <span className="text-blue-400">hypertek100.com</span> (the{" "}
            <strong className="text-white/85">"HyperTek Platform"</strong>), a gaming and
            digital asset marketplace that facilitates the creation, purchase, and sale of
            Non-Fungible Assets (NFAs), Non-Fungible Collectibles (NFCs), and in-game
            materials on decentralised blockchain networks. HyperTek is not a bank or
            financial institution and does not provide investment or financial advice.
          </p>

          <div
            className="rounded-xl p-5 mb-10 text-xs leading-relaxed"
            style={{ background: "rgba(0,42,168,0.15)", border: "1px solid rgba(0,42,168,0.3)" }}
          >
            <strong className="text-white block mb-1 uppercase tracking-wider">
              Important Notice Regarding Arbitration
            </strong>
            <span className="text-white/60">
              WHEN YOU AGREE TO THESE TERMS YOU ARE AGREEING (WITH LIMITED EXCEPTION) TO
              RESOLVE ANY DISPUTE BETWEEN YOU AND HYPERTEK THROUGH BINDING, INDIVIDUAL
              ARBITRATION RATHER THAN IN COURT. PLEASE REVIEW SECTION 17 "DISPUTE
              RESOLUTION" BELOW FOR DETAILS.
            </span>
          </div>

          <S id="s1" title="1. Agreement to Terms">
            <p>By using the Services, you agree to be bound by these Terms. If you don't agree, you are not authorised to use the Services.</p>
          </S>

          <S id="s2" title="2. Privacy Policy">
            <p>HyperTek collects and processes personal data in connection with your use of the Services, including account registration information, wallet addresses, and transaction history. This data is used solely to operate the platform and is not sold to third parties. A full Privacy Policy will be published at <span className="text-blue-400">hypertek100.com/privacy</span>.</p>
          </S>

          <S id="s3" title="3. Changes to Terms or Services">
            <p>We may update the Terms from time to time at our sole discretion. We'll let you know by posting the updated Terms on the Site. If you continue to use the Services after updates, it means you accept the changes.</p>
            <p>We may change or discontinue all or any part of the Services at any time and without notice, at our sole discretion.</p>
          </S>

          <S id="s4" title="4. Who May Use the Services">
            <p><strong className="text-white/85">Eligibility.</strong> YOU MAY USE THE SERVICES ONLY IF YOU ARE 18 YEARS OR OLDER AND CAPABLE OF FORMING A BINDING CONTRACT WITH HYPERTEK, AND NOT OTHERWISE BARRED FROM USING THE SERVICES UNDER APPLICABLE LAW.</p>
            <p><strong className="text-white/85">Compliance.</strong> The Services are only available to users in certain jurisdictions. You certify you will comply with all applicable laws. We will not knowingly collect personal information from any user under the age of 13.</p>
          </S>

          <S id="s5" title="5. The HyperTek Platform">
            <p>HyperTek provides a platform through which users may create, list, purchase, and trade digital assets — including NFAs, NFCs, and in-game materials — on the Base blockchain network. HyperTek does not take custody of digital assets on behalf of users; all transactions occur directly between users via smart contracts.</p>
            <p>HyperTek also offers HyperBucks (HB), an in-platform credit system earned through gameplay and redeemable within the HyperTek ecosystem. HyperBucks are not a security, investment product, or currency.</p>
          </S>

          <S id="s6" title="6. Digital Assets — NFAs and NFCs">
            <p><strong className="text-white/85">NFA (Non-Fungible Asset).</strong> An NFA carries a buyback guarantee funded by a 5% contribution from every sale. The minimum buyback reserve accumulates automatically. Sales below an NFA's minimum reserve price are not permitted.</p>
            <p><strong className="text-white/85">NFC (Non-Fungible Collectible).</strong> An NFC is a digital collectible without a buyback guarantee. NFCs may be created by registered users and listed for sale on the HyperTek marketplace.</p>
            <p>Ownership is determined by the blockchain record. HyperTek does not guarantee the value, liquidity, or future utility of any digital asset.</p>
          </S>

          <S id="s7" title="7. Marketplace Fees and Royalties">
            <p>HyperTek charges a platform fee on all completed sales. The fee structure applies uniformly to all sales — there is no preferential first-sale exception.</p>
            <div
              className="rounded-lg overflow-hidden text-xs mt-3"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                    {["Asset Type","Seller","Artist / Creator","Buyback Fund","HyperTek"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-white/50 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["NFA",            "80%", "4%", "5%", "11%"],
                    ["NFC",            "80%", "4%", "—",  "16%"],
                    ["Materials (HB)", "80%", "—",  "—",  "20%"],
                  ].map(([type, ...cols]) => (
                    <tr key={type} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <td className="px-4 py-2.5 text-white/70 font-medium">{type}</td>
                      {cols.map((v, i) => <td key={i} className="px-4 py-2.5 text-white/60">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">Royalties are distributed automatically on-chain (USDC on Base). For artists with bank payment preferences, royalties are held pending and disbursed manually by HyperTek administration.</p>
          </S>

          <S id="s8" title="8. HyperBucks (HB)">
            <p>HyperBucks are in-platform credits earned through gameplay, purchasable, and spendable within the HyperTek ecosystem. HB may be cashed out in USDC or via bank transfer subject to minimum thresholds and fees. HyperTek reserves the right to modify HB earn/cashout rates at any time.</p>
            <p>HyperBucks are not a cryptocurrency, security, or investment instrument.</p>
          </S>

          <S id="s9" title="9. Wallet and Account Security">
            <p>Upon registration, HyperTek generates a wallet on your behalf and delivers an encrypted private key backup to your registered email address. You are solely responsible for the security of your wallet and private key. HyperTek cannot recover your wallet or reset your private key if you lose your credentials. Never share your private key with anyone, including HyperTek staff.</p>
          </S>

          <S id="s10" title="10. Intellectual Property">
            <p>Content submitted to HyperTek must be owned by the submitting party or properly licensed. HyperTek requires a non-exclusive licence to display and distribute it on the platform.</p>
            <p>HyperTek's branding, platform design, and proprietary software are the exclusive property of HyperTek. You may not copy, modify, or distribute HyperTek's intellectual property without express written permission.</p>
          </S>

          <S id="s11" title="11. User Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Use the Services for any illegal purpose or in violation of applicable laws</li>
              <li>Engage in wash trading, price manipulation, or fraudulent listings</li>
              <li>Submit content that infringes third-party intellectual property rights</li>
              <li>Attempt to exploit, hack, or interfere with the platform or its smart contracts</li>
              <li>Create multiple accounts to circumvent bans or restrictions</li>
            </ul>
            <p>HyperTek reserves the right to suspend or terminate accounts that violate these Terms without notice or refund.</p>
          </S>

          <S id="s12" title="12. Third-Party Services">
            <p>The platform integrates with third-party services including blockchain networks (Base), payment processors (Stripe), and wallet providers. These third parties have their own terms and privacy policies. HyperTek is not responsible for the conduct or reliability of third-party services.</p>
          </S>

          <S id="s13" title="13. Disclaimers">
            <p>THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. HYPERTEK DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE. NOTHING ON THE PLATFORM CONSTITUTES FINANCIAL, LEGAL, OR TAX ADVICE.</p>
          </S>

          <S id="s14" title="14. Limitation of Liability">
            <p>TO THE FULLEST EXTENT PERMITTED BY LAW, HYPERTEK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES, INCLUDING LOSSES FROM MARKET VOLATILITY, SMART CONTRACT EXPLOITS, WALLET SECURITY BREACHES, OR THIRD-PARTY SERVICE OUTAGES.</p>
          </S>

          <S id="s15" title="15. Indemnification">
            <p>You agree to indemnify and hold harmless HyperTek and its officers, directors, employees, and agents from any claims, damages, or expenses (including reasonable legal fees) arising from your use of the Services, your breach of these Terms, or your violation of any third-party rights.</p>
          </S>

          <S id="s16" title="16. Termination">
            <p>We may suspend or terminate your access to the Services at any time, with or without cause or notice. Sections relating to intellectual property, disclaimers, limitation of liability, and dispute resolution survive termination.</p>
          </S>

          <S id="s17" title="17. Dispute Resolution">
            <p><strong className="text-white/85">Informal Resolution.</strong> Before filing any formal dispute, you agree to contact HyperTek via the Support channel and attempt to resolve the issue informally for at least 30 days.</p>
            <p><strong className="text-white/85">Binding Arbitration.</strong> If informal resolution fails, any dispute shall be resolved by binding individual arbitration rather than in court, except where prohibited by law.</p>
            <p><strong className="text-white/85">No Class Actions.</strong> You may only bring disputes against HyperTek on an individual basis.</p>
          </S>

          <S id="s18" title="18. Governing Law">
            <p>These Terms are governed by applicable law without regard to conflict-of-law principles. Any disputes not subject to arbitration shall be resolved in the courts of the jurisdiction where HyperTek is incorporated. <em className="text-white/40">[Jurisdiction to be confirmed by HyperTek legal team.]</em></p>
          </S>

          <S id="s19" title="19. General">
            <p>These Terms constitute the entire agreement between you and HyperTek regarding the Services. If any provision is found unenforceable, the remaining provisions continue in full force.</p>
          </S>

          <S id="s20" title="20. Contact">
            <p>For questions about these Terms, contact us through the Support section within your HyperTek account or via our official social channels listed on the Site.</p>
          </S>

          <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white"
              style={{ background: "#002AA8" }}
            >
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
