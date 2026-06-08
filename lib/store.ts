import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  cartId: string;
  skuId: string;
  productId: string;
  productName: string;
  skuName: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  variantOptions: Record<string, string>;
};

interface CartState {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartId'> & { variantOptions?: Record<string, string> }) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (newItem) => set((state) => {
        // Generate deterministic cartId from skuId + variantOptions
        const variantKey = newItem.variantOptions ? JSON.stringify(newItem.variantOptions) : '{}';
        const cartId = `${newItem.skuId}-${variantKey}`;

        const existing = state.cart.find((i) => i.cartId === cartId);

        if (existing) {
          return {
            cart: state.cart.map((i) =>
              i.cartId === cartId
                ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
                : i
            ),
          };
        }

        // Build complete CartItem with generated cartId
        const cartItem: CartItem = {
          ...newItem,
          cartId,
          variantOptions: newItem.variantOptions || {},
        };

        return { cart: [...state.cart, cartItem] };
      }),
      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter((i) => i.cartId !== cartId),
      })),
      updateQuantity: (cartId, qty) => set((state) => ({
        cart: state.cart.map((i) =>
          i.cartId === cartId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i
        ),
      })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'BTH-cart-v2' }
  )
);