'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit3, X, Check } from 'lucide-react';

export default function ShippingManager() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Method State
  const [newMethod, setNewMethod] = useState({
    name: '',
    price: '',
    days: '',
  });

  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMethod, setEditMethod] = useState({
    name: '',
    price: '',
    days: '',
  });

  const fetchMethods = async () => {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .order('base_cost', { ascending: true });

    if (error) {
      console.error(error.message);
      return;
    }
    setMethods(data || []);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const addMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.name) return;
    setLoading(true);

    const { error } = await supabase.from('shipping_methods').insert([
      {
        name: newMethod.name,
        base_cost: Number(newMethod.price) || 0,
        estimated_days: newMethod.days,
        is_active: true,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNewMethod({ name: '', price: '', days: '' });
    fetchMethods();
  };

  const startEditing = (method: any) => {
    setEditingId(method.id);
    setEditMethod({
      name: method.name,
      price: String(method.base_cost),
      days: method.estimated_days,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const updateMethod = async (id: string) => {
    if (!editMethod.name) return;
    setLoading(true);

    const { error } = await supabase
      .from('shipping_methods')
      .update({
        name: editMethod.name,
        base_cost: Number(editMethod.price) || 0,
        estimated_days: editMethod.days,
      })
      .eq('id', id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId(null);
    fetchMethods();
  };

  const deleteMethod = async (id: string) => {
    const { error } = await supabase
      .from('shipping_methods')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }
    fetchMethods();
  };

  return (
    <div className="max-w-6xl p-10 pt-24 mx-auto">
      <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-10">
        Shipping Settings
      </h1>

      {/* ADD FORM */}
      <form
        onSubmit={addMethod}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-zinc-100 mb-10 shadow-sm"
      >
        <input
          type="text"
          placeholder="Shipping Rule Name (e.g. Lagos State)"
          className="p-4 bg-zinc-50 rounded-xl outline-none border border-transparent focus:border-zinc-200 text-sm font-medium"
          value={newMethod.name}
          onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
          required
        />

        <input
          placeholder="Time (e.g. 5 - 7 days after fulfilment)"
          className="p-4 bg-zinc-50 rounded-xl outline-none text-sm font-medium"
          value={newMethod.days}
          onChange={(e) => setNewMethod({ ...newMethod, days: e.target.value })}
          required
        />

        <input
          placeholder="Price (₦)"
          type="number"
          className="p-4 bg-zinc-50 rounded-xl outline-none text-sm font-medium"
          value={newMethod.price}
          onChange={(e) => setNewMethod({ ...newMethod, price: e.target.value })}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-xl font-black uppercase transition-all hover:bg-zinc-800 disabled:opacity-50 text-sm"
        >
          Add Rule
        </button>
      </form>

      {/* LIST SECTION */}
      <div className="space-y-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm"
          >
            {editingId === m.id ? (
              /* Edit Mode */
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <input
                  type="text"
                  className="p-3 bg-zinc-50 rounded-xl outline-none border border-zinc-200 text-sm font-semibold"
                  value={editMethod.name}
                  onChange={(e) => setEditMethod({ ...editMethod, name: e.target.value })}
                  required
                />

                <input
                  className="p-3 bg-zinc-50 rounded-xl outline-none border border-zinc-200 text-sm font-semibold"
                  value={editMethod.days}
                  onChange={(e) => setEditMethod({ ...editMethod, days: e.target.value })}
                  required
                />

                <input
                  type="number"
                  className="p-3 bg-zinc-50 rounded-xl outline-none border border-zinc-200 text-sm font-semibold"
                  value={editMethod.price}
                  onChange={(e) => setEditMethod({ ...editMethod, price: e.target.value })}
                  required
                />

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => updateMethod(m.id)}
                    disabled={loading}
                    className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center flex-1 md:flex-none"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-3 bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center flex-1 md:flex-none"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black uppercase text-sm">
                    {m.name} — ₦{Number(m.base_cost).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-400 font-bold uppercase mt-1">
                    {m.estimated_days}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(m)}
                    className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 p-2 rounded-full transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteMethod(m.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
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