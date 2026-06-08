'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';

type Product = React.ComponentProps<typeof ProductDetailClient>['product'];

export default function ProductDetailFromRoute() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const parsedId = useMemo(() => {
    if (!id) return '';
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  useEffect(() => {
    const run = async () => {
      if (!parsedId) {
        setError('Missing product id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('id', parsedId)
        .single();

      if (queryError || !data) {
        setError('Product not found. Please return to the home page.');
        setProduct(null);
      } else {
        setProduct(data as Product);
      }

      setLoading(false);
    };

    run();
  }, [parsedId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-10 pt-24">
        <div className="text-zinc-500 font-bold">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto p-10 pt-24">
        <h1 className="text-2xl font-black uppercase">Product not found</h1>
        <p className="text-zinc-500 mt-2">{error ?? 'Please return to the home page.'}</p>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
