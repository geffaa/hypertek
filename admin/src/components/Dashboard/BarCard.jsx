import { useState, useEffect } from "react";
import CalanderImage from "../../assets/BarGraph/Calander.png";
import UserIcon from "../../assets/BarGraph/UserIcon.png";
import IncreaseIcon from "../../assets/BarGraph/increase.png";
import TotalBuyIcon from "../../assets/BarGraph/totalBuy.png";
import totalSell from "../../assets/BarGraph/totalSell.png";
import TotalNfa from "../../assets/BarGraph/nfa.png";
import TotalCollection from "../../assets/BarGraph/collection.png";
import TotalOffer from "../../assets/BarGraph/totalOffer.png";
import { Dashboard_Base_Url } from "../../Config";

function BarCard({
  userSendData = [],
  userCount = 0,
  totalBuySendData = [],
  totalBuyerCount = 0,
  totalSellSendData = [],
  totalSellCount = 0,
  totalNfaSend = [],
  totalNfaCount = 0,
  totalCollectionSend = [],
  totalCollectionCount = 0,
  totalOfferSend = [],
  totalOfferCount = 0,
}) {
  const maxHeight = 88;
  const maxBarsToShow = 7; // Maximum number of bars to show in the chart


  const getDefaultMonthValue = (monthIndex) => {
  const year = new Date().getFullYear();
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const defaultMonth = getDefaultMonthValue(selectedMonth);


  // -------------------- Helper: Calculate Optimal Group Size --------------------
  const calculateOptimalGroupSize = (dataLength) => {
    if (dataLength <= maxBarsToShow) return 1; // No grouping needed

    // Calculate group size to get approximately maxBarsToShow bars
    const groupSize = Math.ceil(dataLength / maxBarsToShow);

    // Prefer groups of 3-4 if possible
    if (groupSize <= 4) return groupSize;

    // For very large datasets, ensure groups don't get too large
    return Math.min(groupSize, 7); // Cap at 7 days per group
  };

  // -------------------- Helper: Group Data into Flexible Chunks --------------------
  const groupDataIntoFlexibleChunks = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const groupSize = calculateOptimalGroupSize(data.length);
    const chunks = [];

    for (let i = 0; i < data.length; i += groupSize) {
      const chunk = data.slice(i, i + groupSize);
      const chunkSum = chunk.reduce((sum, val) => sum + val, 0);
      const daysInChunk = chunk.length;
      chunks.push({ sum: chunkSum, days: daysInChunk, startIndex: i });
    }

    return chunks;
  };

  // -------------------- Helper: Filter and Group Data --------------------
  const filterAndGroupData = (data, selectedMonth) => {
    if (!Array.isArray(data) || data.length === 0)
      return { filtered: [], displayCount: 0, groupedData: [] };

    // All valid dates
    const validDates = data
      .map((d) => d.createdAt)
      .filter((date) => date && !isNaN(new Date(date).getTime()))
      .map((date) => new Date(date));

    // If no month is selected, show all data
    if (!selectedMonth) {
      const allData = data.map(() => 1);
      const grouped = groupDataIntoFlexibleChunks(allData);
      return {
        filtered: allData,
        displayCount: data.length,
        groupedData: grouped,
      };
    }

    // Filter by selected month
    const filtered = data.filter(
      (item) => item.createdAt?.slice(0, 7) === selectedMonth
    );
    const filteredData = filtered.map(() => 1);
    const grouped = groupDataIntoFlexibleChunks(filteredData);

    return {
      filtered: filteredData,
      displayCount: filtered.length,
      groupedData: grouped,
    };
  };

  // -------------------- States with default current month --------------------
  const getCurrentMonth = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // month 01-12
    return `${now.getFullYear()}-${month}`;
  };

  const [selectedMonthUsers, setSelectedMonthUsers] = useState(
    getCurrentMonth()
  );
  const [userFilteredData, setUserFilteredData] = useState([]);
  const [userGroupedData, setUserGroupedData] = useState([]);
  const [userDisplayCount, setUserDisplayCount] = useState(userCount);

  const [selectedMonthBuy, setSelectedMonthBuy] = useState(getCurrentMonth());
  const [buyFilteredData, setBuyFilteredData] = useState([]);
  const [buyGroupedData, setBuyGroupedData] = useState([]);
  const [buyDisplayCount, setBuyDisplayCount] = useState(totalBuyerCount);

  const [selectedMonthSell, setSelectedMonthSell] = useState(getCurrentMonth());
  const [sellFilteredData, setSellFilteredData] = useState([]);
  const [sellGroupedData, setSellGroupedData] = useState([]);
  const [sellDisplayCount, setSellDisplayCount] = useState(totalSellCount);

  const [selectedMonthNfa, setSelectedMonthNfa] = useState(getCurrentMonth());
  const [nfaFilteredData, setNfaFilteredData] = useState([]);
  const [nfaGroupedData, setNfaGroupedData] = useState([]);
  const [nfaDisplayCount, setNfaDisplayCount] = useState(totalNfaCount);

  const [selectedMonthCollection, setSelectedMonthCollection] = useState(
    getCurrentMonth()
  );
  const [collectionFilteredData, setCollectionFilteredData] = useState([]);
  const [collectionGroupedData, setCollectionGroupedData] = useState([]);
  const [collectionDisplayCount, setCollectionDisplayCount] =
    useState(totalCollectionCount);

  const [selectedMonthOffer, setSelectedMonthOffer] = useState(
    getCurrentMonth()
  );
  const [offerFilteredData, setOfferFilteredData] = useState([]);
  const [offerGroupedData, setOfferGroupedData] = useState([]);
  const [offerDisplayCount, setOfferDisplayCount] = useState(totalOfferCount);

  // -------------------- Effects --------------------
  useEffect(() => {
    const { filtered, displayCount, groupedData } = filterAndGroupData(
      userSendData,
      selectedMonthUsers
    );
    setUserFilteredData(filtered);
    setUserGroupedData(groupedData);
    setUserDisplayCount(displayCount);
  }, [selectedMonthUsers, userSendData]);

  useEffect(() => {
    const { filtered, displayCount, groupedData } = filterAndGroupData(
      totalBuySendData,
      selectedMonthBuy
    );
    setBuyFilteredData(filtered);
    setBuyGroupedData(groupedData);
    setBuyDisplayCount(displayCount);
  }, [selectedMonthBuy, totalBuySendData]);

  useEffect(() => {
    const { filtered, displayCount, groupedData } = filterAndGroupData(
      totalSellSendData,
      selectedMonthSell
    );
    setSellFilteredData(filtered);
    setSellGroupedData(groupedData);
    setSellDisplayCount(displayCount);
  }, [selectedMonthSell, totalSellSendData]);

  useEffect(() => {
    const { filtered, displayCount, groupedData } = filterAndGroupData(
      totalNfaSend,
      selectedMonthNfa
    );
    setNfaFilteredData(filtered);
    setNfaGroupedData(groupedData);
    setNfaDisplayCount(displayCount);
  }, [selectedMonthNfa, totalNfaSend]);

  useEffect(() => {
    const { filtered, displayCount, groupedData } = filterAndGroupData(
      totalCollectionSend,
      selectedMonthCollection
    );
    setCollectionFilteredData(filtered);
    setCollectionGroupedData(groupedData);
    setCollectionDisplayCount(displayCount);
  }, [selectedMonthCollection, totalCollectionSend]);

  useEffect(() => {
    const { filtered, displayCount, groupedData } = filterAndGroupData(
      totalOfferSend,
      selectedMonthOffer
    );
    setOfferFilteredData(filtered);
    setOfferGroupedData(groupedData);
    setOfferDisplayCount(displayCount);
  }, [selectedMonthOffer, totalOfferSend]);

  // -------------------- Max Values for Grouped Data --------------------
  const getMaxValue = (groupedData) => {
    if (!groupedData || groupedData.length === 0) return 1;
    return Math.max(...groupedData.map((item) => item.sum));
  };

  const maxValueUsers = getMaxValue(userGroupedData);
  const maxValueBuy = getMaxValue(buyGroupedData);
  const maxValueSell = getMaxValue(sellGroupedData);
  const maxValueNfa = getMaxValue(nfaGroupedData);
  const maxValueCollection = getMaxValue(collectionGroupedData);
  const maxValueOffer = getMaxValue(offerGroupedData);


  useEffect(() => {
  const newMonth = getDefaultMonthValue(selectedMonth);

  setSelectedMonthUsers(newMonth);
  setSelectedMonthBuy(newMonth);
  setSelectedMonthSell(newMonth);
  setSelectedMonthNfa(newMonth);
  setSelectedMonthCollection(newMonth);
  setSelectedMonthOffer(newMonth);
}, [selectedMonth]);


  // -------------------- Chart Render with Flexible Grouped Data --------------------
  const renderFlexibleGroupedChart = (groupedData, maxValue) =>
    groupedData.length > 0 ? (
      groupedData.map((group, index) => {
        const filledHeight = (group.sum / maxValue) * maxHeight;

        // Adjust bar width based on number of groups
        const barWidth =
          groupedData.length <= 5 ? 28 : groupedData.length <= 7 ? 24 : 20;

        return (
          <div
            key={index}
            className="mx-auto flex flex-col justify-end rounded-sm overflow-hidden"
            style={{
              width: `${barWidth}px`,
              height: `${maxHeight}px`,
            }}
            title={`Days ${group.startIndex + 1}-${
              group.startIndex + group.days
            }: ${group.sum} items (${group.days} days)`}
          >
            <div
              style={{ height: `${maxHeight - filledHeight}px` }}
              className="bg-transparent w-full"
            />
            <div
              style={{ height: `${filledHeight}px` }}
              className="bg-blue-800 w-full"
            />
          </div>
        );
      })
    ) : (
      <div className="text-white text-sm">No data for this month</div>
    );

  // -------------------- Get Average Group Size --------------------
  const getAverageGroupSize = (groupedData) => {
    if (!groupedData || groupedData.length === 0) return 0;
    const totalDays = groupedData.reduce((sum, group) => sum + group.days, 0);
    return Math.round(totalDays / groupedData.length);
  };

  // -------------------- JSX --------------------
  return (
    <>
      {/* Total Users */}
      <div className="card relative w-[311px] pb-5 h-[239px] rounded-[10px] bg-[#100F0F] pt-[19px] px-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-2xl bg-[#002AA8] flex items-center justify-center">
              <img
                src={UserIcon}
                alt="total user"
                className="w-[16.72px] h-[16.72px] filter brightness-0 invert"
              />
            </div>
            <div className="w-[140px] h-[23px]">
              <h1 className="font-inter font-semibold text-[18px] text-white">
                Total Users
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <img
              src={IncreaseIcon}
              alt="Increase"
              className="w-[6.58px] h-[8.46px]"
            />
            <h2 className="font-inter font-medium text-[10.18px] text-[#00A843]">
              1.98%
            </h2>
          </div>
        </div>

        <div
          className="flex-1 px-3 mt-4 flex items-end justify-center my-5"
          style={{ width: "253px", height: `${maxHeight}px`, gap: "6px" }}
        >
          {renderFlexibleGroupedChart(userGroupedData, maxValueUsers)}
        </div>

        <div className="flex items-center justify-around mb-4">
          <h1 className="font-inter font-medium text-[14px] text-white">
            {userDisplayCount}
          </h1>

          <div
            className="flex items-center rounded-[6px] border border-white/60 px-2 cursor-pointer"
            style={{ height: "23.08px" }}
            onClick={() =>
              document.getElementById(`monthInput-users`)?.showPicker()
            }
          >
            <input
              id="monthInput-users"
              type="month"
              value={selectedMonthUsers}
              onChange={(e) => setSelectedMonthUsers(e.target.value)}
              className="flex-1 text-sm outline-none cursor-pointer h-full text-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <img
              src={CalanderImage}
              alt="calendar"
              className="w-[5.61px] h-[3.74px] ml-1 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Total Buy */}
      <div className="card relative w-[311px] pb-5 h-[239px] rounded-[10px] bg-[#100F0F] pt-[19px] px-4 flex flex-col justify-between ">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-2xl bg-[#002AA8] flex items-center justify-center">
              <img
                src={TotalBuyIcon}
                alt="total buy"
                className="w-[16.72px] h-[16.72px] filter brightness-0 invert"
              />
            </div>
            <div className="w-[140px] h-[23px]">
              <h1 className="font-inter font-semibold text-[18px] text-white">
                Total Buy
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <img
              src={IncreaseIcon}
              alt="Increase"
              className="w-[6.58px] h-[8.46px]"
            />
            <h2 className="font-inter font-medium text-[10.18px] text-[#00A843]">
              2.15%
            </h2>
          </div>
        </div>

        <div
          className="flex-1 px-3 mt-4 flex items-end justify-center my-5"
          style={{ width: "253px", height: `${maxHeight}px`, gap: "6px" }}
        >
          {renderFlexibleGroupedChart(buyGroupedData, maxValueBuy)}
        </div>

        <div className="flex items-center justify-around mb-4">
          <h1 className="font-inter font-medium text-[14px] text-white">
            {buyDisplayCount}
          </h1>

          <div
            className="flex items-center rounded-[6px] border border-white/60 px-2 cursor-pointer"
            style={{ height: "23.08px" }}
            onClick={() =>
              document.getElementById(`monthInput-buy`)?.showPicker()
            }
          >
            <input
              id="monthInput-buy"
              type="month"
              value={selectedMonthBuy}
              onChange={(e) => setSelectedMonthBuy(e.target.value)}
              className="flex-1 text-sm outline-none cursor-pointer h-full text-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <img
              src={CalanderImage}
              alt="calendar"
              className="w-[5.61px] h-[3.74px] ml-1 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Total Sell */}
      <div className="card relative w-[311px] pb-5 h-[239px] rounded-[10px] bg-[#100F0F] pt-[19px] px-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-2xl bg-[#002AA8] flex items-center justify-center">
              <img
                src={totalSell}
                alt="total sell"
                className="w-[16.72px] h-[16.72px] filter brightness-0 invert"
              />
            </div>
            <div className="w-[140px] h-[23px]">
              <h1 className="font-inter font-semibold text-[18px] text-white">
                Total Sell
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <img
              src={IncreaseIcon}
              alt="Increase"
              className="w-[6.58px] h-[8.46px]"
            />
            <h2 className="font-inter font-medium text-[10.18px] text-[#00A843]">
              2.15%
            </h2>
          </div>
        </div>

        <div
          className="flex-1 px-3 mt-4 flex items-end justify-center my-5"
          style={{ width: "253px", height: `${maxHeight}px`, gap: "6px" }}
        >
          {renderFlexibleGroupedChart(sellGroupedData, maxValueSell)}
        </div>

        <div className="flex items-center justify-around mb-4">
          <h1 className="font-inter font-medium text-[14px] text-white">
            {sellDisplayCount}
          </h1>

          <div
            className="flex items-center rounded-[6px] border border-white/60 px-2 cursor-pointer"
            style={{ height: "23.08px" }}
            onClick={() =>
              document.getElementById(`monthInput-sell`)?.showPicker()
            }
          >
            <input
              id="monthInput-sell"
              type="month"
              value={selectedMonthSell}
              onChange={(e) => setSelectedMonthSell(e.target.value)}
              className="flex-1 text-sm outline-none cursor-pointer h-full text-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <img
              src={CalanderImage}
              alt="calendar"
              className="w-[5.61px] h-[3.74px] ml-1 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Total NFA */}
      <div className="card relative w-[311px] pb-5 h-[239px] rounded-[10px] bg-[#100F0F] pt-[19px] px-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-2xl bg-[#002AA8] flex items-center justify-center">
              <img
                src={TotalNfa}
                alt="total nfa"
                className="w-[16.72px] h-[16.72px] filter brightness-0 invert"
              />
            </div>
            <div className="w-[140px] h-[23px]">
              <h1 className="font-inter font-semibold text-[18px] text-white">
                Total NFA
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <img
              src={IncreaseIcon}
              alt="Increase"
              className="w-[6.58px] h-[8.46px]"
            />
            <h2 className="font-inter font-medium text-[10.18px] text-[#00A843]">
              2.15%
            </h2>
          </div>
        </div>

        <div
          className="flex-1 px-3 mt-4 flex items-end justify-center my-5"
          style={{ width: "253px", height: `${maxHeight}px`, gap: "6px" }}
        >
          {renderFlexibleGroupedChart(nfaGroupedData, maxValueNfa)}
        </div>

        <div className="flex items-center justify-around mb-4">
          <h1 className="font-inter font-medium text-[14px] text-white">
            {nfaDisplayCount}
          </h1>

          <div
            className="flex items-center rounded-[6px] border border-white/60 px-2 cursor-pointer"
            style={{ height: "23.08px" }}
            onClick={() =>
              document.getElementById(`monthInput-nfa`)?.showPicker()
            }
          >
            <input
              id="monthInput-nfa"
              type="month"
              value={selectedMonthNfa}
              onChange={(e) => setSelectedMonthNfa(e.target.value)}
              className="flex-1 text-sm outline-none cursor-pointer h-full text-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <img
              src={CalanderImage}
              alt="calendar"
              className="w-[5.61px] h-[3.74px] ml-1 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Total Collections */}
      <div className="card relative w-[311px] pb-5 h-[239px] rounded-[10px] bg-[#100F0F] pt-[19px] px-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-2xl bg-[#002AA8] flex items-center justify-center">
              <img
                src={TotalCollection}
                alt="total collection"
                className="w-[16.72px] h-[16.72px] filter brightness-0 invert"
              />
            </div>
            <div className="w-[140px] h-[23px]">
              <h1 className="font-inter font-semibold text-[18px] text-white">
                Total Collections
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <img
              src={IncreaseIcon}
              alt="Increase"
              className="w-[6.58px] h-[8.46px]"
            />
            <h2 className="font-inter font-medium text-[10.18px] text-[#00A843]">
              2.15%
            </h2>
          </div>
        </div>

        <div
          className="flex-1 px-3 mt-4 flex items-end justify-center my-5"
          style={{ width: "253px", height: `${maxHeight}px`, gap: "6px" }}
        >
          {renderFlexibleGroupedChart(
            collectionGroupedData,
            maxValueCollection
          )}
        </div>

        <div className="flex items-center justify-around mb-4">
          <h1 className="font-inter font-medium text-[14px] text-white">
            {collectionDisplayCount}
          </h1>
          {/* <div className="text-xs text-gray-400 text-center">
            {collectionGroupedData.length} bars<br />
            ~{getAverageGroupSize(collectionGroupedData)} days/bar
          </div> */}
          <div
            className="flex items-center rounded-[6px] border border-white/60 px-2 cursor-pointer"
            style={{ height: "23.08px" }}
            onClick={() =>
              document.getElementById(`monthInput-collection`)?.showPicker()
            }
          >
            <input
              id="monthInput-collection"
              type="month"
              value={selectedMonthCollection}
              onChange={(e) => setSelectedMonthCollection(e.target.value)}
              className="flex-1 text-sm outline-none cursor-pointer h-full text-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <img
              src={CalanderImage}
              alt="calendar"
              className="w-[5.61px] h-[3.74px] ml-1 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Total Offers */}
      <div className="card relative w-[311px] pb-5 h-[239px] rounded-[10px] bg-[#100F0F] pt-[19px] px-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-2xl bg-[#002AA8] flex items-center justify-center">
              <img
                src={TotalOffer}
                alt="total offer"
                className="w-[16.72px] h-[16.72px] filter brightness-0 invert"
              />
            </div>
            <div className="w-[140px] h-[23px]">
              <h1 className="font-inter font-semibold text-[18px] text-white">
                Total Offers
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <img
              src={IncreaseIcon}
              alt="Increase"
              className="w-[6.58px] h-[8.46px]"
            />
            <h2 className="font-inter font-medium text-[10.18px] text-[#00A843]">
              2.15%
            </h2>
          </div>
        </div>

        <div
          className="flex-1 px-3 mt-4 flex items-end justify-center my-5"
          style={{ width: "253px", height: `${maxHeight}px`, gap: "6px" }}
        >
          {renderFlexibleGroupedChart(offerGroupedData, maxValueOffer)}
        </div>

        <div className="flex items-center justify-around mb-4">
          <h1 className="font-inter font-medium text-[14px] text-white">
            {offerDisplayCount}
          </h1>
          {/* <div className="text-xs text-gray-400 text-center">
            {offerGroupedData.length} bars<br />
            ~{getAverageGroupSize(offerGroupedData)} days/bar
          </div> */}
          <div
            className="flex items-center rounded-[6px] border border-white/60 px-2 cursor-pointer"
            style={{ height: "23.08px" }}
            onClick={() =>
              document.getElementById(`monthInput-offer`)?.showPicker()
            }
          >
            <input
              id="monthInput-offer"
              type="month"
              value={selectedMonthOffer}
              onChange={(e) => setSelectedMonthOffer(e.target.value)}
              className="flex-1 text-sm outline-none cursor-pointer h-full text-white appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <img
              src={CalanderImage}
              alt="calendar"
              className="w-[5.61px] h-[3.74px] ml-1 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default BarCard;
