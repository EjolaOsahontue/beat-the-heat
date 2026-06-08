'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, XCircle, RotateCcw, Loader2, Trash2 } from 'lucide-react';

type OrderStatus = 'paid' | 'shipped' | 'cancelled' | 'refunded';

const TABS: { key: OrderStatus | 'cancelled'; label: string }[] = [
  { key: 'paid',      label: 'New Orders' },
  { key: 'shipped',   label: 'Shipped'    },
  { key: 'cancelled', label: 'Cancelled'  },
];

const getCardStyles = (status: string, refunded: boolean) => {
  if (status === 'cancelled' && refunded) return 'bg-purple-50 border-purple-200 opacity-80';
  switch (status) {
    case 'shipped':   return 'bg-green-50 border-green-200';
    case 'cancelled': return 'bg-red-50 border-red-200 opacity-70';
    case 'paid':
    case 'pending':
    default:          return 'bg-zinc-50 border-zinc-200';
  }
};

const getStatusBadgeStyles = (status: string, refunded: boolean) => {
  if (status === 'cancelled' && refunded) return 'bg-purple-500 text-white border-purple-600';
  switch (status) {
    case 'shipped':   return 'bg-green-500 text-white border-green-600';
    case 'cancelled': return 'bg-red-500 text-white border-red-600';
    default:          return 'bg-black text-white border-black';
  }
};

const getTabActiveStyles = (key: string) => {
  switch (key) {
    case 'shipped':   return 'bg-green-500 text-white border-green-500';
    case 'cancelled': return 'bg-red-500 text-white border-red-500';
    default:          return 'bg-black text-white border-black';
  }
};

const getCountBadgeStyles = (key: string) => {
  switch (key) {
    case 'shipped':   return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default:          return 'bg-zinc-200 text-zinc-800';
  }
};

