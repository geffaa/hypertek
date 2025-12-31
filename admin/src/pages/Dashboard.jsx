import Graph from "../components/Dashboard/BarGraph";
import LineGraph from "../components/Dashboard/LineGraph";
import MarketOverview from "../components/Dashboard/MarketOverview";
import GlowingOrb from "../components/common/BgEffect";

const Dashboard = () => {
  return (
    <> 
      <GlowingOrb Xaxis={120} Yaxis={50} />
      <GlowingOrb Xaxis={300} Yaxis={150} />
      <GlowingOrb Xaxis={730} Yaxis={340} />
      <GlowingOrb Xaxis={20} Yaxis={630} />
      <GlowingOrb Xaxis={730} Yaxis={1040} />
      <GlowingOrb Xaxis={60} Yaxis={1040} />

      <div className="flex-1 min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
  <div className="w-full max-w-[1400px] px-6">
    
    <Graph />
    <LineGraph />
    <MarketOverview />
  </div>
</div>
    </>
  );
};

export default Dashboard;
