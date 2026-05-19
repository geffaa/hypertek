import React, { useEffect, useState } from "react";
import BarCard from "./BarCard";
import axios from "axios";
import { Dashboard_Base_Url } from "../../Config";
import toast from "react-hot-toast";
import FullScreenLoader from "../common/Spinner";

const FILTER_OPTIONS = [
  { key: "all", label: "All Data"   },
  { key: "1m",  label: "This Month" },
  { key: "3m",  label: "3 Months"   },
  { key: "6m",  label: "6 Months"   },
  { key: "1y",  label: "1 Year"     },
];

function BarGraph() {
  const [userData,        setUserData]        = useState(null);
  const [totalBuy,        setTotalBuy]        = useState(null);
  const [totalSell,       setTotalSell]       = useState(null);
  const [totalNfa,        setTotalNfa]        = useState(null);
  const [totalCollection, setTotalCollection] = useState(null);
  const [totalOffers,     setTotalOffers]     = useState(null);
  const [combinedNfa,     setCombinedNfa]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [period,          setPeriod]          = useState("all");

  const GetAllData = async () => {
    if (!Dashboard_Base_Url) { toast.error("Base URL is required"); setLoading(false); return; }
    try {
      setLoading(true);
      const [users, Buy, Sell, Nfa, collections, offer] = await Promise.all([
        axios.get(`${Dashboard_Base_Url}/dashboard/user/Count`),
        axios.get(`${Dashboard_Base_Url}/dashboard/buyers/Count`),
        axios.get(`${Dashboard_Base_Url}/dashboard/sellers/Count`),
        axios.get(`${Dashboard_Base_Url}/dashboard/combined/Counts`),
        axios.get(`${Dashboard_Base_Url}/dashboard/marketplace/Count`),
        axios.get(`${Dashboard_Base_Url}/dashboard/offers/Count`),
      ]);
      setCombinedNfa([...Nfa.data.lands, ...Nfa.data.marketplaceItems]);
      setUserData(users.data);
      setTotalBuy(Buy.data);
      setTotalSell(Sell.data);
      setTotalNfa(Nfa.data);
      setTotalCollection(collections.data);
      setTotalOffers(offer.data);
    } catch (err) {
      console.error("Dashboard API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { GetAllData(); }, []);

  if (loading) return <FullScreenLoader />;

  return (
    <div className="mb-8 w-full" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Shared period filter */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                background: period === opt.key ? "#002AA8" : "transparent",
                color: period === opt.key ? "white" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BarCard
          userSendData={userData?.users || []}
          userCount={userData?.totalUsers || 0}
          totalBuySendData={totalBuy?.buyers || []}
          totalBuyerCount={totalBuy?.totalBuyers || 0}
          totalSellSendData={totalSell?.sellers || []}
          totalSellCount={totalSell?.totalSellers || 0}
          totalNfaSend={combinedNfa || []}
          totalNfaCount={totalNfa?.total || 0}
          totalCollectionSend={totalCollection?.marketplaceItems || []}
          totalCollectionCount={totalCollection?.totalItems || 0}
          totalOfferSend={totalOffers?.offers || []}
          totalOfferCount={totalOffers?.totalOffers || 0}
          period={period}
        />
      </div>
    </div>
  );
}

export default BarGraph;
