import React, { useEffect, useState } from "react";
import BarCard from "./BarCard";
import axios from "axios";
import { Dashboard_Base_Url } from "../../Config";
import toast from "react-hot-toast";
import FullScreenLoader from "../common/Spinner"


function BarGraph() {
  // ✅ Separate states for each dataset
  const [userData, setUserData] = useState(null);
  const [totalBuy, setTotalBuy] = useState(null);
  const [totalSell, setTotalSell] = useState(null);
  const [totalNfa, setTotalNfa] = useState(null);
  const [totalCollection, setTotalCollection] = useState(null);
  const [totalOffers, setTotalOffers] = useState(null);
  const [combinedNfa, setCombinedNfa] = useState([]); // For combined lands + marketplace items
  const [loading, setLoading] = useState(true); // ✅ Add loading state




  const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
const [selectedMonth, setSelectedMonth] = useState(currentMonth);



  // ✅ Fetch all dashboard data
  const GetAllData = async () => {
    if(!Dashboard_Base_Url){
      toast.error("Base Url is required")
      setLoading(false);
    }

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

      // ✅ Combine NFA lands + marketplaceItems
      const combined = [...Nfa.data.lands, ...Nfa.data.marketplaceItems];
      setCombinedNfa(combined);

      // ✅ Set separate states
      setUserData(users.data);
      setTotalBuy(Buy.data);
      setTotalSell(Sell.data);
      setTotalNfa(Nfa.data);
      setTotalCollection(collections.data);
      setTotalOffers(offer.data);
    } catch (error) {
      console.log("Dashboard API Error:", error);
    }
    finally {
      setLoading(false); // ✅ Stop loading regardless of success/error
    }
  };

  useEffect(() => {
    GetAllData();
  }, []);


  if (loading) {
    return <FullScreenLoader />;
  }

console.log("your total Sellers:", totalSell?.sellers);
  return (
    <div className="my-8 w-full max-w-[993px] mx-auto h-auto grid grid-cols-3 grid-rows-2 gap-6">
      {/* ✅ Pass each dataset individually */}
    <BarCard
  selectedMonth={selectedMonth}
  setSelectedMonth={setSelectedMonth}
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
/>

   



    
    </div>
  );
}

export default BarGraph;
