'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2 } from 'lucide-react';

export default function ShippingManager() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: '',
    price: '',
    days: '',
  });

  // FETCH
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

  // ADD
  const addMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('shipping_methods').insert([
      {
        name: newMethod.name,
        base_cost: Number(newMethod.price) || 0, // ✅ FIXED
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

  // DELETE
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
    <div className="max-w-4xl p-10 pt-24">
      <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-10">
        Shipping
      </h1>

      {/* FORM */}
      <form
        onSubmit={addMethod}
        className="grid grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-zinc-100 mb-10"
      >
        <input
          placeholder="Method (e.g. Lagos Express)"
          className="col-span-1 p-4 bg-zinc-50 rounded-xl outline-none"
          value={newMethod.name}
          onChange={(e) =>
            setNewMethod({ ...newMethod, name: e.target.value })
          }
          required
        />

        <input
          placeholder="Time (e.g. 24 Hours)"
          className="col-span-1 p-4 bg-zinc-50 rounded-xl outline-none"
          value={newMethod.days}
          onChange={(e) =>
            setNewMethod({ ...newMethod, days: e.target.value })
          }
          required
        />

        <input
          placeholder="Price"
          type="number"
          className="p-4 bg-zinc-50 rounded-xl outline-none"
          value={newMethod.price}
          onChange={(e) =>
            setNewMethod({ ...newMethod, price: e.target.value })
          }
          required
        />

        <button
          disabled={loading}
          className="bg-black text-white rounded-xl font-black uppercase"
        >
          {loading ? '...' : 'Add'}
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className="flex justify-between items-center p-6 bg-white border border-zinc-100 rounded-3xl"
          >
            <div>
              <p className="font-black uppercase text-sm">
                {m.name} — ₦{Number(m.base_cost).toLocaleString()}
              </p>

              <p className="text-xs text-zinc-400 font-bold uppercase">
                {m.estimated_days}
              </p>
            </div>

            <button
              onClick={() => deleteMethod(m.id)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-full"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}