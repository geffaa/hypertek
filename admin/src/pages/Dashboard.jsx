import Graph from "../components/Dashboard/BarGraph";
import LineGraph from "../components/Dashboard/LineGraph";
import MarketOverview from "../components/Dashboard/MarketOverview";
const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative text-white">

      {/* Content */}
      <div className="relative z-10 w-full px-4 mt-4">
        <Graph />
        <LineGraph />
        <MarketOverview />
      </div>
    </div>
  );
};


export default Dashboard;

