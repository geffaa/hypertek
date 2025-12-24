import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ViewAll from "../../assets/LineGraph/viewall.png";
import { Link , useNavigate } from "react-router-dom";
import { Dashboard_Base_Url } from "../../Config";
import toast from "react-hot-toast";

function LineGraph() {
  const navigate = useNavigate()
  const periods = ["Today", "Week", "Month", "Year"];
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [ userData , setUserData ] =useState([])
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    value: 0,
    label: "",
  });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [allData, setAllData] = useState({
    Today: [],
    Week: [],
    Month: [],
    Year: [],
  });
  const [tableData, setTableData] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!Dashboard_Base_Url) {
        toast.error("Base url is required");
      }
      try {
        const res = await axios.get(`${Dashboard_Base_Url}/dashboard/payments`);

        console.log("your payment are :",res);
        if (res.data.success) {
          const rawData = res.data.data;

          // Prepare chart data for each period
          const chartData = { Today: [], Week: [], Month: [], Year: [] };
          const now = new Date();

          rawData.forEach((item) => {
            const createdAt = new Date(item.createdAt);
            const diffDays = Math.floor(
              (now - createdAt) / (1000 * 60 * 60 * 24)
            );

            // Today
            if (
              createdAt.getDate() === now.getDate() &&
              createdAt.getMonth() === now.getMonth() &&
              createdAt.getFullYear() === now.getFullYear()
            ) {
              chartData.Today.push({
                label: `${createdAt.getHours()}:00`,
                value: item.amount,
              });
            }

            // Week (last 7 days)
            if (diffDays < 7) {
              chartData.Week.push({
                label: createdAt.toLocaleDateString("en-US", {
                  weekday: "short",
                }),
                value: item.amount,
              });
            }

            // Month (current month)
            if (
              createdAt.getMonth() === now.getMonth() &&
              createdAt.getFullYear() === now.getFullYear()
            ) {
              chartData.Month.push({
                label: createdAt.toLocaleDateString("en-US", {
                  day: "numeric",
                }),
                value: item.amount,
              });
            }

            // Year (current year)
            if (createdAt.getFullYear() === now.getFullYear()) {
              chartData.Year.push({
                label: createdAt.toLocaleDateString("en-US", {
                  month: "short",
                }),
                value: item.amount,
              });
            }
          });

          setAllData(chartData);
          setTableData(rawData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);



   useEffect(() => {
  setTimeout(() => {
    try {
      const adminData = localStorage.getItem("admin_data");
      console.log("your admin data are :",adminData._id);
      if (adminData) setUserData(JSON.parse(adminData));
    } catch (error) {
      console.error("Failed to parse admin data from localStorage", error);
    }
  }, 0);
}, []);

    

  const data = allData[selectedPeriod] || [];
  const maxValue = data.length
    ? Math.max(...data.map((d) => d.value)) * 1.2
    : 100;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const gridLines = 4;

  // Animate graph
  useEffect(() => {
    setAnimationProgress(0);
    const timer = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 1) {
          clearInterval(timer);
          return 1;
        }
        return prev + 0.02;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [selectedPeriod, data]);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "12px Inter";
      ctx.textAlign = "right";
      const value = Math.round(maxValue - (maxValue / gridLines) * i);
      ctx.fillText(value.toString(), padding.left - 6, y + 4);
    }
    ctx.setLineDash([]);

    // Points
    const points = data.map((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
      return { x, y, value: d.value, label: d.label };
    });

    const animatedPoints = points.map((p) => ({
      ...p,
      y:
        padding.top +
        chartHeight -
        (p.value / maxValue) * chartHeight * animationProgress,
    }));

    // Gradient fill
    if (animationProgress > 0 && animatedPoints.length) {
      const gradient = ctx.createLinearGradient(
        0,
        padding.top,
        0,
        height - padding.bottom
      );
      gradient.addColorStop(0, "rgba(15, 19, 238, 0.3)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.beginPath();
      ctx.moveTo(animatedPoints[0].x, height - padding.bottom);
      animatedPoints.forEach((p, i) => {
        if (i === 0) ctx.lineTo(p.x, p.y);
        else {
          const prev = animatedPoints[i - 1];
          const cpX = (prev.x + p.x) / 2;
          ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
        }
      });
      ctx.lineTo(
        animatedPoints[animatedPoints.length - 1].x,
        height - padding.bottom
      );
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = "#0509faff";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    animatedPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = animatedPoints[i - 1];
        const cpX = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
      }
    });
    ctx.stroke();

    // Draw points
    if (animationProgress > 0.5) {
      animatedPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#6366f1";
        ctx.fill();
        ctx.strokeStyle = "#100F0F";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // X-axis labels
    ctx.fillStyle = "#fff";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    points.forEach((p) => {
      ctx.fillText(p.label, p.x, height - padding.bottom + 15);
    });
  }, [animationProgress, data, maxValue]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (
      mouseX < padding.left ||
      mouseX > width - padding.right ||
      mouseY < padding.top ||
      mouseY > height - padding.bottom
    ) {
      setTooltip({ ...tooltip, show: false });
      return;
    }

    let closestPoint = null;
    let minDistance = Infinity;
    data.forEach((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y =
        padding.top +
        chartHeight -
        (d.value / maxValue) * chartHeight * animationProgress;
      const distance = Math.abs(mouseX - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = { x, y, value: d.value, label: d.label };
      }
    });

    if (closestPoint) {
      setTooltip({
        show: true,
        x: closestPoint.x,
        y: closestPoint.y,
        value: closestPoint.value,
        label: closestPoint.label,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };



 const handleViewAllTransaction = () => {
  if (!userData?._id) {
    toast.error("You should be an authentic user to view all transactions");
    return; // prevent navigation if user is not valid
  }
  navigate(`/${userData._id}/transactions`);
};

  return (
    <div className="flex mx-auto space-x-3 relative">
      {/* Left Side Graph */}
      <div className="space-y-5">
        <div className="flex items-center" style={{ width: "100%" }}>
          <h1
            style={{
              width: "230px",
              height: "23px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "white",
            }}
          >
            Transaction Overview
          </h1>
          <ul style={{ display: "flex", gap: "10px", margin: 0, padding: 0 }}>
            {periods.map((period) => (
              <li
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  width: "56px",
                  height: "28px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background:
                    selectedPeriod === period ? "#002AA8" : "transparent",
                  color: "#FFFFFF",
                  fontWeight: selectedPeriod === period ? 600 : 400,
                  transition: "0.2s",
                }}
              >
                {period}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="bg-[#100F0F] p-4 rounded-lg"
          style={{
            width: "543.68px",
            height: "236.31px",
            position: "relative",
          }}
        >
          <div
            ref={containerRef}
            className="w-full h-full relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <canvas ref={canvasRef} className="w-full h-full" />
            {tooltip.show && (
              <div
                className="absolute bg-white rounded-lg px-4 py-3 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3"
                style={{
                  left: `${tooltip.x}px`,
                  top: `${tooltip.y}px`,
                  boxShadow:
                    "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)",
                  minWidth: "100px",
                }}
              >
                <div className="text-gray-600 text-xs font-medium mb-1">
                  {tooltip.label}
                </div>
                <div className="text-gray-900 font-bold text-lg">
                  ${tooltip.value.toLocaleString()}
                </div>
                <div className="text-indigo-600 text-sm font-semibold">
                  +3.4%
                </div>
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-full"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid white",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Table */}
      <div
        className="flex flex-col items-center"
        style={{
          width: "431px",
          height: "310px",
          borderRadius: "10px",
          color: "white",
          backgroundColor: "#100F0F",
        }}
      >
        {/* Header Filters */}
        <div
          className="my-3"
          style={{
            width: "385px",
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              width: "128px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "white",
            }}
          >
            Live Transaction
          </h1>
          <ul
            style={{
              width: "251px",
              height: "28px",
              borderRadius: "8px",
              backgroundColor: "#181717",
              display: "flex",
              gap: "5px",
              paddingLeft: "11px",
              paddingRight: "11px",
              margin: 0,
              listStyle: "none",
              alignItems: "center",
            }}
          >
            {["All", "Deposit", "Withdraw", "Transfer"].map((filter) => (
              <li
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  backgroundColor:
                    selectedFilter === filter ? "#002AA8" : "transparent",
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {filter}
              </li>
            ))}
          </ul>
        </div>

        {/* Table */}
        <div className="">
        <table className="w-[387px] text-white rounded-lg border-separate border-spacing-y-3">

            <thead>
              <tr>
                <th className="text-left pl-1 text-xs font-semibold">Title</th>
                <th className="text-left pl-3 text-xs font-semibold">Date</th>
                <th className="text-left pl-5 text-xs font-semibold">Amount</th>
                <th className="text-center px-2 text-xs font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData
                .filter((row) =>
                  selectedFilter === "All"
                    ? true
                    : row.status.toLowerCase() === selectedFilter.toLowerCase()
                )
                .slice(0, 3)
                .map((row, index) => (
                  <tr key={index} className="my-4">
                    <td className="pl-1 text-[11px] text-[#FFFFFF8C] gap-8 ">
                      {row.gameTitle.length > 10
                        ? row.gameTitle.slice(0, 10) + "..."
                        : row.gameTitle}
                    </td>
                    <td className="pl-3 text-[11px] text-[#FFFFFF8C]">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pl-5 text-[11px]   text-[#FFFFFF8C]">
                      ${row.amount.toLocaleString()}
                    </td>
<td className="px-4 text-[11px] h-[18px] w-[63px] text-center">
  <span
    style={{
      borderRadius: "4px",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        row.status === "succeeded"
          ? "#17361A" // Green background for succeeded
          : row.status === "failed"
          ? "#361718" // Red background for failed
          : "#361718", // Default fallback
      color:
        row.status === "succeeded"
          ? "#19880E" // Green text for succeeded
          : row.status === "failed"
          ? "#880E10" // Red text for failed
          : "#FFFFFF", // Default white text
      fontFamily: "Inter, sans-serif",
      fontWeight: 500,
      fontSize: "11px",
      lineHeight: "18px",
      minWidth: "70px",
    }}
  >
    {row.status === "succeeded" ? "Success" : row.status === "failed" ? "Failed" : row.status}
  </span>
</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end w-full pr-12 mt-[18px] mb-8">
          <button onClick={handleViewAllTransaction}
            className="border border-white rounded-md flex justify-end items-center ml-5 cursor-pointer"
            style={{
              width: "90px",
              height: "20px",
              padding: "10px",
              gap: "10px",
            }}
          >



              <h1 className="text-white font-normal text-xs">View All</h1>

            <img
              src={ViewAll}
              alt="View All"
              style={{ width: "8.67px", height: "8.67px" }}
            />
          </button> 
        </div>
      </div>
    </div>
  );
}

export default LineGraph;
