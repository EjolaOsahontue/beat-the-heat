'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Edit3, Trash2, Loader2 } from 'lucide-react';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = async () => {
    const { data } = await supabase.from('products').select('*, product_skus(quantity)');
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const deleteProduct = async (product: any) => {
    if (!confirm(`Permanently delete "${product.name}" and all its images?`)) return;
    
    setDeletingId(product.id);

    try {
      // 1. Extract file names from URLs to delete from Storage
      // Assumes URLs look like: .../storage/v1/object/public/product-images/FILENAME
      if (product.images && product.images.length > 0) {
        const filePaths = product.images.map((url: string) => {
          const parts = url.split('/');
          return parts[parts.length - 1];
        });

        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(filePaths);

        if (storageError) console.error("Storage cleanup error:", storageError.message);
      }

      // 2. Delete from Database (SKUs will cascade delete automatically)
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (dbError) throw dbError;

      setProducts(products.filter(p => p.id !== product.id));
      alert("Product and associated media purged.");
    } catch (err: any) {
      alert("Error during deletion: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase italic animate-pulse">Loading Vault...</div>;

  return (
    <div className="p-8 pt-24 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
         <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 italic">
             Product Management
           </p>
           <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Inventory</h1>
         </div>
        <Link href="/admin/products/new" className="bg-black text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-xl">Add New Piece</Link>
      </div>

      <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 border-b border-zinc-100">
            <tr>
              <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Piece</th>
              <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    {p.images?.[0] && <img src={p.images[0]} className="w-16 h-20 rounded-xl object-cover border border-zinc-100" />}
                    <div>
                      <span className="font-black uppercase italic text-xl block">{p.name}</span>
                      <span className="text-[10px] font-bold text-zinc-400">₦{p.base_price.toLocaleString()}</span>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/products/${p.id}`} className="p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all">
                      <Edit3 size={18}/>
                    </Link>
                    <button 
                      onClick={() => deleteProduct(p)} 
                      disabled={deletingId === p.id}
                      className="p-4 bg-zinc-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {deletingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}