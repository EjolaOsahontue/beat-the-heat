'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('orders').select('*');

      if (error) {
        console.error('Failed to fetch orders:', error.message);
        return;
      }

      if (!data) return;

      const grouped = data.reduce((acc: any, order: any) => {
        const email = order.customer_email;

        if (!email) return acc;

        if (!acc[email]) {
          acc[email] = {
            name: order.customer_name || 'Unknown',
            email,
            spent: 0,
            orders: 0,
            items: [],
          };
        }

        acc[email].spent += Number(order.total_amount || 0);
        acc[email].orders += 1;

        // ✅ SAFE items handling (fixes crash)
        if (Array.isArray(order.items)) {
          acc[email].items.push(...order.items);
        }

        return acc;
      }, {});

      setCustomers(Object.values(grouped));
    };

    fetchCustomers();
  }, []);

  return (
    <div className="max-w-6xl p-10 pt-24 mx-auto">
      <h1 className="text-4xl font-black uppercase italic mb-10 tracking-tighter">
        Customer Base
      </h1>

      <div className="space-y-4">
        {customers.map((c: any) => (
          <div
            key={c.email}
            className="bg-white border-2 border-zinc-100 p-8 rounded-[2.5rem] flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white font-black text-xl">
                {c.name?.[0] || '?'}
              </div>

              <div>
                <h2 className="font-black text-xl uppercase tracking-tighter">
                  {c.name}
                </h2>

                <p className="text-zinc-400 font-bold text-xs flex items-center gap-1">
                  <Mail size={12} />
                  {c.email}
                </p>
              </div>
            </div>

            <div className="flex gap-10">
              <div className="text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase">
                  Orders
                </p>
                <p className="text-xl font-black">{c.orders}</p>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase">
                  Total Value
                </p>
                <p className="text-xl font-black">
                  ₦{Number(c.spent || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}