"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      
      try {
        setOrdersLoading(true);

        // Corrected mapping column target to customer_email
        let { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });

        if (error && (error.message.includes("column") || error.code === "P0002")) {
          console.warn("Falling back to structural user_id relation lookup...");
          const fallback = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          data = fallback.data;
          error = fallback.error;
        }

        if (error) throw error;
        setOrders(data ?? []);

      } catch (err: any) {
        console.error("Database Matrix Error Details:", {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint
        });
      } finally {
        setOrdersLoading(false);
      }
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-8">
      {ordersLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin text-brand-text" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Your Orders</h1>
          
          {orders.length === 0 ? (
            <p className="text-brand-muted text-sm font-bold uppercase tracking-widest">No orders found.</p>
          ) : (
            orders.map((order) => {
              // 1. Format the ISO timestamp into a beautiful, readable date string
              const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              // 2. Defensive mapping for item blocks (matches order.items or order.cart_items structures)
              const orderItems = order.items || order.cart_items || [];

              return (
                <div key={order.id} className="p-6 bg-brand-surface border border-brand-border rounded-3xl space-y-6 shadow-xl">
                  
                  {/* HEADER AREA: Date & Fulfillment Status */}
                  <div className="flex justify-between items-center pb-4 border-b border-brand-border/40">
                    <div className="flex items-center gap-2 text-brand-muted">
                      <Calendar size={14} className="text-brand-text" />
                      <p className="text-xs font-black uppercase tracking-wider text-brand-muted">
                        Ordered On: <span className="text-brand-text">{orderDate}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-success-light text-success tracking-widest">
                      {order.status}
                    </span>
                  </div>

                  {/* ITEM LIST AREA: Exactly what they bought */}
                  <div className="space-y-4">
                    {orderItems.length === 0 ? (
                      <p className="text-xs text-brand-muted italic uppercase font-bold">Item details unavailable</p>
                    ) : (
                      orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-brand-bg/40 p-3 rounded-2xl border border-brand-border/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-bg rounded-xl border border-brand-border text-brand-text">
                              <ShoppingBag size={16} />
                            </div>
                            <div>
                              <h4 className="font-black uppercase italic tracking-tight text-sm text-brand-text">
                                {item.productName || item.name || "BTH+ Essential"}
                              </h4>
                              {/* Option properties check: Handles sizing or SKU variations */}
                              {(item.skuName || item.size || item.variant) && (
                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mt-0.5">
                                  Option: {item.skuName || item.size || item.variant}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs font-black text-brand-muted uppercase tracking-widest">
                            QTY: <span className="text-brand-text">{item.quantity || 1}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* FOOTER TOTAL */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Total Paid</span>
                    <p className="font-black text-xl italic tracking-tighter text-accent">₦{order.total_amount.toLocaleString()}</p>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}