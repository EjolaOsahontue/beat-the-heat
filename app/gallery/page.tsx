import { supabase } from '@/lib/supabase';

// FORCE NEXT.JS TO BYPASS STATIC CACHING AND PULL FRESH DATA FROM SUPABASE ON EVERY PAGE LOAD
export const revalidate = 0; 
export const dynamic = 'force-dynamic';

const GALLERY_KEY = 'gallery_images';

export default async function GalleryPage() {
  const { data } = await supabase
    .from('site_content')
    .select('key,value')
    .in('key', [GALLERY_KEY]);

  const raw =
    (Array.isArray(data)
      ? data.find((r: any) => r.key === GALLERY_KEY)?.value
      : null) ?? '[]';

  let images: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    images = Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string' && x.trim()) : [];
  } catch {
    images = [];
  }

  return (
    <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
      <header className="mb-10">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4">
          Gallery
        </p>
        <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">
          BTH+  
        </h1>
        <p className="text-zinc-500 font-bold mt-4 max-w-2xl">
          A curated space for our latest drops, campaign shots, and behind-the-scenes textures.
        </p>
      </header>

      {images.length === 0 ? (
        <section className="border-2 border-zinc-100 bg-white rounded-[2rem] p-8">
          <h2 className="font-black uppercase italic text-2xl">No gallery images yet</h2>
          <p className="text-zinc-500 font-bold mt-3">
            Add image URLs from the admin editor (`/admin`), under Gallery Images.
          </p>
        </section>
      ) : (
        /* UPDATED LAYOUT FRAMEWORKS TO RETAIN NATIVE UNREDUCED HEIGHT RATIOS OVER SQUARE CROPS */
        <section className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="break-inside-avoid border-2 border-zinc-100 bg-zinc-950 rounded-[2rem] overflow-hidden hover:border-black transition-all p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt="Studio Lookbook Frame" 
                className="w-full h-auto object-contain max-h-[80vh] rounded-[1.5rem] block mx-auto bg-zinc-900" 
              />
            </div>
          ))}
        </section>
      )}

      <section className="mt-14 border-2 border-zinc-100 bg-white rounded-[2rem] p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Want the next drop?</h2>
            <p className="text-zinc-500 font-bold mt-2 max-w-2xl">
              Shop from the product pages after browsing the wall. Checkout is built for fast Paystack payments.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}