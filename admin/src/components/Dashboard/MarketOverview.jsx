import React, { useState } from "react";
import CreateNews from "../../assets/MarketOverview/createnews.png";
import SupportImage from "../../assets/MarketOverview/support.png";
import { Link } from "react-router-dom";

function MarketOverview() {
  const [filterType, setFilterType] = useState("today");

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
    <div className="mt-12 flex my-8 ">
      {/* Left side */}
      <div className="px-8">
        {/* Header */}
        <div
          className="my-3 flex gap-6 items-center z-50"
          style={{ width: "431px", height: "28px" }}
        >
          <h1
            style={{
              width: "150px",
              height: "23px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "white",
            }}
          >
            Market OverView
          </h1>

          <ul
            className="relative z-50"
            style={{
              width: "251px",
              height: "28px",
              borderRadius: "8px",
              display: "flex",
              gap: "5px",
              paddingLeft: "11px",
              paddingRight: "11px",
              margin: 0,
              listStyle: "none",
              alignItems: "center",
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
                    filterType === type ? "#ffffff22" : "transparent",
                  color: filterType === type ? "#00A8FF" : "white",
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
        <div className="w-[544px] h-[332px] rounded-[10px] bg-[#100F0F] z-50 relative px-8 py-3 opacity-100">
          <table className="w-[461px] text-white text-sm border-collapse mt-12">
            <thead>
              <tr className="w-[461px] h-4 opacity-100 gap-[82px]">
                <th className="text-left w-[83px] font-inter font-semibold text-[11px]">
                  Collection Type
                </th>
                <th className="text-left w-[21px] font-inter font-semibold text-[11px]">
                  Buy
                </th>
                <th className="text-left w-[20px] font-inter font-semibold text-[11px]">
                  Sell
                </th>
                <th className="text-left w-[91px] font-inter font-semibold text-[11px]">
                  Total Market Gap
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={index}>
                  <td className="py-2 font-inter font-medium text-[11px]">
                    {row.type}
                  </td>
                  <td className="py-2 font-inter text-[11px] text-green-400">
                    +${row.buy}
                  </td>
                  <td className="py-2 font-inter text-[11px] text-red-400">
                    -${row.sell}
                  </td>
                  <td className="py-2 font-inter text-[11px] text-gray-400">
                    {row.gap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col gap-10">
        <div
          className="flex flex-col justify-center space-y-5 items-center"
          style={{
            width: "365px",
            height: "177px",
            background: "#100F0F",
            transform: "rotate(0deg)",
            opacity: 1,
          }}
        >
          <img
            src={CreateNews}
            alt="Create News"
            style={{
              width: "231px",
              height: "108px",

              transform: "rotate(0deg)",
              opacity: 1,
            }}
          />
          <Link
            to="/add-news"
            style={{
              width: "175px",
              height: "26px",
              position: "absolute",
              top: "133px",
              left: "95px",
              borderRadius: "4px",
              backgroundColor: "#002AA8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px",
              opacity: 1,
              transform: "rotate(0deg)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontStyle: "normal", // Semi Bold is handled via weight
                fontSize: "11px",
                lineHeight: "16px",
                letterSpacing: "0%",
                color: "white",
              }}
            >
              Create News
            </span>
          </Link>
        </div>

        {/* second card  */}
        <div
          className="flex flex-col justify-center items-center"
          style={{
            width: "370px",
            height: "177px",
            background: "#100F0F",
            transform: "rotate(0deg)",
            opacity: 1,
          }}
        >
          <img
            src={SupportImage}
            alt="Support"
            style={{
              width: "105px",
              height: "102.9px",
              position: "absolute",
              top: "21.12px",
              left: "132px",
              transform: "rotate(0deg)",
              opacity: 1,
            }}
          />

          <Link
            to="/support"
            style={{
              width: "175px",
              height: "26px",
              position: "absolute",
              top: "133px",
              left: "95px",
              borderRadius: "4px",
              backgroundColor: "#002AA8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "10px",
              opacity: 1,
              transform: "rotate(0deg)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontStyle: "normal", // Semi Bold is handled via weight
                fontSize: "11px",
                lineHeight: "16px",
                letterSpacing: "0%",
                color: "white",
              }}
            >
              Support
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MarketOverview;
