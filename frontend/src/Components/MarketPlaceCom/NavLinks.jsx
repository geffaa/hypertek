import { Search } from "lucide-react";

// Fixed tabs per Don's brief
// (no dynamic links from parent-collections anymore)
const TABS = [
  { key: "overview",  label: "Overview"         },
  { key: "nfa101",    label: "NFAs / NFTs"       },
  { key: "general",   label: "The Marketplace"   },
  { key: "auctions",  label: "Auctions"          },
  { key: "quests",    label: "Quests / Trades"   },
  { key: "hire",      label: "For Hire"          },
  { key: "bounty",    label: "Bounty"            },
  { key: "mymarket",  label: "My Collections"    },
];

// Props: activeTab, onTabChange, search, onSearch
function NavLinks({ activeTab, onTabChange, search = "", onSearch, className = "" }) {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      {/* Scrollable tab list */}
      <ul className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 pr-3" style={{ scrollbarWidth: "none" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <li key={tab.key} className="flex-shrink-0">
              <button
                onClick={() => onTabChange?.(tab.key)}
                className="px-3 py-1.5 lg:px-4 rounded-lg font-inter text-xs lg:text-sm transition-colors whitespace-nowrap"
                style={{
                  background: isActive ? "#002AA8" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? "1px solid rgba(0,80,255,0.3)" : "1px solid transparent",
                }}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Search bar */}
      {onSearch && (
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
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
