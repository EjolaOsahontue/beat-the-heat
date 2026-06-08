'use client';

import Link from 'next/link';

export default function ProductCard({ product }: { product: any }) {
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image_url;

  const price = parseFloat(product.base_price);

  return (
    <div className="border p-4 rounded-xl bg-white">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {image ? (
            <img src={image} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400 uppercase">
              No Image
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase">
              {product.category}
            </p>
            <h3 className="font-bold uppercase text-sm">
              {product.name}
            </h3>
          </div>

          <p className="font-bold">
            {!isNaN(price) ? `₦${price.toLocaleString()}` : "—"}
          </p>
        </div>
      </Link>
    </div>
  );
}