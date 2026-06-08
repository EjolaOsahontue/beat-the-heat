"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, 
  RefreshCw, 
  ShoppingCart, 
  Loader2
} from "lucide-react";

export default function AdminAnalyticsDashboard() {
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, order_status, created_at");

      if (error) throw error;
      setOrdersList(data ?? []);
    } catch (err: any) {
      console.error("Error fetching admin metrics:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
  }, []);

  // ─── STATUS MATCHING UNIONS ───
  const successStates = ["success", "completed", "delivered", "paid", "shipped", "new"];
  const refundStates = ["refunded", "reversed"];

  const totalOrdersCount = ordersList.length;
  
  const successfulOrders = ordersList.filter(o => successStates.includes(o.order_status?.toLowerCase()));
  const refundedOrders = ordersList.filter(o => refundStates.includes(o.order_status?.toLowerCase()));
  const pendingOrders = ordersList.filter(o => 
    !successStates.includes(o.order_status?.toLowerCase()) && 
    !refundStates.includes(o.order_status?.toLowerCase())
  );

  // Financial Calculations
  const netRevenue = successfulOrders.reduce((acc, order) => acc + Number(order.total_amount || 0), 0);
  const totalRefundedAmount = refundedOrders.reduce((acc, order) => acc + Number(order.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex justify-center items-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text p-8 space-y-10">
      
      {/* HEADER */}
      <header className="border-b border-brand-border pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted mb-2">
          Management Engine / Financials
        </p>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">
          Business Analytics
        </h1>
      </header>

      {/* CORE ANALYSIS METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REVENUE */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Net Revenue</span>
            <div className="p-2 bg-brand-bg text-accent rounded-xl border border-brand-border">
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-text drop-shadow-md">
            ₦{netRevenue.toLocaleString()}
          </h2>
          <p className="text-[9px] text-brand-muted uppercase font-bold tracking-wider mt-3">
            Includes Shipped & New Orders
          </p>
        </div>

        {/* TOTAL FLOW VOLUME */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Gross Transactions</span>
            <div className="p-2 bg-brand-bg text-accent rounded-xl border border-brand-border">
              <ShoppingCart size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-brand-text drop-shadow-md">
            {totalOrdersCount}
          </h2>
          <p className="text-[9px] text-brand-muted font-bold uppercase tracking-wider mt-3">
            Total logs generated in table
          </p>
        </div>

        {/* REFUNDS DEFICIT */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Refund Deficit</span>
            <div className="p-2 bg-brand-bg text-critical rounded-xl border border-brand-border">
              <RefreshCw size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-critical drop-shadow-md">
            ₦{totalRefundedAmount.toLocaleString()}
          </h2>
          <p className="text-[9px] text-critical/80 font-bold uppercase tracking-wider mt-3">
            Excluded from Revenue calculations
          </p>
        </div>

      </section>

      {/* STATUS DISTRIBUTION */}
      <section className="bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-wider mb-6 border-b border-brand-border/40 pb-4 text-brand-text">
          Status Segment Distribution
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Active Revenue Volume</p>
            <p className="text-xl font-black mt-1 text-emerald-400">{successfulOrders.length} Orders</p>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Refunded Losses</p>
            <p className="text-xl font-black mt-1 text-critical">{refundedOrders.length} Orders</p>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Unprocessed / Failed</p>
            <p className="text-xl font-black mt-1 text-brand-muted">{pendingOrders.length} Orders</p>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Store Conversion Efficiency</p>
            <p className="text-xl font-black mt-1 text-accent">
              {totalOrdersCount > 0 ? ((successfulOrders.length / totalOrdersCount) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}