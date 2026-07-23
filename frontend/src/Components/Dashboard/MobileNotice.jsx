/**
 * MobileNotice — the dashboard is a desktop and tablet tool by design, so on
 * phone width screens we block it entirely behind a full screen notice asking
 * the user to open it on a larger device, rather than serve a broken, cramped
 * layout. Hidden from md up, so tablets and desktops render the dashboard.
 */
import { Link } from "react-router-dom";
import { MonitorSmartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MobileNotice() {
  const { t } = useTranslation();

  return (
    <div
      className="md:hidden fixed inset-0 z-[100] flex flex-col items-center justify-center text-center px-8"
      style={{ background: "rgba(6,6,16,0.98)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="flex items-center justify-center w-20 h-20 rounded-2xl mb-7"
        style={{ background: "rgba(0,42,168,0.18)", border: "1px solid rgba(0,80,255,0.35)" }}
      >
        <MonitorSmartphone className="w-9 h-9 text-blue-300" />
      </div>

      <h2 className="text-white font-[Goldman] font-bold text-xl mb-3 leading-snug">
        {t("dashboard.mobileNotice.title", "Best viewed on a larger screen")}
      </h2>

      <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-8">
        {t(
          "dashboard.mobileNotice.desc",
          "The dashboard is designed for tablet and desktop. Please open it on a tablet or computer to use all of its features.",
        )}
      </p>

      <Link
        to="/"
        className="px-6 py-2.5 rounded-lg bg-[#002AA8] hover:bg-[#003BD4] text-white font-semibold text-sm transition-colors border border-white/15"
      >
        {t("dashboard.mobileNotice.backHome", "Back to Home")}
      </Link>
    </div>
  );
}
