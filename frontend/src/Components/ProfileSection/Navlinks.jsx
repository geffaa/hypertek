// src/components/NavLinks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";

function NavLinks({ onSelectCategory, selectedCategory, categories, onCategoriesLoaded }) {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [connectedWallet, setConnectedWallet] = useState(null);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  const categoryNameCapitalized = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "Collection";

  const staticTail = [
    { name: "Activities", path: "/Activity" },
    { name: "Listing", path: "/List" },
    { name: "Offer", path: "/offer" },
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
  const categoryTabs = useMemo(() => {
    const ordered = [];

    // user categories first
    userCategories.forEach((cat) => {
      if (!ordered.includes(cat)) ordered.push(cat);
    });

    // then global categories
    globalCategories.forEach((cat) => {
      if (!ordered.includes(cat)) ordered.push(cat);
    });

    return ordered;
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
    <ul className="flex flex-wrap gap-4 px-4 mt-5 lg:gap-[50px]">
      {/* CATEGORY TABS */}
      {categoryTabs.map((cat) => {
        const isActive =
          cat === (selectedCategory || "").toLowerCase().trim();

        return (
          <li key={cat}>
            <button
              onClick={() => {
                navigate("/Profile", { state: { category: cat } });
                onSelectCategory(cat);
              }}
              className={`px-2 py-2 lg:px-[14px] lg:py-[4px]
              rounded-[10px] font-inter text-sm lg:text-[16px]
              transition-colors
              ${isActive
                  ? "bg-[#002AA8] text-white font-semibold"
                  : "text-white hover:bg-white/10 font-medium"
                }`}
            >
              {(() => {
                if (!categories || categories.length === 0) return categoryNameCapitalized(cat);

                const match = categories.find(
                  ([categoryName, items]) => categoryName.toLowerCase().trim() === cat.toLowerCase().trim()
                );

                if (match && match[1]?.length > 0) {
                  const firstItem = match[1][0];
                  return firstItem.parentName || firstItem.collection?.name || categoryNameCapitalized(cat);
                }

                return categoryNameCapitalized(cat);
              })()}   </button>
          </li>
        );
      })}

      {/* STATIC TABS */}
      {staticTail.map((link) => (
        <li key={link.path}>
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              `px-2 py-2 lg:px-[14px] lg:py-[4px]
              rounded-[10px] font-inter text-sm lg:text-[16px]
              transition-colors
              ${isActive
                ? "bg-[#002AA8] text-white font-semibold"
                : "text-white hover:bg-white/10 font-medium"
              }`
            }
          >
            {link.name}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default NavLinks;
