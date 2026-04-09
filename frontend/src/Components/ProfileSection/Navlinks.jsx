// src/Components/ProfileSection/Navlinks.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";

export const MAJOR_TABS = [
  "My Collectibles",
  "Listings",
  "Activities",
  "My Offerings",
  "Questing",
  "Bounty",
];

const CATEGORY_ORDER = [
  "skins",
  "military badges",
  "specialists",
  "weapons",
  "body armour",
  "spaceships",
  "racing vehicles",
  "artwork",
  "land and bases",
  "general",
];

// Display name overrides — normalises any DB variant to a clean label
const DISPLAY_NAMES = {
  "military badges and collectables": "Military Badges",
  "military badges":                  "Military Badges",
  "racing vehicles":                  "Racing Vehicles",
  "land and bases":                   "Land and Bases",
  "land/bases":                       "Land and Bases",
};

function NavLinks({
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  onCategoriesLoaded,
}) {
  const { token } = useSelector((state) => state.auth);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [userCategories, setUserCategories] = useState([]);

  // ── Global categories ──────────────────────────────────────────────────────
  const fetchGlobalCategories = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/v1/nft/parent-collections`
      );
      if (res.data?.success && Array.isArray(res.data.collections)) {
        const cats = new Set();
        res.data.collections.forEach((c) => {
          if (c.category) cats.add(c.category.toLowerCase().trim());
        });
        setGlobalCategories(Array.from(cats));
      }
    } catch (e) {
      console.warn("Global categories failed", e);
    }
  };

  useEffect(() => {
    fetchGlobalCategories();
    const handleUpdate = () => fetchGlobalCategories();
    window.addEventListener("categoriesUpdated", handleUpdate);
    return () => window.removeEventListener("categoriesUpdated", handleUpdate);
  }, []);

  // ── Wallet ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      setConnectedWallet(accounts?.[0]?.toLowerCase() || null);
    };
    window.ethereum.request({ method: "eth_accounts" }).then(handleAccountsChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () =>
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  // ── User owned categories ──────────────────────────────────────────────────
  useEffect(() => {
    if (!connectedWallet || !token) return;
    const fetchUserCategories = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_BASE_URL}/api/v1/nft/user/owned-with-subs/${connectedWallet}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success && res.data.nfts) {
          const cats = new Set();
          res.data.nfts.forEach((nft) => {
            if (nft.category) cats.add(nft.category.toLowerCase().trim());
          });
          setUserCategories(Array.from(cats));
        }
      } catch (e) {
        console.error("User categories failed", e);
      }
    };
    fetchUserCategories();
  }, [connectedWallet, token]);

  const cap = (str) =>
    DISPLAY_NAMES[str?.toLowerCase()] ||
    (str ? str.charAt(0).toUpperCase() + str.slice(1) : "Collection");

  // ── Merged + sorted category list (deduplicated by display name) ──────────
  const categoryTabs = useMemo(() => {
    const all = new Set();
    userCategories.forEach((cat) => all.add(cat));
    globalCategories.forEach((cat) => all.add(cat));
    const known = CATEGORY_ORDER.filter((cat) => all.has(cat));
    const unknown = Array.from(all).filter((cat) => !CATEGORY_ORDER.includes(cat));
    const merged = [...known, ...unknown];

    // Deduplicate: if two keys share the same display label, keep only the first
    const seenLabels = new Set();
    return merged.filter((cat) => {
      const label = DISPLAY_NAMES[cat] || cap(cat);
      if (seenLabels.has(label)) return false;
      seenLabels.add(label);
      return true;
    });
  }, [userCategories, globalCategories]);

  useEffect(() => {
    if (categoryTabs.length > 0 && typeof onCategoriesLoaded === "function") {
      onCategoriesLoaded(categoryTabs);
    }
  }, [categoryTabs, onCategoriesLoaded]);

  return (
    <div className="flex flex-col gap-0.5">
      {/* ── Level 1: Major tabs ──────────────────────────────────────────── */}
      <ul
        className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {MAJOR_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <li key={tab} className="flex-shrink-0">
              <button
                onClick={() => onTabChange?.(tab)}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg font-inter text-sm transition-colors"
                style={{
                  background: isActive ? "#002AA8" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  fontWeight: isActive ? 600 : 500,
                  border: isActive
                    ? "1px solid rgba(0,80,255,0.3)"
                    : "1px solid transparent",
                }}
              >
                {tab}
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── Level 2: Category sub-filter (My Collectibles only) ─────────── */}
      {activeTab === "My Collectibles" && (
        <ul
          className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {/* ALL */}
          <li className="flex-shrink-0">
            <button
              onClick={() => onCategoryChange?.("")}
              className="whitespace-nowrap px-3 py-1 rounded-md font-inter text-xs transition-colors"
              style={{
                background: !activeCategory
                  ? "rgba(255,255,255,0.10)"
                  : "transparent",
                color: !activeCategory ? "#fff" : "rgba(255,255,255,0.45)",
                fontWeight: !activeCategory ? 600 : 400,
              }}
            >
              All
            </button>
          </li>

          {categoryTabs.map((cat) => {
            const isActive =
              cat === (activeCategory || "").toLowerCase().trim();
            return (
              <li key={cat} className="flex-shrink-0">
                <button
                  onClick={() => onCategoryChange?.(cat)}
                  className="whitespace-nowrap px-3 py-1 rounded-md font-inter text-xs transition-colors"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.10)"
                      : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {cap(cat)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default NavLinks;
