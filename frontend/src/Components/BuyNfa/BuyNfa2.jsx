import React, { useMemo } from "react";
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

// Register Chart.js modules + plugins
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
  // Chart data (memoized to prevent re-creation on every render)
  const data = useMemo(
    () => ({
      labels: ["Dec20", "Dec21", "Dec22"],
      datasets: [
        {
          data: [0, 0.05, 0.1], // your actual values (left axis)
          backgroundColor: "blue",
          yAxisID: "y", // main left axis
          barThickness: 40,
        },
      ],
    }),
    []
  );

  // Chart options (memoized)
  const options = useMemo(
    () => ({
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          // text: "Price History",
          font: { size: 18 },
          color: "white",
        },
        datalabels: {
          anchor: "end",
          align: "end",
          color: "black",
          font: { weight: "bold" },
          formatter: (value) => value,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "white" },
          grid: {
            color: "rgba(255,255,255,0.2)",
            drawBorder: false,
          },
        },
        y2: {
          beginAtZero: true,
          position: "right",
          ticks: {
            color: "white",
            // custom tick values for the right axis
            callback: function (value) {
              const mapping = {
                0: "0.036",
                0.05: "0.06",
                0.1: "0.085",
              };
              return mapping[value] || "";
            },
          },
          grid: { drawOnChartArea: false }, // avoid overlap
        },
        x: {
          ticks: { color: "white" },
          grid: {
            color: "rgba(255,255,255,0.2)",
            drawBorder: false,
          },
        },
      },
    }),
    []
  );

  return (
    <section className="w-full max-w-[1240px] h-[400px] mt-6 mx-auto rounded-[11px] bg-[#0b0b0b] p-4">
      {/* Title */}
      <div className="text-white mb-2">
        <h1 className="text-[25px] font-inter font-bold">Price History</h1>
      </div>

      {/* Divider line */}
      <div className="w-full border-t border-white opacity-70 mb-4"></div>

      {/* Chart */}
      <div className="h-[320px] bg-[#111] rounded-lg p-4">
        <Bar data={data} options={options} redraw />
      </div>
    </section>
  );
}

export default BuyNfa2;
