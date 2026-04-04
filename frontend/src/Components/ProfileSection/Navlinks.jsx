// src/components/NavLinks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";

function NavLinks({ onSelectCategory, selectedCategory, categories, onCategoriesLoaded, showAll, onSelectAll, onSelectStatic, activeStatic }) {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [connectedWallet, setConnectedWallet] = useState(null);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  const categoryNameCapitalized = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "Collection";

  const staticTail = [
    { name: "My Trades" },
    { name: "Activities" },
    { name: "Listing" },
    { name: "My Offers" },
  ];

  // ---------- GLOBAL CATEGORIES ----------
  // ---------- GLOBAL CATEGORIES ----------
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

    return () => {
      window.removeEventListener("categoriesUpdated", handleUpdate);
    };
  }, []);
  // ---------- WALLET ----------
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setConnectedWallet(accounts?.[0]?.toLowerCase() || null);
    };

    window.ethereum
      .request({ method: "eth_accounts" })
      .then(handleAccountsChanged);

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  // ---------- USER OWNED CATEGORIES ----------
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
            if (nft.category)
              cats.add(nft.category.toLowerCase().trim());
          });

          setUserCategories(Array.from(cats));
        }
      } catch (e) {
        console.error("User categories failed", e);
      }
    };

    fetchUserCategories();
  }, [connectedWallet, token]);

  // ---------- FINAL MERGED LINKS (STABLE) ----------
  // Fixed order matching CategoryMarketplace — unknown categories appended at the end
  const CATEGORY_ORDER = [
    "skins",
    "military badges and collectables",
    "specialists",
    "weapons",
    "body armour",
    "spaceships",
    "racing vehicles",
    "artwork",
    "land and bases",
  ];

  const categoryTabs = useMemo(() => {
    // Collect all unique categories from both user and global
    const all = new Set();
    userCategories.forEach((cat) => all.add(cat));
    globalCategories.forEach((cat) => all.add(cat));

    // Sort: known categories in CATEGORY_ORDER first, unknowns appended after
    const known = CATEGORY_ORDER.filter((cat) => all.has(cat));
    const unknown = Array.from(all).filter((cat) => !CATEGORY_ORDER.includes(cat));

    return [...known, ...unknown];
  }, [userCategories, globalCategories]);

  useEffect(() => {
    if (categoryTabs.length > 0) {
      // Tell parent what the categories are
      if (typeof onCategoriesLoaded === "function") {
        onCategoriesLoaded(categoryTabs);
      }
    }
  }, [categoryTabs, onCategoriesLoaded]);

  // ---------- RENDER ----------
  return (
    <ul className="flex overflow-x-auto gap-1 mt-5 pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {/* ALL TAB */}
      {showAll && (
        <li>
          <button
            onClick={() => {
              onSelectAll?.();
              if (typeof onSelectStatic === "function") onSelectStatic("");
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-inter text-sm transition-colors flex-shrink-0 ${
              !selectedCategory && !activeStatic
                ? "bg-[#002AA8] text-white font-semibold"
                : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
            }`}
          >
            All
          </button>
        </li>
      )}
      {/* CATEGORY TABS */}
      {categoryTabs.map((cat) => {
        const isActive =
          !activeStatic && cat === (selectedCategory || "").toLowerCase().trim();

        return (
          <li key={cat}>
            <button
              onClick={() => {
                navigate("/Profile", { state: { category: cat } });
                onSelectCategory(cat);
                if (typeof onSelectStatic === "function") onSelectStatic("");
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-inter text-sm transition-colors flex-shrink-0 ${
                isActive
                  ? "bg-[#002AA8] text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
              }`}
            >
              {categoryNameCapitalized(cat)}
            </button>
          </li>
        );
      })}

      {/* DIVIDER */}
      <li className="flex items-center flex-shrink-0 px-1">
        <span className="w-px h-4 bg-white/15" />
      </li>

      {/* STATIC TABS */}
      {staticTail.map((link) => {
        const isStaticActive = activeStatic === link.name;
        return (
          <li key={link.name} className="flex-shrink-0">
            <button
              onClick={() => {
                if (typeof onSelectStatic === "function") onSelectStatic(link.name);
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-inter text-sm transition-colors block ${
                isStaticActive
                  ? "bg-[#002AA8] text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
              }`}
            >
              {link.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default NavLinks;
