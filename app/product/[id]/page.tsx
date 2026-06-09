export const runtime = 'edge'
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/store';
import { ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<any>(null);
  const [skus, setSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentSku, setCurrentSku] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [p, s] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_skus').select('*').eq('product_id', id)
      ]);
      setProduct(p.data);

      const normalizedSkus = (s.data || []).map((sku: any) => {
        let vo = sku.variant_options || {};
        if (typeof vo === 'string') {
          try { vo = JSON.parse(vo); } catch { vo = {}; }
        }
        return { ...sku, variant_options: vo };
      });

      setSkus(normalizedSkus);

      const firstInStock =
        normalizedSkus.find((sku: any) => sku.quantity > 0) || normalizedSkus[0];
      if (firstInStock?.variant_options) {
        setSelectedOptions(firstInStock.variant_options);
      }
      loading && setLoading(false);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (skus.length > 0) {
      const match = skus.find(s =>
        Object.entries(selectedOptions).every(
          ([key, value]) => s.variant_options[key] === value
        )
      );
      setCurrentSku(match || null);
    }
  }, [selectedOptions, skus]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(
        scrollRef.current.scrollLeft / scrollRef.current.clientWidth
      );
      setActiveImageIndex(index);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const isOptionDisabled = (key: string, value: string) => {
    const potentialMatch = skus.find(
      s => s.variant_options[key] === value && s.quantity > 0
    );
    return !potentialMatch;
  };

  const getAvailableValuesForKey = (key: string): string[] => {
    return Array.from(
      new Set(
        skus
          .filter(s => {
            return Object.entries(selectedOptions).every(([k, v]) => {
              if (k === key) return true;
              if (!v) return true;
              return s.variant_options[k] === v;
            });
          })
          .map(s => s.variant_options[key])
          .filter(Boolean)
      )
    );
  };

  const handleAddToCart = () => {
    if (!currentSku || currentSku.quantity <= 0) return;
    addToCart({
      skuId: currentSku.id,
      productId: product.id,
      productName: product.name,
      skuName: currentSku.sku_name,
      price: currentSku.price || product.base_price,
      quantity: 1,
      stock: currentSku.quantity,
      image: product.images?.[0] || '',
      variantOptions: selectedOptions
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase text-3xl italic animate-pulse tracking-tighter text-brand-text">
        BTH
      </div>
    );
  }

  const variantKeys = Array.from(
    new Set(skus.flatMap(s => Object.keys(s.variant_options || {})))
  );

  const stockLevel =
    currentSku?.quantity > 0
      ? currentSku.quantity <= 3
        ? 'critical'
        : currentSku.quantity <= 10
        ? 'low'
        : 'ok'
      : 'out';

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 lg:py-40 flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-32 bg-brand-bg text-brand-text">

      {/* ─── LEFT: GALLERY ─── */}
      <div className="space-y-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-[10px] font-black uppercase text-brand-muted mb-4 hover:text-brand-text transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main scrollable gallery */}
        <div className="relative group/gallery">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-[2.5rem] bg-brand-surface border border-brand-border"
          >
            {product.images?.map((img: string, i: number) => (
              <div
                key={i}
                className="min-w-full snap-center flex items-center justify-center h-[500px] lg:h-[750px] p-8 lg:p-12"
              >
                <img
                  src={img}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  alt={`${product.name} — view ${i + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Nav arrows */}
          {product.images?.length > 1 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-brand-bg/90 backdrop-blur-md p-4 rounded-full shadow-xl opacity-0 group-hover/gallery:opacity-100 transition-all hover:scale-110 active:scale-95 text-brand-text"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-brand-bg/90 backdrop-blur-md p-4 rounded-full shadow-xl opacity-0 group-hover/gallery:opacity-100 transition-all hover:scale-110 active:scale-95 text-brand-text"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {product.images?.length > 1 && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-1 pb-1">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => scrollToImage(i)}
                className={`flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300
                  ${activeImageIndex === i
                    ? 'border-brand-text scale-105 shadow-md'
                    : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt={`Thumbnail ${i + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── RIGHT: PRODUCT INFO ─── */}
      <div className="lg:sticky lg:top-40 h-fit space-y-10">

        {/* Name + Price */}
        <div className="space-y-5">
          {product.ribbon && (
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-brand-bg bg-accent px-3 py-1 rounded-full">
              {product.ribbon}
            </span>
          )}

          <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-[0.85]">
            {product.name}
          </h1>

          <div className="flex items-end gap-4">
            <p className="text-4xl font-black italic tracking-tighter leading-none">
              ₦{Number(currentSku?.price || product.base_price).toLocaleString()}
            </p>

            {stockLevel === 'critical' && (
              <span className="text-[9px] font-black uppercase text-critical bg-critical-light px-3 py-1 rounded-full animate-pulse">
                Only {currentSku.quantity} left
              </span>
            )}
            {stockLevel === 'low' && (
              <span className="text-[9px] font-black uppercase text-warning bg-warning-light px-3 py-1 rounded-full">
                Low stock
              </span>
            )}
            {stockLevel === 'out' && (
              <span className="text-[9px] font-black uppercase text-brand-muted bg-brand-surface px-3 py-1 rounded-full">
                Sold out
              </span>
            )}
          </div>

          <p className="text-brand-muted font-medium text-[11px] uppercase tracking-wider leading-relaxed max-w-md border-l-2 border-brand-border pl-6">
            {product.description}
          </p>
        </div>

        {/* ─── VARIATION SELECTORS ─── */}
        <div className="space-y-8">
          {variantKeys.map(key => {
            const allValues = Array.from(
              new Set(skus.map(s => s.variant_options[key]).filter(Boolean))
            );
            const availableValues = getAvailableValuesForKey(key);
            const isColorKey = key.toLowerCase() === 'color' || key.toLowerCase() === 'colour';

            return (
              <div key={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-muted">
                    Variant
                  </p>
                  {selectedOptions[key] ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text bg-brand-surface px-3 py-1 rounded-full">
                      {selectedOptions[key]}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-brand-subtle uppercase">
                      Select one
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {allValues.map(val => {
                    const isSelected = selectedOptions[key] === val;
                    const isDisabled = !availableValues.includes(val) || isOptionDisabled(key, val);

                    if (isColorKey) {
                      return (
                        <button
                          key={val}
                          disabled={isDisabled}
                          title={val}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [key]: val }))}
                          className={`w-10 h-10 rounded-full border-4 transition-all duration-200 flex items-center justify-center
                            ${isSelected ? 'border-brand-text scale-110 shadow-lg' : 'border-transparent hover:border-brand-subtle'}
                            ${isDisabled ? 'opacity-25 cursor-not-allowed' : ''}
                          `}
                          style={{ backgroundColor: val.toLowerCase() }}
                        >
                          {isSelected && (
                            <Check size={14} strokeWidth={3} className="text-white drop-shadow" />
                          )}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={val}
                        disabled={isDisabled}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [key]: val }))}
                        className={`
                          relative min-w-[80px] px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest
                          transition-all duration-200 border-2 select-none
                          ${isSelected
                            ? 'bg-accent text-brand-bg border-accent shadow-[0_12px_28px_rgba(255,240,243,0.15)] scale-105 z-10'
                            : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-text hover:bg-brand-bg hover:text-brand-text hover:scale-105'
                          }
                          ${isDisabled
                            ? 'opacity-25 cursor-not-allowed scale-100 hover:scale-100 hover:border-brand-border hover:bg-brand-surface hover:text-brand-muted line-through border-dashed'
                            : ''
                          }
                        `}
                      >
                        {val}
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                            <Check size={9} strokeWidth={3} className="text-brand-bg" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-brand-border" />
              </div>
            );
          })}
        </div>

        {/* ─── ADD TO BAG ─── */}
        <div className="space-y-5 pt-2">
          <button
            disabled={!currentSku || currentSku.quantity <= 0}
            onClick={handleAddToCart}
            className={`
              w-full py-8 rounded-full font-black uppercase tracking-[0.2em] text-xs
              shadow-[0_24px_50px_rgba(255,240,243,0.1)] active:scale-95 transition-all duration-300
              flex items-center justify-center gap-4 overflow-hidden relative group
              disabled:opacity-25 disabled:grayscale disabled:cursor-not-allowed
              ${addedFeedback ? 'bg-success text-brand-muted' : 'bg-accent text-brand-bg'}
            `}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

            {addedFeedback ? (
              <>
                <Check size={18} className="relative z-10" strokeWidth={3} />
                <span className="relative z-10">Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} className="relative z-10" />
                <span className="relative z-10">
                  {!currentSku
                    ? 'Select Options'
                    : currentSku.quantity <= 0
                    ? 'Out of Stock'
                    : 'Add to Bag'}
                </span>
              </>
            )}
          </button>

          {variantKeys.some(k => !selectedOptions[k]) && (
            <p className="text-center text-[10px] font-bold uppercase text-warning tracking-widest animate-pulse">
              Please select all options above
            </p>
          )}

          <div className="flex justify-center items-center gap-4">
            <div className="h-px bg-brand-border flex-1" />
            <p className="text-[8px] font-black uppercase text-brand-subtle tracking-[0.4em]">
              BTH + © 2026
            </p>
            <div className="h-px bg-brand-border flex-1" />
          </div>
        </div>

      </div>
    </div>
  );
}