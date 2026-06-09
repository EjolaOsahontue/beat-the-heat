import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// FORCE NEXT.JS TO BYPASS STATIC CACHING AND PULL FRESH DATA FROM SUPABASE ON EVERY REQUEST
export const revalidate = 0;
export const dynamic = 'force-dynamic';


const ABOUT_KEY = 'about_us';

export default async function AboutPage() {
  // Fetch your custom Manifesto string copy directly on the server
  const { data: contentData } = await supabase
    .from('site_content')
    .select('key, value')
    .eq('key', ABOUT_KEY)
    .single();

  const aboutText = contentData?.value ?? '';

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text grain max-w-5xl mx-auto px-6 pt-24 pb-20 flex flex-col justify-between">
      
      {/* BRAND TEXT HEADINGS */}
      <header className="mb-16 border-b border-brand-border pb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-text mb-4">
          Corporate Profiling / Manifest
        </p>
        <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none font-sans">
          ABOUT BTH+ 
        </h1>
      </header>

      {/* CORE MANIFESTO COPY RENDER VIEWPORT */}
      <section className="flex-1 max-w-3xl">
        {!aboutText.trim() ? (
          <div className="border border-dashed border-brand-border rounded-[2rem] p-8 text-center text-brand-muted/40 font-bold text-xs uppercase tracking-widest bg-brand-surface">
            No about text profile found in database record. Populate this inside your admin engine.
          </div>
        ) : (
          <p className="text-brand-muted font-bold text-sm leading-loose uppercase tracking-wide whitespace-pre-wrap selection:bg-accent selection:text-brand-bg">
            {aboutText}
          </p>
        )}
      </section>

      {/* FOOTER DIRECT ACTION NAVIGATION LAYER */}
      <section className="mt-20 border-t border-brand-border pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter font-sans">
            Ready to explore?
          </h2>
          <p className="text-brand-muted font-bold text-xs mt-1 uppercase tracking-wider">
            Browse our core capsule products or check out our curated gallery.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/gallery"
            className="btn btn-outline text-center"
          >
            Studio Wall
          </Link>
          <Link
            href="/products"
            className="btn btn-primary text-center bg-accent text-brand-bg shadow-[0_4px_25px_rgba(255,240,243,0.15)]"
          >
            Shop Catalogue
          </Link>
        </div>
      </section>

    </main>
  );
}