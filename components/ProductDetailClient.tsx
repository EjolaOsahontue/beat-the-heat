'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart, CartItem } from '@/lib/store';

type VariationOption = { value: string; stock: number };
type VariationGroup = { name: string; options: VariationOption[] };

type Product = {
  id: string;
  name: string;
  base_price: number;
  quantity: number;
  description?: string | null;
  images?: string[] | null;
  image_url?: string | null;
  category?: string | null;
  variations?: unknown;
};

type SelectedVariation = Record<string, string>;

function parseVariationGroups(input: unknown): VariationGroup[] {
  if (!Array.isArray(input)) return [];

  const groups: VariationGroup[] = [];

  for (const rawGroup of input) {
    if (!rawGroup || typeof rawGroup !== 'object') continue;

    const name = String((rawGroup as any).name ?? '').trim();
    if (!name) continue;

    const rawOptions = (rawGroup as any).options;

    if (Array.isArray(rawOptions) && rawOptions.length > 0) {
      const mapped = rawOptions
        .map((opt: any) => {
          const value = String(opt?.value ?? '').trim();
          const stock = Number(opt?.stock ?? 0);
          if (!value) return null;
          if (!Number.isFinite(stock) || stock < 0) return null;
          return { value, stock };
        })
        .filter(Boolean) as VariationOption[];

      if (mapped.length > 0) {
        groups.push({ name, options: mapped });
        continue;
      }
    }

    if (Array.isArray(rawOptions)) {
      const mapped = rawOptions
        .map((v) => String(v ?? '').trim())
        .filter(Boolean)
        .map((value) => ({ value, stock: 0 }));
      if (mapped.length > 0) groups.push({ name, options: mapped });
      continue;
    }

    if (typeof rawOptions === 'string') {
      const mapped = rawOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((value) => ({ value, stock: 0 }));
      if (mapped.length > 0) groups.push({ name, options: mapped });
      continue;
    }
  }

  return groups;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.addToCart);

  const price = parseFloat(String(product.base_price));

  const isOutOfStock = product.quantity <= 0;

  const images = useMemo(() => {
    const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (imgs.length > 0) return imgs;
    return product.image_url ? [product.image_url] : [];
  }, [product.images, product.image_url]);

  const variationGroups = useMemo(
    () => parseVariationGroups(product.variations),
    [product.variations],
  );

  const hasVariations = variationGroups.length > 0;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<SelectedVariation>({});

  useEffect(() => {
    setQuantity(1);
    const initial: SelectedVariation = {};
    for (const g of variationGroups) initial[g.name] = '';
    setSelectedVariation(initial);
  }, [product.id, variationGroups]);

  const selectedStock = useMemo(() => {
    if (!hasVariations) return Number(product.quantity || 0);

    let minStock = Number.POSITIVE_INFINITY;

    for (const group of variationGroups) {
      const selectedValue = selectedVariation[group.name];
      if (!selectedValue) return 0;

      const matched = group.options.find((o) => o.value === selectedValue);
      const stock = matched ? Number(matched.stock) : 0;

      if (!stock || stock <= 0) return 0;

      minStock = Math.min(minStock, stock);
    }

    if (!Number.isFinite(minStock)) return 0;
    return minStock;
  }, [hasVariations, product.quantity, variationGroups, selectedVariation]);

  const canAdd = useMemo(() => {
    if (!hasVariations) return !isOutOfStock && quantity >= 1 && quantity <= Number(product.quantity || 0);
    return selectedStock > 0 && quantity >= 1 && quantity <= selectedStock;
  }, [hasVariations, isOutOfStock, product.quantity, quantity, selectedStock]);

  useEffect(() => {
    if (!hasVariations) return;
    if (selectedStock <= 0) { setQuantity(1); return; }
    setQuantity((q) => Math.min(Math.max(1, q), selectedStock));
  }, [hasVariations, selectedStock]);

  const handleAdd = () => {
    if (!canAdd) return;

    const variantKey = hasVariations ? JSON.stringify(selectedVariation) : '{}';
    const skuId = `${product.id}-${variantKey}`;
    const skuName = hasVariations ? Object.values(selectedVariation).join(' / ') : 'Standard';

    // cartId is the same as skuId — unique per product+variant combination
    const cartItem: CartItem = {
      cartId: skuId,
      skuId,
      productId: product.id,
      productName: product.name,
      skuName,
      price,
      quantity,
      stock: selectedStock,
      image: images[0] || '',
      variantOptions: hasVariations ? selectedVariation : {},
    };

    addToCart(cartItem);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative group rounded-[2rem] overflow-hidden bg-white border-2 border-zinc-100">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  className="min-w-full snap-center bg-zinc-50 flex items-center justify-center h-[500px] lg:h-[700px]"
                >
                  <img
                    src={img}
                    className="max-w-full max-h-full object-contain p-4"
                    alt={`${product.name} view ${i + 1}`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0 focus:outline-none focus:ring-2 focus:ring-black"
                onClick={() => {
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: 'smooth' });
                  }
                }}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white border-2 border-zinc-100 rounded-[2rem] p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400">
                {product.category || 'Collection'}
              </p>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none mt-2">
                {product.name}
              </h1>
              <div className="mt-4 text-2xl font-black">
                {!isNaN(price) ? `₦${price.toLocaleString()}` : '—'}
              </div>
            </div>

            {product.description ? (
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            ) : null}

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  (hasVariations ? selectedStock <= 0 : isOutOfStock)
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-green-500'
                }`}
              />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {hasVariations
                  ? selectedStock <= 0
                    ? 'Out of Stock'
                    : `${selectedStock} available`
                  : isOutOfStock
                  ? 'Sold Out'
                  : `${product.quantity} units available`}
              </p>
            </div>

            {hasVariations ? (
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                  Select variations
                </p>

                {variationGroups.map((group) => (
                  <label key={group.name} className="block">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                      {group.name}
                    </div>
                    <select
                      className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold"
                      value={selectedVariation[group.name] ?? ''}
                      disabled={isOutOfStock}
                      onChange={(e) =>
                        setSelectedVariation((prev) => ({
                          ...prev,
                          [group.name]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select {group.name}</option>
                      {group.options.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.stock <= 0}>
                          {opt.value} {opt.stock <= 0 ? '(Out)' : `(${opt.stock})`}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            ) : null}

            <label className="block">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                Quantity
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="w-10 h-10 rounded-full border-2 border-zinc-200 hover:border-black active:scale-95 disabled:opacity-40"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  disabled={isOutOfStock || (hasVariations && selectedStock <= 0)}
                  onChange={(e) => {
                    const next = Number(e.target.value) || 1;
                    const cap = hasVariations ? selectedStock : Number(product.quantity || 0);
                    setQuantity(Math.min(Math.max(1, next), Math.max(0, cap)));
                  }}
                  className="w-full p-4 bg-zinc-50 rounded-2xl outline-none font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cap = hasVariations ? selectedStock : Number(product.quantity || 0);
                    setQuantity((q) => Math.min(q + 1, cap));
                  }}
                  disabled={
                    isOutOfStock ||
                    (hasVariations ? quantity >= selectedStock : quantity >= Number(product.quantity || 0))
                  }
                  className="w-10 h-10 rounded-full border-2 border-zinc-200 hover:border-black active:scale-95 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </label>

            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`
                w-full py-5 rounded-full font-black uppercase text-sm tracking-widest transition-all
                ${
                  !canAdd
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-2 border-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800 active:scale-95 shadow-xl'
                }
              `}
            >
              {hasVariations && selectedStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {hasVariations && selectedStock <= 0 ? (
              <div className="text-[11px] text-zinc-500 font-bold">
                Select valid variations to add this product.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}