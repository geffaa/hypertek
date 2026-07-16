import React from "react";

// Shared section card for the profile settings page.
export default function SettingsCard({ title, subtitle, children }) {
  return (
    <div className="bg-[#0b1026]/70 border border-white/10 rounded-2xl p-6 sm:p-7">
      <h3 className="text-white text-lg font-semibold leading-tight">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}
