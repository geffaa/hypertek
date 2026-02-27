import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";

function NavLinks({ className = "" }) {
  const [links, setLinks] = useState([
    { name: "Overview", path: "/market-place" },
    { name: "Activities", path: "/personal-activity" },
  ]);
  const [loading, setLoading] = useState(true);

  // ✅ move fetchCategories outside useEffect so we can call it on event too
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
      const parents = res.data.collections || res.data.nfts || [];

      const dynamicLinks = parents.map((parent) => ({
        name:
          parent.parentName ||
          parent.collection?.name ||
          (parent.category
            ? parent.category.charAt(0).toUpperCase() + parent.category.slice(1)
            : "Collection"),
        path: `/collections/${(parent.category || "").toLowerCase().trim()}`,
      }));

      setLinks([
        { name: "Overview", path: "/market-place" },
        ...dynamicLinks,
        { name: "Activities", path: "/personal-activity" },
      ]);
    } catch (err) {
      console.error("Failed to fetch categories for navbar:", err);
      setLinks([
        { name: "Overview", path: "/market-place" },
        { name: "Collectibles", path: "/nfa-expand" },
        { name: "Lands", path: "/land" },
        { name: "Activities", path: "/personal-activity" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initially
    fetchCategories();

    // ✅ Listen to global update events
    const handleUpdate = () => fetchCategories();
    window.addEventListener("categoriesUpdated", handleUpdate);

    return () => {
      window.removeEventListener("categoriesUpdated", handleUpdate);
    };
  }, []);

  if (loading) return null; // optional: show skeleton

  return (
    <ul className={`flex flex-wrap gap-4 lg:gap-8 justify-start items-center ${className}`}>
      {links.map((link, i) => (
        <li key={i}>
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              `px-1 py-2 lg:px-[14px] lg:py-[4px] rounded-[10px] font-inter text-sm lg:text-[16px] 
              transition-colors ${isActive
                ? " bg-[#002AA8] text-white font-semibold"
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