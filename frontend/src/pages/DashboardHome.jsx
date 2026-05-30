import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FiPlusSquare, FiLayers, FiTag, FiMessageSquare, FiFileText, FiZap } from "react-icons/fi";

function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const name = user?.FullName || user?.UserName || user?.Email || "there";

  const QUICK_LINKS = [
    {
      icon: <FiPlusSquare size={22} />,
      label: t("dashboard.home.createNFT","Create NFT/NFC"),
      sub: t("dashboard.home.createNFTDesc","Create and store a new item"),
      to: "/dashboard/add-user-collection",
      color: "rgba(0,42,168,0.25)",
      border: "rgba(0,42,168,0.4)",
    },
    {
      icon: <FiLayers size={22} />,
      label: t("dashboard.home.myCollections","My Collections"),
      sub: t("dashboard.home.myCollectionsDesc","Browse your NFT/NFC collections"),
      to: "/dashboard/collections",
      color: "rgba(168,85,247,0.15)",
      border: "rgba(168,85,247,0.35)",
    },
    {
      icon: <FiTag size={22} />,
      label: t("dashboard.home.myListings","My Listings"),
      sub: t("dashboard.home.myListingsDesc","Items currently on sale"),
      to: "/dashboard/collection-on-sale",
      color: "rgba(74,222,128,0.12)",
      border: "rgba(74,222,128,0.30)",
    },
    {
      icon: <FiMessageSquare size={22} />,
      label: t("dashboard.home.myOffers","My Offers"),
      sub: t("dashboard.home.myOffersDesc","Track offers you've made"),
      to: "/dashboard/my-offers",
      color: "rgba(234,179,8,0.12)",
      border: "rgba(234,179,8,0.30)",
    },
    {
      icon: <FiFileText size={22} />,
      label: t("dashboard.home.transactions","Transactions"),
      sub: t("dashboard.home.transactionsDesc","Payment history"),
      to: "/dashboard/transactions",
      color: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
    },
    {
      icon: <FiZap size={22} />,
      label: t("dashboard.home.withdraw","Withdraw"),
      sub: t("dashboard.home.withdrawDesc","Withdraw your HB balance"),
      to: "/dashboard/withdraw",
      color: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen px-6 md:pl-12 pt-8 pb-16">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">
          {t("dashboard.home.welcomeBack","Welcome back")}{name !== "there" ? `, ${name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {t("dashboard.home.subtitle","Manage your NFT/NFC collections, listings, and offers from here.")}
        </p>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:brightness-110"
            style={{ background: item.color, border: `1px solid ${item.border}` }}
          >
            <div className="text-white/70">{item.icon}</div>
            <div>
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-white/40 text-xs mt-0.5">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardHome;
