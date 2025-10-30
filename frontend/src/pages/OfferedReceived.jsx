import React from "react";
import { Link } from "react-router-dom";

function OfferedReceived() {
  return (
    <div className="mt-32 md:mt-24 px-4 max-w-7xl mx-auto">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="#"
          className="pb-1 text-white font-medium hover:text-blue-400 transition-colors"
        >
          Overview
        </Link>

        <Link
          to="/offer-received"
          className="border-b-2 border-blue-500 pb-1 text-white font-medium hover:text-blue-400 transition-colors"
        >
          Offer 0
        </Link>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-white text-sm md:text-base">
          <thead>
            <tr className="bg-[#1E1E1E]">
              <th className="px-4 py-2 text-left font-semibold border-b border-gray-700">
                Price
              </th>
              <th className="px-4 py-2 text-left font-semibold border-b border-gray-700">
                Offer
              </th>
              <th className="px-4 py-2 text-left font-semibold border-b border-gray-700">
                From
              </th>
              <th className="px-4 py-2 text-left font-semibold border-b border-gray-700">
                Expire
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="hover:bg-[#2A2A2A] transition">
              <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">
                1600.2 USDT
              </td>
              <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">
                Collection
              </td>
              <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">
                0xe03a
              </td>
              <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">
                10d
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfferedReceived;
