"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Save, CheckCircle } from "lucide-react";

export default function AdminContactDetailsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    instagram_url: "",
  });

  // Fetch current details from Supabase row 1 on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (!error && data) {
        setForm({
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          contact_address: data.contact_address || "",
          instagram_url: data.instagram_url || "",
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  // Save the changes back to row 1
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const { error } = await supabase
      .from("site_settings")
      .update({
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        contact_address: form.contact_address,
        instagram_url: form.instagram_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      alert("Error saving settings data: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto text-zinc-950">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">Contact Settings</h1>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">
          Update the global contact information displayed across your store website
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        
        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold uppercase tracking-wide">
            <CheckCircle size={16} /> Changes saved successfully!
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Support Email Address</label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none font-medium text-sm focus:border-zinc-900 transition-colors"
            placeholder="e.g. support@bth.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Business Phone Number</label>
          <input
            type="text"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none font-medium text-sm focus:border-zinc-900 transition-colors"
            placeholder="e.g. +234 810 000 0000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Physical Address / Headquarters</label>
          <input
            type="text"
            value={form.contact_address}
            onChange={(e) => setForm({ ...form, contact_address: e.target.value })}
            className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none font-medium text-sm focus:border-zinc-900 transition-colors"
            placeholder="e.g. Victoria Island, Lagos"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Instagram Profile URL</label>
          <input
            type="url"
            value={form.instagram_url}
            onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
            className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none font-medium text-sm focus:border-zinc-900 transition-colors"
            placeholder="e.g. https://instagram.com/bth"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Save size={16} /> Update Contact Details
            </>
          )}
        </button>
      </form>
    </div>
  );
}