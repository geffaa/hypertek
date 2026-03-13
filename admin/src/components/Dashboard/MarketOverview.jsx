import React, { useState, useEffect } from "react";
import CreateNews from "../../assets/MarketOverview/createnews.png";
import SupportImage from "../../assets/MarketOverview/support.png";
import { Link } from "react-router-dom";

function MarketOverview() {
  const [filterType, setFilterType] = useState("today");
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      if (adminData) {
        setUserData(JSON.parse(adminData));
      }
    } catch (error) {
      console.error("Failed to parse admin data from localStorage", error);
    }
  }, []);

  // Dummy data for all filters
  const allData = {
    today: [
      { type: "Gold", buy: "1200", sell: "1300", gap: "100" },
      { type: "Silver", buy: "800", sell: "850", gap: "50" },
    ],
    week: [
      { type: "Gold", buy: "5000", sell: "5500", gap: "500" },
      { type: "Silver", buy: "3600", sell: "3800", gap: "200" },
      { type: "Platinum", buy: "7200", sell: "7600", gap: "400" },
    ],
    month: [
      { type: "Gold", buy: "20000", sell: "21000", gap: "1000" },
      { type: "Silver", buy: "15000", sell: "15800", gap: "800" },
      { type: "Copper", buy: "6000", sell: "6300", gap: "300" },
    ],
    year: [
      { type: "Gold", buy: "250000", sell: "260000", gap: "10000" },
      { type: "Silver", buy: "180000", sell: "190000", gap: "10000" },
      { type: "Platinum", buy: "350000", sell: "365000", gap: "15000" },
      { type: "Diamond", buy: "500000", sell: "520000", gap: "20000" },
    ],
  };

  const filteredRows = allData[filterType];

  return (
    <div className="mt-8 flex gap-6 my-8 w-full">
      {/* Left side */}
      <div className="min-w-0" style={{ flex: "0 1 55%" }}>
        {/* Header */}
        <div className="my-3 flex gap-4 items-center flex-wrap">
          <h1
            className="z-10"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "white",
              flexShrink: 0,
            }}
          >
            Market Overview
          </h1>

          <ul
            className="relative z-50"
            style={{
              display: "flex",
              gap: "4px",
              padding: "4px",
              margin: 0,
              listStyle: "none",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
            }}
          >
            {["today", "week", "month", "year"].map((type) => (
              <li
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  backgroundColor:
                    filterType === type ? "#002AA8" : "transparent",
                  color: "white", // 👈 always white
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Table */}
     <div className="w-full rounded-[10px] bg-[#100F0F] mt-5 z-50 relative px-6 py-3">
  <table className="w-full text-white text-sm border-separate border-spacing-y-4">
    <thead>
      <tr className="w-[461px] h-4 opacity-100 gap-[82px]">
        <th className="text-left w-[83px] font-inter font-semibold text-[11px]">
          Collection Type
        </th>
        <th className="text-left pl-2 w-[21px] font-inter font-semibold text-[11px]">
          Buy
        </th>
        <th className="text-left pl-2 w-[20px] font-inter font-semibold text-[11px]">
          Sell
        </th>
        <th className="text-left w-[91px] font-inter font-semibold text-[11px]">
          Total Market Gap
        </th>
      </tr>
    </thead>

    <tbody>
      {filteredRows.map((row, index) => (
        <tr key={index} className=" rounded-md w-[398px]">
          <td className="py-2 w-[16px] font-inter font-medium text-[11px]">
            {row.type}
          </td>
          <td className="py-2 pr-8 font-inter text-[11px] text-green-400">
            +${row.buy}
          </td>
          <td className="py-2 pr-5 font-inter text-[11px] text-[#FF5733]">
            -${row.sell}
          </td>
          <td className="py-2  font-inter text-[11px] text-gray-400">
            {row.gap}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col gap-4 flex-1 flex-shrink-0">
        {/* Create News card */}
        <div className="flex flex-col items-center justify-between rounded-[10px] p-4 gap-3" style={{ background: "#100F0F" }}>
          <img src={CreateNews} alt="Create News" className="w-full max-h-[100px] object-contain" />
          <Link
            to={`/${userData._id}/add-news`}
            className="w-full flex items-center justify-center rounded py-1.5 text-white text-xs font-semibold hover:bg-blue-700 transition"
            style={{ backgroundColor: "#002AA8", fontFamily: "Inter, sans-serif" }}
          >
            Create News
          </Link>
        </div>

        {/* Support card */}
        <div className="flex flex-col items-center justify-between rounded-[10px] p-4 gap-3" style={{ background: "#100F0F" }}>
          <img src={SupportImage} alt="Support" className="w-full max-h-[100px] object-contain" />
          <Link
            to={`/${userData._id}/support`}
            className="w-full flex items-center justify-center rounded py-1.5 text-white text-xs font-semibold hover:bg-blue-700 transition"
            style={{ backgroundColor: "#002AA8", fontFamily: "Inter, sans-serif" }}
          >
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MarketOverview;
