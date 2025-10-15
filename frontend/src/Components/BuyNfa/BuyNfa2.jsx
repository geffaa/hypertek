import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config.js";
import toast from "react-hot-toast";

// ✅ Register Chart.js modules once
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels
);

function BuyNfa2() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);

  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchHistory = async () => {
      if(!BACKEND_BASE_URL){
        toast.error("Getting Base url failed")
      }
      try {
        const userId = user?._id || user?.id;
        if (!userId || !token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          // `http://localhost:4700/api/v1/history/history/${userId}`,
          `${BACKEND_BASE_URL}/api/v1/history/history/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("📊 Payment history response:", res.data);

        const fetchedData = res.data.data || [];

        if (fetchedData.length === 0) {
          setNoData(true);
          setError(res.data.message || "No purchase history found.");
        } else {
          setHistory(fetchedData);
        }
      } catch (err) {
        console.error("❌ Error fetching history:", err);
        const message =
          err.response?.data?.message  || "No History Data found for this user"
        if (message.includes("No payments found")) {
          setNoData(true);
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, token]);

  // ✅ Prepare chart data
  const labels = useMemo(() => history.map((item) => item.gameTitle), [history]);
  const amounts = useMemo(() => history.map((item) => item.amount), [history]);
  const dates = useMemo(
    () =>
      history.map((item) =>
        new Date(item.createdAt || item.date).toLocaleDateString()
      ),
    [history]
  );

  // ✅ Compute max value to avoid cut-off bars
  const maxAmount = useMemo(() => {
    return amounts.length ? Math.max(...amounts) : 0;
  }, [amounts]);

  const data = useMemo(
    () => ({
      labels: labels.length ? labels : ["No Purchases Yet"],
      datasets: [
        {
          label: "Purchase Amount (USD)",
          data: amounts.length ? amounts : [0],
          backgroundColor: "rgba(0, 42, 168, 0.8)",
          borderColor: "#001142",
          borderWidth: 2,
          barThickness: 40,
        },
      ],
    }),
    [labels, amounts]
  );

  const options = useMemo(
    () => ({
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: "end",
          align: "end",
          color: "white",
          font: { weight: "bold", size: 10 },
          formatter: (value) => (value > 0 ? `$${value}` : ""),
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#0041ff",
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const index = context.dataIndex;
              const amount = context.raw;
              const date = dates[index];
              return [
                `💲 Amount: $${amount}`,
                date ? `📅 Date: ${date}` : "",
              ];
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 15 }, // adds space on top
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: maxAmount ? maxAmount * 1.1 : undefined, // adds 10% headroom
          ticks: { color: "white" },
          grid: {
            color: "rgba(255,255,255,0.2)",
            drawBorder: false,
          },
        },
        x: {
          ticks: { color: "white", font: { size: 12 } },
          grid: {
            color: "rgba(255,255,255,0.2)",
            drawBorder: false,
          },
        },
      },
    }),
    [dates, maxAmount]
  );

  // ✅ Render UI
  if (loading) {
    return (
      <section className="w-full max-w-[1240px] h-[400px] mt-6 mx-auto rounded-[11px] bg-[#0b0b0b] p-4 flex items-center justify-center">
        <p className="text-white text-center">Loading payment history...</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1240px] h-[400px] mt-6 mx-auto rounded-[11px] bg-[#0b0b0b] p-4 relative">
      {/* Title */}
      <div className="text-white mb-2">
        <h1 className="text-[25px] font-inter font-bold">Price History</h1>
      </div>

      {/* Divider line */}
      <div className="w-full border-t border-white opacity-70 mb-4"></div>

      {/* Chart Area */}
      <div className="h-[320px] bg-[#111] rounded-lg p-4 relative">
        <Bar data={data} options={options} redraw />

        {(noData || error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111]/80 rounded-lg">
            <p className="text-gray-300 text-center text-sm sm:text-base px-4">
              {error || "No purchase history available."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BuyNfa2;
