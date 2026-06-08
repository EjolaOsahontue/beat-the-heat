'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Edit3, Trash2, Package, Search } from 'lucide-react';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const { data } = await supabase.from('products').select('*, product_skus(quantity)');
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all variations?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="p-20 text-center font-black uppercase italic animate-pulse">Loading BTH Vault...</div>;

  return (
    <div className="p-8 pt-24 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 italic">BTH Admin</p>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Vault Inventory</h1>
        </div>
        <Link href="/admin/products/new" className="bg-black text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-xl">+ Add New Piece</Link>
      </div>

      <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 border-b border-zinc-100">
            <tr>
              <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Piece</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Base Price</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Stock Status</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const total = p.product_skus?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0;
              return (
                <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      {p.images?.[0] && <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover border border-zinc-100" />}
                      <span className="font-black uppercase italic text-lg">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-8 text-zinc-500 font-bold">₦{p.base_price.toLocaleString()}</td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${total > 5 ? 'bg-green-500' : total > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                      <span className="font-black text-[10px] uppercase tracking-wider">{total} Units</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/products/${p.id}`} className="p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all">
                        <Edit3 size={16}/>
                      </Link>
                      <button onClick={() => deleteProduct(p.id, p.name)} className="p-3 bg-zinc-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}