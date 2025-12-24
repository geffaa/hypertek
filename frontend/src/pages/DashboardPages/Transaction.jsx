import React, { useState } from "react";
import SearchImage from "../../assets/search.png";

function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Static transaction data
  const transactionsData = [
    {
      id: 1,
      transactionHash: "0xc4c16a645427a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
      shortHash: "0xc4c16a645427....",
      timeAgo: "1 hour ago",
      recipientAddress: "0xc4c16b46r56848939b836457373829bnbeee567bb",
      amount: "$5,000",
    },
    {
      id: 2,
      transactionHash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
      shortHash: "0xa1b2c3d4e5f6....",
      timeAgo: "2 hours ago",
      recipientAddress: "0x1234567890abcdef1234567890abcdef12345678",
      amount: "$3,200",
    },
    {
      id: 3,
      transactionHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0",
      shortHash: "0x9e8d7c6b5a4f....",
      timeAgo: "3 hours ago",
      recipientAddress: "0xfedcba0987654321fedcba0987654321fedcba09",
      amount: "$12,500",
    },
    {
      id: 4,
      transactionHash: "0x5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4",
      shortHash: "0x5f6e7d8c9b0a....",
      timeAgo: "5 hours ago",
      recipientAddress: "0x567890abcdef1234567890abcdef1234567890ab",
      amount: "$800",
    },
    {
      id: 5,
      transactionHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
      shortHash: "0x1a2b3c4d5e6f....",
      timeAgo: "1 day ago",
      recipientAddress: "0x9876543210fedcba9876543210fedcba98765432",
      amount: "$45,000",
    },
    {
      id: 6,
      transactionHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
      shortHash: "0x3c4d5e6f7a8b....",
      timeAgo: "2 days ago",
      recipientAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      amount: "$2,300",
    },
    {
      id: 7,
      transactionHash: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      shortHash: "0x7e8f9a0b1c2d....",
      timeAgo: "3 days ago",
      recipientAddress: "0x34567890abcdef1234567890abcdef1234567890",
      amount: "$15,750",
    },
    {
      id: 8,
      transactionHash: "0xb0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
      shortHash: "0xb0c1d2e3f4a5....",
      timeAgo: "1 week ago",
      recipientAddress: "0xdefabc1234567890defabc1234567890defabc12",
      amount: "$9,999",
    },
  ];

  // Filter transactions based on search term
  const filteredTransactions = transactionsData.filter(transaction =>
    transaction.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.shortHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.recipientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-[950px] bg-black text-white p-16  overflow-hidden">
      {/* Background Blurs */}
      <div
        style={{
          top: "0px",
          left: "330px",
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
          <img
            src={SearchImage}
            alt="search"
            className="w-[16px] h-[16px]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions, addresses, amounts..."
            style={{
              width: "100%",
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
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
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
                    {transaction.shortHash}
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
                    {transaction.timeAgo}
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
                    color: "#FFFFFFAB",
                  }}
                >
                  {transaction.recipientAddress}
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
                    color: "#FFFFFFAB",
                  }}
                >
                  {transaction.amount}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "16px",
                color: "#FFFFFFAB",
              }}
            >
              No transactions found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

    
    </div>
  );
}

export default Transactions;