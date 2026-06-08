'use client';

import { useCart, CartItem } from '@/lib/store';

export default function AddToCartBtn({ product }: { product: any }) {
  const addToCart = useCart((state) => state.addToCart);
  const isOutOfStock = product.quantity <= 0;

  const image = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.image_url || '';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const item: CartItem = {
      skuId: product.id,
      productId: product.id,
      productName: product.name,
      skuName: 'Standard',
      price: Number(product.base_price),
      quantity: 1,
      stock: product.quantity,
      image,
      variantOptions: {},
    } as any;

    addToCart(item);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className={`w-full py-6 rounded-full font-bold uppercase transition-all tracking-widest text-xs active:scale-95 disabled:scale-100 ${
        isOutOfStock
          ? 'bg-foreground text-muted border border-border cursor-not-allowed opacity-40'
          : 'bg-foreground text-background hover:bg-claret hover:text-white'
      }`}
    >
      {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
    </button>
  );
}