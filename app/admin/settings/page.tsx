'use client';
import { ShieldCheck, Bell, CreditCard, Store } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="max-w-4xl p-10 pt-24 mx-auto">
      <h1 className="text-4xl font-black uppercase italic mb-10 tracking-tighter">Settings</h1>
      
      <div className="bg-white border-2 border-zinc-100 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Store className="text-zinc-400" />
            <div>
              <p className="font-black uppercase text-sm">Store Status</p>
              <p className="text-xs text-zinc-400 font-bold">Currently accepting orders</p>
            </div>
          </div>
          <div className="w-12 h-6 bg-green-500 rounded-full p-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
        </div>

        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CreditCard className="text-zinc-400" />
            <div>
              <p className="font-black uppercase text-sm">Payment Gateway</p>
              <p className="text-xs text-zinc-400 font-bold">FLUTTERWAVE (Live Mode)</p>
            </div>
          </div>
          <button className="text-[10px] font-black bg-zinc-100 px-4 py-2 rounded-full uppercase">Configure</button>
        </div>

        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-zinc-400" />
            <div>
              <p className="font-black uppercase text-sm">Admin Access</p>
              <p className="text-xs text-zinc-400 font-bold">Secure Session Active</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-red-500 uppercase underline">Logout All Devices</button>
        </div>
      </div>
    </div>
  );
}