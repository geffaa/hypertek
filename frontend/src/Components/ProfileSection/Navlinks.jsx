// src/components/NavLinks.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { name: "Collectible", path: "/Profile" },
  { name: "Land", path: "/Lands" },
  { name: "Activities", path: "/Activity" },
  { name: "Listing", path: "/List" },
];

function NavLinks() {
  return (
    <ul className="flex flex-wrap gap-4 md:px-8 px-4 mt-12 lg:gap-[50px] justify-center lg:justify-start">
      {links.map((link, i) => (
        <li key={i}>
          <NavLink
            to={link.path}
            className={({ isActive }) =>
              `px-2 md:px-4 py-2 lg:px-[14px] lg:py-[4px] rounded-[10px] font-inter text-sm lg:text-[16px] 
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
