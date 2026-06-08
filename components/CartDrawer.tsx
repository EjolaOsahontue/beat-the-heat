'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/store';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer({ isOpen, onClose }: any) {
  const {
    cart,
    removeFromCart,
    clearCart,
    updateQuantity,
  } = useCart();

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
          />

          {/* DRAWER CONTAINER */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-surface text-brand-text z-[101] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)] border-l border-brand-border"
          >
            {/* HEADER */}
            <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-surface">
              <h2 className="font-black uppercase italic tracking-tighter text-xl">
                Your Bag ({cart.length})
              </h2>

              <div className="flex items-center gap-6">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] font-black uppercase tracking-widest text-critical hover:opacity-70 transition-opacity"
                  >
                    Empty Bag
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-text">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-brand-bg">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} className="text-brand-subtle" />
                  <p className="font-black uppercase italic text-xs tracking-widest text-brand-muted">Your bag is empty</p>
                </div>
              ) : (
                cart.map((item, index) => {
                  const isAtMax = item.quantity >= item.stock;
                  const itemKey = item.cartId || `${item.skuId}-${index}`;

                  return (
                    <div key={itemKey} className="flex gap-6 group p-4 rounded-2xl bg-brand-surface border border-brand-border/40 shadow-md">
                      <div className="w-24 h-32 bg-brand-bg rounded-xl overflow-hidden flex-shrink-0 border border-brand-border">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={item.productName}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-black uppercase italic tracking-tighter leading-none text-base">
                              {item.productName}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.cartId)}
                              className="text-brand-muted hover:text-brand-text transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-[9px] font-bold text-brand-muted uppercase mt-1.5 tracking-wider">
                            {item.skuName}
                          </p>
                          <p className="font-black text-sm mt-3 text-accent drop-shadow-sm">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* QUANTITY CONTROL */}
                          <div className="flex items-center gap-4 bg-brand-bg px-4 py-2 rounded-full border border-brand-border">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.cartId, item.quantity - 1);
                               } else {
                                  removeFromCart(item.cartId);
                                }
                              }}
                              className="hover:scale-110 active:scale-90 transition-transform text-brand-muted hover:text-brand-text"
                            >
                              <Minus size={12} />
                            </button>

                            <span className="font-black text-xs w-4 text-center text-brand-text">{item.quantity}</span>

                            <button
                              disabled={isAtMax}
                              onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                              className={`hover:scale-110 active:scale-90 transition-transform text-brand-muted hover:text-brand-text ${isAtMax ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {isAtMax && (
                            <span className="text-[8px] font-black uppercase text-warning tracking-wider animate-pulse">Limit Reached</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-brand-border bg-brand-surface space-y-6 shadow-[0_-15px_30px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Subtotal</span>
                  <span className="text-2xl font-black italic tracking-tighter text-brand-text">₦{total.toLocaleString()}</span>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full bg-accent text-brand-bg text-center py-6 rounded-full font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-shadow-sm"
                >
                  Initiate Checkout
                </Link>
                
                <p className="text-[9px] text-center font-bold text-brand-muted uppercase tracking-widest">
                  Shipping & taxes calculated at next step
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}