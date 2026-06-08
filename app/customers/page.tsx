'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, ShoppingBag } from 'lucide-react';

export default function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase.from('customer_summary').select('*');
      if (data) setCustomers(data);
    };
    fetchCustomers();
  }, []);

  return (
    <div className="p-10 pt-24">
      <h1 className="text-4xl font-black uppercase italic mb-10">Customer Directory</h1>
      <div className="grid gap-6">
        {customers.map((c) => (
          <div key={c.customer_email} className="bg-white p-8 rounded-[2rem] border border-zinc-100 flex justify-between items-center">
            <div>
              <h2 className="font-black text-xl uppercase tracking-tighter">{c.customer_name}</h2>
              <p className="text-zinc-400 font-bold text-sm">{c.customer_email}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-black uppercase bg-zinc-100 px-2 py-1 rounded">Orders: {c.total_orders}</span>
                <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-1 rounded">Spent: ₦{c.total_spent.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex -space-x-2">
               {/* Display small icons for items bought */}
               <div className="w-12 h-12 rounded-full bg-zinc-50 border-2 border-white flex items-center justify-center">
                 <ShoppingBag size={16} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}