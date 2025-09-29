import React from "react";
import Box from "@mui/material/Box";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function BuyNfa2() {
  // Data for the bars
  const data = [
    { date: "Dec20", value: 0.036 },
    { date: "Dec21", value: 0.06 },
    { date: "Dec22", value: 0.085 },
    { date: "Dec23", value: 0.085 },
  ];

  // Y-axis ticks
  const yValues = [0, 0.036, 0.06, 0.085];

  return (
    <section className="w-full max-w-[1240px] h-[400px] mt-6 mx-auto rounded-[11px] bg-[#0b0b0b] p-4">
      {/* Chart Title */}
      <div className="text-white mb-2">
        <h1 className="text-[25px] font-inter font-bold">Price History</h1>
      </div>

      {/* Decorative horizontal line below title */}
      <div className="w-full border-t border-white opacity-70 mb-4"></div>

      {/* Chart container */}
      <div className="flex flex-col md:flex-row bg-[#111] rounded-lg p-2 h-[320px]">
        {/* Optional Left Y-axis values (for desktop) */}
        <div className="hidden md:flex flex-col justify-between text-white w-[50px] mr-2">
          {yValues.slice(1).map((val, index) => (
            <span key={index} className="text-sm">
              {val.toFixed(3)}
            </span>
          ))}
        </div>

        {/* Chart */}
        <Box sx={{ flex: 1, height: "100%", bgcolor: "#111" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
              barCategoryGap="30%"
            >
              {/* Horizontal grid lines only */}
              <CartesianGrid vertical={false} horizontal={true} stroke="#333" />

              {/* X-axis */}
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#fff" }}
              />

              {/* Right Y-axis */}
              <YAxis
                orientation="right"
                domain={[0, 0.09]}
                ticks={yValues}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#fff", fontSize: 12 }}
                tickFormatter={(v) => v.toFixed(3)}
              />

              {/* Bars */}
              <Bar dataKey="value" barSize={40} fill="#0047FF" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </div>
    </section>
  );
}

export default BuyNfa2;
