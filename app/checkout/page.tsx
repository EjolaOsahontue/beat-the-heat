"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Loader2, User } from "lucide-react";
import PolicyModal from "@/components/PolicyModal";

declare global {
  interface Window {
    FlutterwaveCheckout: any;
    PaystackPop: any;
  }
}

// ⬇️ Toggle this to switch providers: "flutterwave" | "paystack"
const PAYMENT_PROVIDER: "flutterwave" | "paystack" = "paystack";

const handleStockDecrement = async (skuId: string, amountBought: number) => {
  const { data: sku, error: fetchError } = await supabase
    .from("product_skus")
    .select("quantity")
    .eq("id", skuId)
    .single();

  if (fetchError || !sku) {
    console.error("Could not find SKU for stock update:", skuId);
    throw new Error("SKU not found.");
  }

  const newQuantity = sku.quantity - amountBought;
  if (newQuantity < 0) throw new Error("Insufficient stock available.");

  const { error: updateError } = await supabase
    .from("product_skus")
    .update({ quantity: newQuantity })
    .eq("id", skuId);

  if (updateError) throw new Error("Stock update failed.");
};

const postPaymentActions = async ({
  paymentReference,
  transactionId,
  formData,
  cart,
  total,
  selectedShipping,
  user,
  provider,
  clearCart,
  router,
}: any) => {
  // 1. Insert order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        total_amount: total,
        currency: "NGN",
        payment_method: provider,
        payment_reference: paymentReference,
        payment_status: "paid",
        order_status: "pending",
        shipping_method_name: selectedShipping?.name || "Standard",
        shipping_cost: selectedShipping?.base_cost || 0,
        customer_id: user?.id ?? null,
        notes: `Delivery Address: ${formData.address} | Phone: ${formData.phone}${
          transactionId ? ` | Transaction ID: ${transactionId}` : ""
        }`,
      },
    ])
    .select()
    .single();

  if (orderError || !orderData) {
    console.error("Order insertion failure:", orderError);
    alert("Order save failed. Contact support with reference: " + paymentReference);
    return;
  }

  // 2. Insert order items
  const orderItemsPayload = cart.map((item: any) => ({
    order_id: orderData.id,
    product_id: item.productId || item.product_id || null,
    product_name: item.productName,
    sku_name: item.skuName || "Standard",
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) console.error("Order items failed to save:", itemsError);

  // 3. Decrement inventory
  const stockResults = await Promise.allSettled(
    cart.map((item: any) => handleStockDecrement(item.skuId, item.quantity))
  );
  stockResults.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Stock decrement failed for SKU ${cart[i].skuId}:`, (result as any).reason);
    }
  });

  // 4. Send confirmation email
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "paid",
        order: {
          id: orderData.id, // ✅ fixed: needed for shortId in email subject
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          phone: formData.phone,
          total_amount: total,
          shipping_method_name: selectedShipping?.name || "Standard",
          items: cart.map((item: any) => ({ // ✅ fixed: mapped to expected shape
            quantity: item.quantity,
            productName: item.productName,
            skuName: item.skuName,
            price: item.price,
          })),
        },
      }),
    });
  } catch (emailErr) {
    console.error("Email endpoint failure:", emailErr);
  }

  clearCart();
  router.push(user ? "/account" : "/");
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + (selectedShipping?.base_cost || 0);

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || "";
      const [first = "", ...rest] = fullName.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: first,
        lastName: rest.join(" "),
        email: user.email || "",
      }));
    }
  }, [user]);

  // Load payment script based on active provider
  useEffect(() => {
    const scriptSrc =
      PAYMENT_PROVIDER === "flutterwave"
        ? "https://checkout.flutterwave.com/v3.js"
        : "https://js.paystack.co/v1/inline.js";

    const isLoaded =
      PAYMENT_PROVIDER === "flutterwave"
        ? !!window.FlutterwaveCheckout
        : !!window.PaystackPop;

    if (isLoaded) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Fetch shipping methods
  useEffect(() => {
    const fetchShipping = async () => {
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .order("base_cost", { ascending: true });

      if (error) {
        console.error("Error fetching shipping methods:", error);
        return;
      }

      if (data && data.length > 0) {
        setShippingMethods(data);
        setSelectedShipping(data[0]);
      }
    };
    fetchShipping();
  }, []);

  const handleFlutterwaveCheckout = () => {
    const flwKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY;
    if (!flwKey) {
      alert("Payment configuration error. Please contact support.");
      return;
    }

    window.FlutterwaveCheckout({
      public_key: flwKey,
      tx_ref: `BTH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      amount: total,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd",
      customer: {
        email: formData.email,
        phone_number: formData.phone,
        name: `${formData.firstName} ${formData.lastName}`,
      },
      customizations: {
        title: "BTH Apparels",
        description: `Order of ${cart.length} item(s)`,
        logo: "/logo.png",
      },
      meta: {
        address: formData.address,
        items: JSON.stringify(cart),
      },
      onclose: () => setLoading(false),
      callback: (response: any) => {
        if (response.status !== "successful" && response.status !== "completed") {
          setLoading(false);
          alert("Payment was not completed. Please try again.");
          return;
        }
        setLoading(false);
        postPaymentActions({
          paymentReference: response.tx_ref,
          transactionId: String(response.transaction_id),
          formData,
          cart,
          total,
          selectedShipping,
          user,
          provider: "flutterwave",
          clearCart,
          router,
        }).catch((err) => {
          console.error("Post-payment error:", err);
          alert("An error occurred after payment. Please contact support.");
        });
      },
    });
  };

  const handlePaystackCheckout = () => {
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      alert("Payment configuration error. Please contact support.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: formData.email,
      amount: Math.round(total * 100),
      currency: "NGN",
      metadata: {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        phone: formData.phone,
        items: cart,
      },
      onClose: () => setLoading(false),
      callback: (response: any) => {
        setLoading(false);
        postPaymentActions({
          paymentReference: response.reference,
          transactionId: null,
          formData,
          cart,
          total,
          selectedShipping,
          user,
          provider: "paystack",
          clearCart,
          router,
        }).catch((err) => {
          console.error("Post-payment error:", err);
          alert("An error occurred after payment. Reference: " + response.reference);
        });
      },
    });

    handler.openIframe();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const isReady =
      PAYMENT_PROVIDER === "flutterwave"
        ? scriptLoaded && window.FlutterwaveCheckout
        : scriptLoaded && window.PaystackPop;

    if (!isReady) {
      alert("Payment gateway is still loading. Please try again.");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address ||
      !formData.phone
    ) {
      alert("Please fill in all delivery details.");
      return;
    }

    setLoading(true);

    try {
      if (PAYMENT_PROVIDER === "flutterwave") {
        handleFlutterwaveCheckout();
      } else {
        handlePaystackCheckout();
      }
    } catch (error) {
      console.error("Payment setup error:", error);
      alert("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 bg-brand-bg text-brand-text">
      <Link
        href="/"
        className="flex items-center gap-2 text-xs font-black uppercase text-brand-muted mb-8 hover:text-brand-text"
      >
        <ChevronLeft size={14} /> Back to Store
      </Link>

      {user && (
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-muted bg-brand-surface px-5 py-3 rounded-2xl mb-8 w-fit">
          <User size={13} />
          Checking out as{" "}
          <span className="text-brand-text">{user.email}</span> — order will
          appear in your account
        </div>
      )}

      <form
        onSubmit={handleCheckout}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16"
      >
        {/* LEFT: Form */}
        <div className="space-y-12">
          {/* Delivery Details */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted">
              01. Delivery Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="First Name"
                value={formData.firstName}
                className="p-4 bg-brand-surface rounded-2xl outline-none border border-transparent focus:border-brand-text"
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <input
                required
                placeholder="Last Name"
                value={formData.lastName}
                className="p-4 bg-brand-surface rounded-2xl outline-none border border-transparent focus:border-brand-text"
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <input
              required
              type="email"
              placeholder="Email"
              value={formData.email}
              className="w-full p-4 bg-brand-surface rounded-2xl outline-none border border-transparent focus:border-brand-text"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              required
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              className="w-full p-4 bg-brand-surface rounded-2xl outline-none border border-transparent focus:border-brand-text"
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <textarea
              required
              placeholder="Shipping Address"
              value={formData.address}
              className="w-full p-4 bg-brand-surface rounded-2xl outline-none border border-transparent focus:border-brand-text"
              rows={3}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </section>

          {/* Shipping Method */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted">
              02. Shipping Method
            </h2>
            {shippingMethods
              .filter((m) => m.is_active !== false)
              .map((m) => (
                <label
                  key={m.id}
                  className={`flex justify-between p-5 border-2 rounded-2xl cursor-pointer transition-colors ${
                    selectedShipping?.id === m.id
                      ? "border-brand-text bg-brand-surface"
                      : "border-brand-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      checked={selectedShipping?.id === m.id}
                      className="accent-brand-text"
                      onChange={() => setSelectedShipping(m)}
                    />
                    <div>
                      <p className="font-black text-sm uppercase">{m.name}</p>
                      <p className="text-[10px] text-brand-muted font-bold uppercase">
                        {m.estimated_days || "Standard Shipping"}
                      </p>
                    </div>
                  </div>
                  <p className="font-black">
                    ₦{(m.base_cost || 0).toLocaleString()}
                  </p>
                </label>
              ))}
          </section>

          {/* Policy notice + Pay button */}
          <div className="space-y-4">
            <p className="text-sm text-red-500 font-black uppercase tracking-wider text-center">
              By placing your order you agree to our{" "}
              <button
                type="button"
                onClick={() => setShowPolicies(true)}
                className="underline underline-offset-4 hover:text-red-700 transition-colors"
              >
                STORE POLICIES
              </button>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-text text-brand-bg py-6 rounded-[2rem] font-black uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                `Pay ₦${total.toLocaleString()}`
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-brand-surface p-10 rounded-[3rem] h-fit sticky top-32 border border-brand-border/40">
          <h2 className="text-xl font-black uppercase italic mb-8">Summary</h2>
          <div className="space-y-6">
            {cart.map((item, index) => (
              <div
                key={item.cartId || `fallback-${index}`}
                className="flex justify-between items-start"
              >
                <div>
                  <p className="font-black uppercase text-sm">
                    {item.productName}{" "}
                    <span className="text-brand-subtle font-bold ml-1">
                      ×{item.quantity}
                    </span>
                  </p>
                  {item.skuName && item.skuName !== "Standard" && (
                    <p className="text-[10px] text-brand-muted font-bold uppercase">
                      {item.skuName}
                    </p>
                  )}
                </div>
                <p className="font-black text-sm">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-border mt-8 pt-8 space-y-2">
            <div className="flex justify-between text-xs font-bold text-brand-muted uppercase">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-brand-muted uppercase">
              <span>Shipping</span>
              <span>
                ₦{(selectedShipping?.base_cost || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-end pt-4">
              <span className="font-black text-xl uppercase italic">Total</span>
              <span className="font-brand-text text-3xl">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Policy Modal */}
      {showPolicies && <PolicyModal onClose={() => setShowPolicies(false)} />}
    </div>
  );
}