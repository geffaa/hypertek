// src/components/NavLinks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";
import { useSelector } from "react-redux";

function NavLinks({ onSelectCategory, selectedCategory }) {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [connectedWallet, setConnectedWallet] = useState(null);
  const [globalCategories, setGlobalCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  const staticTail = [
    { name: "Activities", path: "/Activity" },
    { name: "Listing", path: "/List" },
    { name: "Offer", path: "/offer" },
  ];

  // ---------- GLOBAL CATEGORIES ----------
  useEffect(() => {
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

    fetchGlobalCategories();
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
                navigate("/profile");
                onSelectCategory(cat);
              }}
              className={`px-2 py-2 lg:px-[14px] lg:py-[4px]
              rounded-[10px] font-inter text-sm lg:text-[16px]
              transition-colors
              ${
                isActive
                  ? "bg-[#002AA8] text-white font-semibold"
                  : "text-white hover:bg-white/10 font-medium"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
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
              ${
                isActive
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
