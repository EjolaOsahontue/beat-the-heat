"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type Policy = { id: string; title: string; content: string };

export default function PolicyModal({ onClose }: { onClose: () => void }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("policies")
        .select("id, title, content")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      setPolicies(data || []);
      if (data && data.length > 0) setOpen(data[0].id);
      setLoading(false);
    };
    fetch();

    // Lock scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-brand-bg w-full max-w-2xl rounded-[2rem] max-h-[80vh] flex flex-col overflow-hidden border border-brand-border">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border shrink-0">
          <h2 className="font-black uppercase italic text-lg">Our Policies</h2>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-muted" size={24} />
            </div>
          ) : policies.length === 0 ? (
            <p className="text-center text-brand-muted font-bold uppercase text-sm py-12">
              No policies available.
            </p>
          ) : (
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.id} className="border border-brand-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpen(open === p.id ? null : p.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-brand-surface transition-colors"
                  >
                    <span className="font-black uppercase text-sm">{p.title}</span>
                    {open === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {open === p.id && (
                    <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-brand-muted whitespace-pre-wrap border-t border-brand-border/40">
                      {p.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}