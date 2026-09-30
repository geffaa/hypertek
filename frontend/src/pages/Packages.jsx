import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_BASE_URL } from "../Config";
import { toast } from "react-hot-toast";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPackages(data.packages);
        else toast.error(data.error || "Failed to load packages");
      })
      .catch(() => toast.error("Failed to load packages"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading packages...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-100 to-indigo-100 py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Packages</h1>

      {packages.length === 0 ? (
        <p className="text-center text-gray-600">No packages available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <Link
              key={pkg._id}
              to={`/packages/${pkg.slug || pkg._id}`}
              data-testid="package-card"
              className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {pkg.image && <img src={pkg.image} alt={pkg.name} className="w-full h-40 object-cover" />}
              <div className="p-5">
                {pkg.badge && (
                  <span className="inline-block text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-full mb-2">
                    {pkg.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pkg.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-indigo-700">${pkg.priceUSD}</span>
                  {pkg.basePriceTotalUSD > pkg.priceUSD && (
                    <span className="text-sm text-gray-400 line-through">${pkg.basePriceTotalUSD}</span>
                  )}
                </div>
                {pkg.availableStock !== undefined && pkg.availableStock !== null && (
                  <p className="text-xs text-gray-500 mt-2">{pkg.availableStock} left</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
