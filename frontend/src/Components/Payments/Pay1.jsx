import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowLeft, FiChevronDown, FiClock, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { getImageUrl, BACKEND_BASE_URL, PURCHASES_LOCKED } from "../../Config";

function Pay1({ item }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const EXPIRY_OPTIONS = [
    t("makeOffer.expiry.6h",    "6 Hours"),
    t("makeOffer.expiry.12h",   "12 Hours"),
    t("makeOffer.expiry.1d",    "1 Day"),
    t("makeOffer.expiry.3d",    "3 Days"),
    t("makeOffer.expiry.7d",    "7 Days"),
    t("makeOffer.expiry.1mo",   "1 Month"),
  ];

  const [price, setPrice]       = useState("");
  const [selected, setSelected] = useState(EXPIRY_OPTIONS[0]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parsedPrice = price ? parseFloat(price) : 0;
  const totalPay = parsedPrice > 0 ? parsedPrice : null;
  const displayPay = totalPay
    ? (totalPay >= 0.01 ? totalPay.toFixed(2) : totalPay.toFixed(6).replace(/\.?0+$/, ""))
    : null;

  const handleSubmit = async () => {
    if (PURCHASES_LOCKED) {
      toast.error(t("marketplace.launchLock.purchasesNote", "Purchases open at official launch"));
      return;
    }
    if (!totalPay) return;

    if (!user) {
      toast.error(t("makeOffer.error.loginRequired", "Please log in to make an offer"));
      return;
    }

    const resolvedUserName  = user.FullName || user.UserName || user.username || user.name || user.Email || "Anonymous";
    const resolvedUserEmail = user.Email || user.email || `user-${user.id}@hyperteks.app`;
    const resolvedPrice     = parseFloat(item?.priceETH) > 0 ? parseFloat(item.priceETH) : 0.01;

    const payload = {
      serialNumber:    `OFFER-${Date.now()}`,
      gameId:          String(item?._id || ""),
      gameTitle:       item?.name || "NFT Item",
      gameActualPrice: resolvedPrice,
      offerPrice:      parseFloat(totalPay),
      priceDuration:   selected,
      userId:          user.id || user._id,
      userName:        resolvedUserName,
      userEmail:       resolvedUserEmail,
      ownerId:         item?.owner || "platform",
      ownerName:       "Platform",
      ownerEmail:      "",
    };

    console.log("[Offer] payload:", payload);

    setLoading(true);
    try {
      await axios.post(
        `${BACKEND_BASE_URL}/api/v1/offer/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || t("makeOffer.error.submitFailed", "Failed to submit offer. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white pb-16">
      <div className="px-4 pt-20 pb-16 max-w-xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm"
      >
        <FiArrowLeft size={16} /> {t("makeOffer.back", "Back")}
      </button>

      {/* Item preview */}
      {item && (
        <div className="flex items-center gap-4 p-4 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            style={{ background: "rgba(13,22,50,0.8)" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{item.name || "NFT Item"}</p>
            <p className="text-white/40 text-sm truncate">{item.description || ""}</p>
            {item.priceETH && (
              <p className="text-white/30 text-xs mt-0.5">
                {t("makeOffer.floor", "Floor")}: {item.priceETH} USDC
              </p>
            )}
          </div>
        </div>
      )}

      <h1 className="text-xl font-bold text-white mb-6">{t("makeOffer.title", "Make an Offer")}</h1>

      <div className="flex flex-col gap-5">

        {/* Price input */}
        <div>
          <label className="text-white/60 text-sm font-medium block mb-2">
            {t("makeOffer.yourOffer", "Your Offer (USDC)")}
          </label>
          <div className="flex h-12 rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent px-4 text-white text-lg font-semibold outline-none placeholder-white/20"
            />
            <span className="flex items-center pr-4 gap-1.5">
              <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4 opacity-60" />
              <span className="text-white/40 text-sm font-medium">USDC</span>
            </span>
          </div>
        </div>

        {/* Expiry */}
        <div>
          <label className="text-white/60 text-sm font-medium block mb-2">
            <FiClock className="inline mr-1.5" size={12} />
            {t("makeOffer.expiresIn", "Offer Expires In")}
          </label>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="w-full h-12 px-4 rounded-xl flex items-center justify-between text-white text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span>{selected}</span>
              <FiChevronDown
                size={14}
                className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <ul className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "#0f0f2a", border: "1px solid rgba(255,255,255,0.12)" }}>
                {EXPIRY_OPTIONS.map((opt) => (
                  <li
                    key={opt}
                    onClick={() => { setSelected(opt); setOpen(false); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      selected === opt
                        ? "bg-blue-600/30 text-white font-medium"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between py-3 border-t border-white/5">
          <span className="text-white/50 text-sm">{t("makeOffer.youPay", "You Pay")}</span>
          <span className="text-white font-semibold">
            {displayPay ? `${displayPay} USDC` : "— USDC"}
          </span>
        </div>

        {/* Submit */}
        <button
          disabled={!totalPay || loading}
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: totalPay
              ? "linear-gradient(180deg, #002AA8 0%, #001142 100%)"
              : "rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,80,255,0.3)",
          }}
        >
          {loading ? t("makeOffer.submitting", "Submitting...") : t("makeOffer.submit", "Submit Offer")}
        </button>

        <p className="text-white/25 text-xs text-center leading-relaxed">
          {t("makeOffer.terms", "By submitting this offer, you agree to Hyper Tek's Terms of Service.")}
        </p>
      </div>

      {/* ── Success Modal ── */}
      {success && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <div
            className="bg-[#0f0f2a] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-5 text-center"
            style={{ animation: "scaleIn 0.25s ease" }}
          >
            {/* Animated check */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.4)" }}>
              <FiCheck size={32} className="text-green-400" strokeWidth={3} />
            </div>

            <div>
              <h2 className="text-white text-lg font-bold mb-1">
                {t("makeOffer.success.title", "Offer Submitted!")}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {t("makeOffer.success.desc", "Your offer of {{price}} USDC for {{name}} has been sent to the owner.", {
                  price: displayPay,
                  name: item?.name,
                })}
              </p>
              <p className="text-white/30 text-xs mt-2">
                {t("makeOffer.success.expires", "Expires in {{duration}}", { duration: selected })}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => navigate(-2)}
                className="w-full h-10 rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)", border: "1px solid rgba(0,80,255,0.3)" }}
              >
                {t("makeOffer.success.backToNft", "Back to NFT")}
              </button>
              <button
                onClick={() => navigate("/market-place")}
                className="w-full h-10 rounded-xl text-white/50 hover:text-white text-sm transition-colors"
              >
                {t("makeOffer.success.goToMarketplace", "Go to Marketplace")}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn  { from { opacity: 0 }             to { opacity: 1 } }
            @keyframes scaleIn { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}
      </div>
    </div>
  );
}

export default Pay1;
