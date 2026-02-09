// src/components/NavLinks.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config";

function NavLinks() {
  const [links, setLinks] = useState([
    { name: "Overview", path: "/market-place" },
    { name: "Activities", path: "/personal-activity" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/v1/nft/parent-collections`);
        const parents = res.data.collections || res.data.nfts || [];

        // Extract unique categories from parent collections
        const categories = Array.from(
          new Set(parents.map((p) => (p.category || "").toLowerCase().trim()).filter(Boolean))
        );

        // Build dynamic links for each category
        const dynamicLinks = categories.map((cat) => ({
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          path: `/collections/${cat}`,
        }));

        // Combine Overview, dynamic categories, and Activities
        setLinks([
          { name: "Overview", path: "/market-place" },
          ...dynamicLinks,
          { name: "Activities", path: "/personal-activity" },
        ]);
      } catch (err) {
        console.error("Failed to fetch categories for navbar:", err);
        // Fallback to static links if fetch fails
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

    fetchCategories();
  }, []);

  return (
    <ul className="flex flex-wrap gap-4 lg:gap-[50px] md:justify-center lg:justify-start">
      {links.map((link, i) => (
        <li key={i}>
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              `px-1 md:ml-0  py-2 lg:px-[14px] lg:py-[4px] rounded-[10px] font-inter text-sm lg:text-[16px] 
              transition-colors ${
                isActive
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
