import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Dashboard_Base_Url } from "../Config";

const EMPTY = {
  name: "", email: "", paymentPreference: "crypto", walletAddress: "", notes: "", isActive: true,
  bankDetails: { accountHolderName: "", bankName: "", accountNumber: "", iban: "", swift: "", routingNumber: "", country: "", currency: "USD" },
};

function ArtistForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const existing = location.state?.artist;

  const [form, setForm] = useState(existing ? {
    name: existing.name || "",
    email: existing.email || "",
    paymentPreference: existing.paymentPreference || "crypto",
    walletAddress: existing.walletAddress || "",
    notes: existing.notes || "",
    isActive: existing.isActive !== false,
    bankDetails: { ...EMPTY.bankDetails, ...(existing.bankDetails || {}) },
  } : EMPTY);

  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const adminId = JSON.parse(localStorage.getItem("admin_data") || "{}")?._id;

  const setBank = (field, value) =>
    setForm((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }

    if (form.paymentPreference === "crypto" && form.walletAddress && form.walletAddress.length !== 42) {
      toast.error("Wallet address must be 42 characters"); return;
    }

    setSaving(true);
    try {
      if (existing) {
        await axios.put(`${Dashboard_Base_Url}/v1/admin/artists/${existing._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Artist updated");
      } else {
        await axios.post(`${Dashboard_Base_Url}/v1/admin/artists`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Artist created");
      }
      navigate(`/${adminId}/artists`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-md bg-white/5 border border-white/15 text-white text-sm placeholder-white/30 outline-none focus:border-blue-500/60 transition-colors";
  const labelCls = "block text-white/60 text-xs font-medium mb-1";

  return (
    <div className="px-4 md:px-10 pt-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-white font-semibold text-[22px]">
          {existing ? "Edit Artist" : "Add Artist"}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Artist royalty payments are dispatched automatically (4%) on every sale completion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Artist full name" required />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="artist@example.com" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes (internal)</label>
          <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Hired for Season 1 skins" />
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-blue-600" />
          <label htmlFor="isActive" className="text-white/70 text-sm">Active</label>
        </div>

        {/* Payment Preference */}
        <div>
          <label className={labelCls}>Royalty Payment Method *</label>
          <div className="flex gap-3">
            {["crypto", "bank"].map((opt) => (
              <button key={opt} type="button"
                onClick={() => setForm({ ...form, paymentPreference: opt })}
                className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                  form.paymentPreference === opt
                    ? "bg-blue-700 border-blue-600 text-white"
                    : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                }`}>
                {opt === "crypto" ? "🔗 Crypto Wallet (USDC)" : "🏦 Bank Transfer"}
              </button>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-2">
            {form.paymentPreference === "crypto"
              ? "4% royalty will be sent automatically on-chain to the wallet address below."
              : "4% royalty will be paid out to this bank account automatically via Stripe."}
          </p>
        </div>

        {/* Crypto — wallet address */}
        {form.paymentPreference === "crypto" && (
          <div>
            <label className={labelCls}>Wallet Address (Base network)</label>
            <input className={inputCls} value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value.toLowerCase() })} placeholder="0x..." maxLength={42} />
          </div>
        )}

        {/* Bank details */}
        {form.paymentPreference === "bank" && (
          <div className="rounded-lg border border-white/10 p-4 flex flex-col gap-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Bank Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Account Holder Name</label>
                <input className={inputCls} value={form.bankDetails.accountHolderName} onChange={(e) => setBank("accountHolderName", e.target.value)} placeholder="Full legal name" />
              </div>
              <div>
                <label className={labelCls}>Bank Name</label>
                <input className={inputCls} value={form.bankDetails.bankName} onChange={(e) => setBank("bankName", e.target.value)} placeholder="e.g. Wise, Barclays" />
              </div>
              <div>
                <label className={labelCls}>Account Number</label>
                <input className={inputCls} value={form.bankDetails.accountNumber} onChange={(e) => setBank("accountNumber", e.target.value)} placeholder="Account number" />
              </div>
              <div>
                <label className={labelCls}>IBAN</label>
                <input className={inputCls} value={form.bankDetails.iban} onChange={(e) => setBank("iban", e.target.value)} placeholder="GB00 XXXX..." />
              </div>
              <div>
                <label className={labelCls}>SWIFT / BIC</label>
                <input className={inputCls} value={form.bankDetails.swift} onChange={(e) => setBank("swift", e.target.value)} placeholder="SWIFT code" />
              </div>
              <div>
                <label className={labelCls}>Routing Number (US)</label>
                <input className={inputCls} value={form.bankDetails.routingNumber} onChange={(e) => setBank("routingNumber", e.target.value)} placeholder="US routing number" />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input className={inputCls} value={form.bankDetails.country} onChange={(e) => setBank("country", e.target.value)} placeholder="e.g. United Kingdom" />
              </div>
              <div>
                <label className={labelCls}>Payout Currency</label>
                <select className={inputCls} value={form.bankDetails.currency} onChange={(e) => setBank("currency", e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-white/20 text-white/70 text-sm rounded-md hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors">
            {saving ? "Saving..." : existing ? "Save Changes" : "Create Artist"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArtistForm;
