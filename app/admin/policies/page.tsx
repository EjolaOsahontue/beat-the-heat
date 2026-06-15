"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, GripVertical, Save, X } from "lucide-react";

type Policy = {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
};

const empty = (): Omit<Policy, "id"> => ({
  title: "",
  content: "",
  order_index: 0,
  is_active: true,
});

export default function PoliciesAdmin() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(empty());

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("policies")
      .select("*")
      .order("order_index", { ascending: true });
    setPolicies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!draft.title.trim() || !draft.content.trim()) return alert("Title and content are required.");
    setSaving("new");
    const { error } = await supabase.from("policies").insert([{ ...draft, order_index: policies.length }]);
    if (error) alert("Failed to save policy.");
    else { setCreating(false); setDraft(empty()); fetch(); }
    setSaving(null);
  };

  const update = async (p: Policy) => {
    setSaving(p.id);
    const { error } = await supabase.from("policies").update({
      title: p.title, content: p.content, is_active: p.is_active,
    }).eq("id", p.id);
    if (error) alert("Failed to update.");
    else { setEditing(null); fetch(); }
    setSaving(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this policy?")) return;
    await supabase.from("policies").delete().eq("id", id);
    fetch();
  };

  const toggleActive = async (p: Policy) => {
    await supabase.from("policies").update({ is_active: !p.is_active }).eq("id", p.id);
    fetch();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-zinc-400" size={28} />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase italic">Policies</h1>
          <p className="text-sm text-zinc-500 font-bold uppercase mt-1">
            Shown in the checkout policy tab
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs"
        >
          <Plus size={14} /> Add Policy
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-black uppercase text-sm">New Policy</h2>
          <input
            placeholder="Policy Title (e.g. Return Policy)"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black"
          />
          <textarea
            placeholder="Policy content..."
            value={draft.content}
            rows={6}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-black resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving === "new"}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase disabled:opacity-50"
            >
              {saving === "new" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
            <button
              onClick={() => { setCreating(false); setDraft(empty()); }}
              className="flex items-center gap-2 border border-zinc-200 px-5 py-2.5 rounded-xl text-xs font-black uppercase"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Policy list */}
      <div className="space-y-4">
        {policies.length === 0 && !creating && (
          <div className="text-center py-16 text-zinc-400 font-bold uppercase text-sm">
            No policies yet. Add your first one.
          </div>
        )}

        {policies.map((p) => (
          <div key={p.id} className="bg-white border border-zinc-200 rounded-2xl p-6">
            {editing?.id === p.id ? (
              <div className="space-y-4">
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black"
                />
                <textarea
                  value={editing.content}
                  rows={6}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-black resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => update(editing)}
                    disabled={saving === p.id}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase disabled:opacity-50"
                  >
                    {saving === p.id ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex items-center gap-2 border border-zinc-200 px-5 py-2.5 rounded-xl text-xs font-black uppercase"
                  >
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black uppercase text-sm">{p.title}</h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2">{p.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(p)}
                    className="text-[10px] font-black uppercase border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50"
                  >
                    {p.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => { setEditing(p); setCreating(false); }}
                    className="text-[10px] font-black uppercase border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}