export default function AdminOrders() {

  // ======================================================
  // STATE
  // ======================================================
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('paid');

  // ======================================================
  // FETCH ORDERS (FIXED RELATION JOIN)
  // ======================================================
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      // FIXED: Selected from orders and joined child rows inside order_items relational table
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading admin orders:', error.message);
      return;
    }

    if (data) {
      setOrders(data);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ======================================================
  // UPDATE STATUS
  // ======================================================
  const handleAction = async (
    order: any,
    newStatus: 'shipped' | 'cancelled' | 'refunded'
  ) => {
    try {
      setLoadingId(order.id);

      // FIXED: Modified table column target to update 'order_status' and 'payment_status'
      const updatePayload: any = { order_status: newStatus };
      if (newStatus === 'refunded') {
        updatePayload.payment_status = 'refunded';
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id);

      if (error) throw error;

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newStatus,
          order: {
            ...order,
            order_status: newStatus,
            items: (order.order_items || []).map((item: any) => ({
              ...item,
              productName: item.product_name || 'Item',
            })),
          },
        }),
      });

      await fetchOrders();

    } catch (err: any) {
      alert('Action failed: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // ======================================================
  // DELETE ORDER
  // ======================================================
  const handleDelete = async (orderId: string) => {
    const confirmed = confirm('Permanently delete this order? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingId(orderId);

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();

    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // DERIVED (FIXED COLUMN MAPPING FILTER)
  // ======================================================
  const grouped = {
    // Treat 'pending' or 'paid' order_status variables as New Orders tab values
    paid:      orders.filter((o) => o.order_status === 'paid' || o.order_status === 'pending' || !o.order_status),
    shipped:   orders.filter((o) => o.order_status === 'shipped'),
    cancelled: orders.filter((o) => o.order_status === 'cancelled' || o.order_status === 'refunded' || o.payment_status === 'refunded'),
  };

  const visibleOrders = grouped[activeTab as keyof typeof grouped] ?? [];

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="max-w-6xl mx-auto p-8 pt-20">

      {/* HEADER */}
      <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2">
        Order Management
      </h1>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-10">
        {orders.length} total orders
      </p>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tab) => {
          const count = (grouped[tab.key as keyof typeof grouped] || []).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full border-2
                text-[11px] font-black uppercase tracking-wider
                transition-all duration-200
                ${isActive
                  ? getTabActiveStyles(tab.key)
                  : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                }
              `}
            >
              {tab.label}
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : getCountBadgeStyles(tab.key)}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {visibleOrders.length === 0 && (
        <div className="border border-dashed border-zinc-200 rounded-[2rem] p-16 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
            No {TABS.find((t) => t.key === activeTab)?.label} Orders
          </p>
        </div>
      )}

      {/* ORDER CARDS */}
      <div className="space-y-6">
        {visibleOrders.map((order) => {
          const currentStatus = order.order_status || 'paid';
          const isRefunded = order.payment_status === 'refunded' || currentStatus === 'refunded';
          const isDeleting = deletingId === order.id;
          const isLoading = loadingId === order.id;

          return (
            <div
              key={order.id}
              className={`border-2 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between gap-8 transition-all duration-500 ${getCardStyles(currentStatus, isRefunded)}`}
            >

              {/* LEFT SIDE CONTENT */}
              <div className="space-y-4 flex-1">

                {/* BADGES */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-white border border-zinc-200 rounded-full shadow-sm">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full border shadow-sm ${getStatusBadgeStyles(currentStatus, isRefunded)}`}>
                    {isRefunded ? 'Refunded' : currentStatus}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    }) : 'Recent'}
                  </span>
                </div>

                {/* CUSTOMER CARD DETAILED INFO */}
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">
                    {order.customer_name}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
                    {order.customer_email}
                  </p>
                  {/* Pull context string info embedded in Notes string if standard address column structure isn't populated */}
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">
                    {order.notes || 'No shipping details provided.'}
                  </p>
                </div>

                {/* ITEMS MAPPING GRID */}
                <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-zinc-100">
                  {(order.order_items || []).map((item: any, i: number) => {
                    const label = item.product_name || 'Unknown Product';
                    return (
                      <p key={item.id || i} className="text-[10px] font-black uppercase text-zinc-600">
                        {item.quantity}x {label}
                        {item.sku_name && item.sku_name !== 'Standard' && <> — {item.sku_name}</>}
                      </p>
                    );
                  })}
                </div>

              </div>

              {/* RIGHT SIDE VALUE AND ACTIONS PANEL */}
              <div className="flex flex-col items-end justify-between gap-6 min-w-[240px]">

                {/* TOTAL */}
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Total Amount
                  </p>
                  <p className="text-4xl font-black italic tracking-tighter">
                    ₦{Number(order.total_amount || 0).toLocaleString()}
                  </p>
                </div>

                {/* DYNAMIC ACTIONS */}
                <div className="flex flex-wrap gap-2 justify-end">

                  {/* SHIP */}
                  {(currentStatus === 'paid' || currentStatus === 'pending') && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(order, 'shipped')}
                      className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Package size={14} />}
                      Mark Shipped
                    </button>
                  )}

                  {/* CANCEL */}
                  {(currentStatus === 'paid' || currentStatus === 'pending' || currentStatus === 'shipped') && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(order, 'cancelled')}
                      className="bg-white text-red-500 border border-red-200 px-6 py-3 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Cancel Order
                    </button>
                  )}

                  {/* REFUND */}
                  {currentStatus === 'cancelled' && !isRefunded && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleAction(order, 'refunded')}
                      className="bg-purple-100 text-purple-700 border border-purple-200 px-6 py-3 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-purple-200 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={14} />}
                      Mark Refunded
                    </button>
                  )}

                  {/* DESTRUCTION DELETE BUTTON */}
                  <button
                    disabled={isDeleting}
                    onClick={() => handleDelete(order.id)}
                    className="bg-white text-zinc-400 border border-zinc-200 px-4 py-3 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>

                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}