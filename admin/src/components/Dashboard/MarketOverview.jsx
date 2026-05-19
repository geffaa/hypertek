import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const QUICK_ACTIONS = [
  {
    id: "users",
    label: "Manage Users",
    description: "View & edit user accounts",
    path: "/users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20H7m10 0a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v10a3 3 0 003 3m10 0H7m5-14v14" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292" />
      </svg>
    ),
  },
  {
    id: "create",
    label: "Create Item",
    description: "Mint new NFT / NFA asset",
    path: "/create-collection",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: "items",
    label: "Items",
    description: "Browse all platform items",
    path: "/items",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: "market",
    label: "Market Listings",
    description: "Items listed for sale",
    path: "/collection-listed-sale",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    description: "All platform transactions",
    path: "/transactions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: "news",
    label: "News Management",
    description: "Publish & manage news posts",
    path: "/other-news",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    id: "support",
    label: "Support",
    description: "Handle user support tickets",
    path: "/support",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: "royalty",
    label: "Royalty Payouts",
    description: "Manage creator royalties",
    path: "/royalty-payouts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "buyback",
    label: "Buyback Approval",
    description: "Review buyback requests",
    path: "/buyback-approval",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "cpi",
    label: "CPI Adjustment",
    description: "Adjust in-game price index",
    path: "/cpi-adjustment",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: "earnings",
    label: "Platform Earnings",
    description: "Platform revenue overview",
    path: "/platform-earnings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "waitlist",
    label: "Waitlist",
    description: "View user waitlist",
    path: "/waitlist",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function QuickActions() {
  const [userData, setUserData] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      if (adminData) setUserData(JSON.parse(adminData));
    } catch (error) {
      console.error("Failed to parse admin data from localStorage", error);
    }
  }, []);

  const withAdmin = (path) => (userData?._id ? `/${userData._id}${path}` : "#");

  return (
    <div className="w-full">
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "11px",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "12px",
        }}
      >
        Quick Actions
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.id}
            to={withAdmin(action.path)}
            onMouseEnter={() => setHovered(action.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "14px",
              borderRadius: "10px",
              background: hovered === action.id ? "rgba(0,42,168,0.12)" : "#100F0F",
              border: `1px solid ${hovered === action.id ? "rgba(0,42,168,0.5)" : "rgba(255,255,255,0.06)"}`,
              transition: "all 0.18s ease",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: hovered === action.id ? "rgba(0,42,168,0.3)" : "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: hovered === action.id ? "#6b9aff" : "rgba(255,255,255,0.55)",
                transition: "all 0.18s ease",
              }}
            >
              {action.icon}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "white",
                  lineHeight: "1.3",
                  margin: 0,
                }}
              >
                {action.label}
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10.5px",
                  color: "rgba(255,255,255,0.38)",
                  marginTop: "3px",
                  lineHeight: "1.4",
                }}
              >
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
