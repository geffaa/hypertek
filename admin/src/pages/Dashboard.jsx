import Graph from "../components/Dashboard/BarGraph";
import LineGraph from "../components/Dashboard/LineGraph";
import QuickActions from "../components/Dashboard/MarketOverview";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const admin = useSelector((state) => state.admin.admin);
  const adminName = admin?.username || admin?.name || "Admin";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen text-white pb-10">

      {/* Page Header */}
      <div className="mb-6 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "22px",
              color: "white",
              lineHeight: 1.2,
            }}
          >
            Welcome back, {adminName}
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "4px",
            }}
          >
            {today}
          </p>
        </div>
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            background: "rgba(0,42,168,0.15)",
            border: "1px solid rgba(0,42,168,0.4)",
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Admin Panel
        </div>
      </div>

      {/* Section: Stats Overview */}
      <div className="mb-1">
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "11px",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "12px",
          }}
        >
          Platform Stats
        </p>
        <Graph />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0 20px" }} />

      {/* Section: Transaction Overview */}
      <div className="mb-1">
        <LineGraph />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

      {/* Section: Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
