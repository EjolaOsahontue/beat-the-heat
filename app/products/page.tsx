import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

// FIX 1: Force Next.js to bypass build-time caching and fetch fresh data on every page view
export const revalidate = 0; 
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // Debug validation for hosted servers: Ensures database configurations are actually readable
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="p-10 text-critical font-bold uppercase text-xs tracking-wider">
        Deployment Configuration Error: Supabase Environment Keys are missing on host.
      </div>
    );
  }

  const { data: allProducts, error } = await supabase
    .from('products')
    .select('*')
    .limit(1000);

  if (error) {
    return (
      <div className="p-10 text-critical font-bold uppercase text-sm tracking-wider">
        Database Error: {error.message}
      </div>
    );
  }

  const products = allProducts ?? [];

  if (products.length === 0) {
    return (
      <div className="p-10 text-center text-muted font-bold uppercase text-xs tracking-widest">
        No products found in live database.
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 text-foreground bg-background">
      {/* Section Header */}
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">
            Shop the Collection
          </h2>
          <p className="text-muted mt-2 font-medium text-xs uppercase tracking-wider">
            All available pieces ({products.length})
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) =>
          product?.id ? <ProductCard key={product.id} product={product} /> : null
        )}
      </section>
    </main>
  );
}