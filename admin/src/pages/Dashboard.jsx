import Graph from "../components/Dashboard/BarGraph";
import LineGraph from "../components/Dashboard/LineGraph";
import MarketOverview from "../components/Dashboard/MarketOverview";
import BgEffect2 from "../components/common/BgEffect2";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden relative text-white">

      {/* Background Glowing Effects */}
      <BgEffect2 Xaxis={950} Yaxis={30} />

      {/* Content */}
      <div className="relative z-50 w-full max-w-[1400px] mx-auto px-8 mt-16">
        <Graph />
        <LineGraph />
        <MarketOverview />
      </div>
    </div>
  );
};


export default Dashboard;

