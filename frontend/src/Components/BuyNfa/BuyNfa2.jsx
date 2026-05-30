import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { BACKEND_BASE_URL } from "../../Config.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

function PriceHistory({ subId }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [noData, setNoData]    = useState(false);

  useEffect(() => {
    if (!subId) { setLoading(false); setNoData(true); return; }
    axios
      .get(`${BACKEND_BASE_URL}/api/v1/nft/sub-collection/${subId}/price-history`)
      .then((res) => {
        const data = res.data?.history || [];
        if (data.length === 0) setNoData(true);
        else setHistory(data);
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  }, [subId]);

  const labels  = useMemo(() => history.map((h) => new Date(h.date).toLocaleDateString()), [history]);
  // Round to 6 significant digits to avoid floating-point noise
  const prices  = useMemo(() => history.map((h) => parseFloat(Number(h.price).toPrecision(6))), [history]);
  const minP    = useMemo(() => prices.length ? parseFloat((Math.min(...prices) * 0.9).toPrecision(6)) : 0, [prices]);
  const maxP    = useMemo(() => prices.length ? parseFloat((Math.max(...prices) * 1.15).toPrecision(6)) : 1, [prices]);

  const data = useMemo(() => ({
    labels: labels.length ? labels : ["—"],
    datasets: [{
      label: "Sale Price (USDC)",
      data: prices.length ? prices : [0],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,0.08)",
      borderWidth: 2,
      pointBackgroundColor: "#3b82f6",
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: true,
    }],
  }), [labels, prices]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 16, right: 16, bottom: 8, left: 8 },
    },
    plugins: {
      legend: { display: false },
      // Explicitly disable ChartDataLabels if registered globally
      datalabels: { display: false },
      tooltip: {
        backgroundColor: "rgba(10,15,40,0.95)",
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.6)",
        borderColor: "rgba(59,130,246,0.3)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${parseFloat(Number(ctx.raw).toPrecision(6))} USDC`,
        },
      },
    },
    scales: {
      y: {
        min: minP,
        max: maxP,
        position: "left",
        ticks: {
          color: "rgba(255,255,255,0.35)",
          font: { size: 10 },
          maxTicksLimit: 5,
          padding: 12,
          callback: (v) => parseFloat(Number(v).toPrecision(4)) + " USDC",
        },
        grid: { color: "rgba(255,255,255,0.06)", drawTicks: false },
        border: { display: false },
      },
      x: {
        ticks: {
          color: "rgba(255,255,255,0.35)",
          font: { size: 11 },
          padding: 10,
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  }), [minP, maxP]);

  return (
    <div className="mt-8 w-full">
      <div className="mb-3">
        <h2 className="text-white font-semibold text-base">{t("buyNfa.priceHistory.title", "Price History")}</h2>
        <p className="text-white/30 text-xs mt-0.5">{t("buyNfa.priceHistory.subtitle", "Historical sale prices for this NFT")}</p>
      </div>

      <div
        className="rounded-2xl p-5 relative"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {loading ? (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm">{t("buyNfa.priceHistory.loading", "Loading...")}</div>
        ) : noData || history.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center gap-2">
            <p className="text-white/30 text-sm">{t("buyNfa.priceHistory.noSales", "No sales recorded yet")}</p>
            <p className="text-white/20 text-xs">{t("buyNfa.priceHistory.noSalesNote", "Price history appears after the first sale")}</p>
          </div>
        ) : (
          <div className="h-56">
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceHistory;
