import React, { useState, useEffect } from "react";
import SearchImage from "../assets/search.png";
import { Dashboard_Base_Url } from "../Config";
import axios from "axios";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // <-- add state for search
  const [filteredTransactions, setFilteredTransactions] = useState([]); // filtered list

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${Dashboard_Base_Url}/v1/history/get-history`
        );

        console.log("API Response:", res.data);

        if (res.data.success) {
          setTransactions(res.data.data);
          setFilteredTransactions(res.data.data); // initialize filtered list
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchHistory();
  }, []);

  // Filter transactions when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTransactions(transactions);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = transactions.filter(
        (tx) =>
          tx.gameTitle.toLowerCase().includes(lowerQuery) ||
          tx.transactionId.toLowerCase().includes(lowerQuery) ||
          tx.amount.toString().includes(lowerQuery)
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval > 1 ? "s ago" : " ago");

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval > 1 ? "s ago" : " ago");

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval > 1 ? "s ago" : " ago");

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval > 1 ? "s ago" : " ago");

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval > 1 ? "s ago" : " ago");

    return "just now";
  }

  return (
    <div className="w-full h-[950px] bg-black text-white p-16">
      {/* Background circles */}
      <div
        style={{
          top: "20px",
          left: "360px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>
      <div
        style={{
          top: "610px",
          left: "860px",
          width: "250px",
          height: "250px",
          background: "#002AA8",
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
        className="absolute rounded-full"
      ></div>

      {/* Header */}
      <div style={{ width: "426px", height: "95px", gap: "22px" }}>
        <h1
          style={{
            width: "426px",
            height: "30px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "25px",
            color: "white",
            marginBottom: "22px",
          }}
        >
          Transaction History
        </h1>

        {/* Search Box */}
        <div
          className="flex items-center"
          style={{
            width: "426px",
            height: "43px",
            borderRadius: "6px",
            gap: "15px",
            padding: "5px 36px",
            background: "#FFFFFF1C",
          }}
        >
          <img src={SearchImage} alt="search" className="w-[16px] h-[16px]" />
          <input
            type="text"
            placeholder="Search transactions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "123px",
              height: "17px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="mt-8 space-y-4">
        {filteredTransactions.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center w-full max-w-[954px] gap-5"
          >
            {/* Left */}
            <div className="flex items-center gap-3 w-[209px] h-[49px]">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "48px",
                  height: "49px",
                  padding: "15px 14px",
                  background: "#C5C3C3",
                }}
              >
                <p className="text-[#7A7676C4]">Tx</p>
              </div>
              <div className="flex flex-col gap-1 w-[132px] h-[38px]">
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    color: "#FFFFFFAB",
                    margin: 0,
                  }}
                >
                  {item.gameTitle}
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    color: "#FFFFFFAB",
                    margin: 0,
                  }}
                >
                  {timeAgo(item.createdAt)}
                </p>
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 flex justify-center">
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                {item.transactionId}..
              </p>
            </div>

            {/* Right */}
            <div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                ${item.amount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transactions;
