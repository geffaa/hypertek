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

    <div className=" text-white bg-black  flex flex-col ">
      <Graph />
      <LineGraph />
      <MarketOverview />
    </div>
    </>
  );
};

export default Dashboard;
