// src/components/NavLinks.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { name: "Overview", path: "/market-place" },
  { name: "Collectibles", path: "/nfa-expand" },
  { name: "Lands", path: "/land" },
  { name: "Activities", path: "/personal-activity" },
];

function NavLinks() {
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
