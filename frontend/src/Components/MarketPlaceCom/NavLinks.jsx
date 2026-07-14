import { Search, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LAUNCH_LOCKED } from "../../Config";

const TAB_KEYS = ["overview", "nfa101", "general", "auctions", "trades", "quests", "hire", "bounty"];

// Overview and NFAs/NFCs/NFTs stay readable pre-launch; the transactional
// tabs are locked until launch, and the game tabs are locked until the games
// are ready. Tabs stay clickable — each locked tab shows its own lock sign.
const LAUNCH_LOCKED_TABS = ["general", "auctions", "trades"];
const GAME_LOCKED_TABS   = ["quests", "hire", "bounty"];

function NavLinks({ activeTab, onTabChange, search = "", onSearch, className = "" }) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <ul className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 pr-3" style={{ scrollbarWidth: "none" }}>
        {TAB_KEYS.map((key) => {
          const isActive = activeTab === key;
          const showLock = (LAUNCH_LOCKED && LAUNCH_LOCKED_TABS.includes(key)) || GAME_LOCKED_TABS.includes(key);
          return (
            <li key={key} className="flex-shrink-0">
              <button
                onClick={() => onTabChange?.(key)}
                className="px-3 py-1.5 lg:px-4 rounded-lg font-inter text-xs lg:text-sm transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                style={{
                  background: isActive ? "#002AA8" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? "1px solid rgba(0,80,255,0.3)" : "1px solid transparent",
                }}
              >
                {showLock && <Lock className="w-3 h-3 opacity-60" />}
                {t(`marketplace.tabs.${key}`)}
              </button>
            </li>
          );
        })}
      </ul>

      {onSearch && (
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("marketplace.searchPlaceholder")}
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder-white/30 outline-none w-[140px] lg:w-[180px]"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default NavLinks;
