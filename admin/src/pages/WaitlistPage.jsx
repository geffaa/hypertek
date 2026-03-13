import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

const ROLES = ["standard", "early_access", "investor", "crowdfund"];

const roleLabelMap = {
  standard: "Standard",
  early_access: "Early Access",
  investor: "Investor",
  crowdfund: "Crowdfund",
};

const WaitlistPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Notification modal
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyRoles, setNotifyRoles] = useState([]);
  const [notifySending, setNotifySending] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Dashboard_Base_Url}/v1/waitlist`);
      setEntries(res.data.data || []);
    } catch (err) {
      console.error("Waitlist fetch error:", err);
      toast.error("Failed to fetch waitlist entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await axios.patch(`${Dashboard_Base_Url}/v1/waitlist/${id}/role`, { role: newRole });
      setEntries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, role: res.data.data.role } : e))
      );
      toast.success("Role updated");
    } catch (err) {
      console.error("Role update error:", err);
      toast.error("Failed to update role");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${Dashboard_Base_Url}/v1/waitlist/export/csv`);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "waitlist.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error("Failed to export CSV");
    }
  };

  const handleNotifyRoleToggle = (role) => {
    setNotifyRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSendNotification = async () => {
    if (!notifySubject.trim() || !notifyMessage.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    try {
      setNotifySending(true);
      const payload = {
        subject: notifySubject,
        message: notifyMessage,
        roles: notifyRoles,
      };
      const res = await axios.post(`${Dashboard_Base_Url}/v1/waitlist/notify`, payload);
      toast.success(res.data.message || "Notification sent");
      setShowNotifyModal(false);
      setNotifySubject("");
      setNotifyMessage("");
      setNotifyRoles([]);
    } catch (err) {
      console.error("Notify error:", err);
      toast.error(err?.response?.data?.message || "Failed to send notification");
    } finally {
      setNotifySending(false);
    }
  };

  // Stats
  const totalEntries = entries.length;
  const crowdfundInterested = entries.filter((e) => e.crowdfunding === "Yes").length;
  const roleCounts = ROLES.reduce((acc, role) => {
    acc[role] = entries.filter((e) => e.role === role).length;
    return acc;
  }, {});

  // Filtered entries
  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="flex flex-col min-h-full text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="font-inter font-semibold text-[25px] text-white">Waitlist Management</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-1">
          <span className="text-[#FFFFFFC4] text-xs font-medium">Total Entries</span>
          <span className="text-white text-2xl font-bold">{totalEntries}</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-1">
          <span className="text-[#FFFFFFC4] text-xs font-medium">Crowdfund Interested</span>
          <span className="text-[#002AA8] text-2xl font-bold">{crowdfundInterested}</span>
        </div>
        {ROLES.map((role) => (
          <div key={role} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[#FFFFFFC4] text-xs font-medium">{roleLabelMap[role]}</span>
            <span className="text-white text-2xl font-bold">{roleCounts[role]}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-[#FFFFFF60] text-sm focus:outline-none focus:border-[#002AA8]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#002AA8] cursor-pointer"
        >
          <option value="all" className="bg-[#060610]">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role} className="bg-[#060610]">
              {roleLabelMap[role]}
            </option>
          ))}
        </select>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Export CSV
        </button>
        <button
          onClick={() => setShowNotifyModal(true)}
          className="px-4 py-2 bg-[#002AA8] hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Send Notification
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#FFFFFFC4]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-[#FFFFFFC4]">No entries found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="h-[50px] backdrop-blur-sm border-b border-white/10">
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">No</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Excitement</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Interest</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Must Play</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Crowdfund?</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Role</th>
                <th className="px-4 py-3 text-white font-semibold text-sm tracking-wider whitespace-nowrap">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((entry, index) => (
                <tr
                  key={entry._id}
                  className="h-[60px] transition-all duration-200 hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-[#FFFFFFC4] text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-white font-medium text-sm whitespace-nowrap">{entry.name}</td>
                  <td className="px-4 py-3 text-[#FFFFFFC4] text-sm whitespace-nowrap">{entry.email}</td>
                  <td className="px-4 py-3 text-[#FFFFFFC4] text-sm max-w-[120px] truncate" title={entry.excitement}>{entry.excitement || "—"}</td>
                  <td className="px-4 py-3 text-[#FFFFFFC4] text-sm max-w-[120px] truncate" title={entry.interest}>{entry.interest || "—"}</td>
                  <td className="px-4 py-3 text-[#FFFFFFC4] text-sm max-w-[120px] truncate" title={entry.mustPlay}>{entry.mustPlay || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.crowdfunding === "Yes"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-[#FFFFFFC4]"
                      }`}
                    >
                      {entry.crowdfunding || "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={entry.role || "standard"}
                      onChange={(e) => handleRoleChange(entry._id, e.target.value)}
                      className="bg-[#002AA8]/30 border border-[#002AA8]/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#002AA8] cursor-pointer"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role} className="bg-[#060610]">
                          {roleLabelMap[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#FFFFFFC4] text-sm whitespace-nowrap">
                    {entry.createdAt
                      ? new Date(entry.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-8 w-full max-w-md text-white shadow-2xl">
            <h2 className="text-xl font-semibold mb-5">Send Notification</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#FFFFFFC4] mb-1">Subject</label>
                <input
                  type="text"
                  value={notifySubject}
                  onChange={(e) => setNotifySubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-[#FFFFFF60] text-sm focus:outline-none focus:border-[#002AA8]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#FFFFFFC4] mb-1">Message</label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Email message..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-[#FFFFFF60] text-sm focus:outline-none focus:border-[#002AA8] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[#FFFFFFC4] mb-2">Send to Roles</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifyRoles.length === 0}
                      onChange={() => setNotifyRoles([])}
                      className="accent-[#002AA8]"
                    />
                    <span className="text-sm text-[#FFFFFFC4]">All</span>
                  </label>
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifyRoles.includes(role)}
                        onChange={() => handleNotifyRoleToggle(role)}
                        className="accent-[#002AA8]"
                      />
                      <span className="text-sm text-[#FFFFFFC4]">{roleLabelMap[role]}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[#FFFFFF60] mt-1">
                  {notifyRoles.length === 0
                    ? "Will send to all roles"
                    : `Will send to: ${notifyRoles.map((r) => roleLabelMap[r]).join(", ")}`}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNotifyModal(false);
                  setNotifySubject("");
                  setNotifyMessage("");
                  setNotifyRoles([]);
                }}
                disabled={notifySending}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={notifySending}
                className="px-4 py-2 rounded-lg bg-[#002AA8] hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notifySending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistPage;
