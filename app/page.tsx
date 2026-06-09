import { supabase } from "@/lib/supabase";
import Link from "next/link";

// FORCE NEXT.JS TO BYPASS STATIC CACHING AND PULL REAL-TIME LAYOUT CONFIGURATIONS
export const revalidate = 0;
export const dynamic = 'force-dynamic';


const LANDING_BG_KEY = 'landing_background';

export default async function LandingPage() {
  // 1. Fetch only the background image configuration directly on the server
  const { data: contentData } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("key", LANDING_BG_KEY)
    .single();

  const backgroundUrl = contentData?.value ?? '';

  // 2. Fetch the latest additions to your inventory
  const { data: products } = await supabase
    .from("products")
    .select("id, name, base_price, images")
    .order("created_at", { ascending: false })
    .limit(6);

  const activeProducts = products ?? [];

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-body grain selection:bg-pink-brand selection:text-white">
      
      {/* HIGH-END BRAND HERO CANVAS */}
      <div className="relative min-h-screen flex flex-col overflow-hidden z-0 bg-black">
        
        {/* Cinematic Backdrop Layer */}
        <div className="absolute inset-0 z-0 animate-fade-in pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: backgroundUrl
                ? `url('${backgroundUrl}')`
                : "url('/fallback-editorial-dark.jpg')",
              opacity: 1, 
            }}
          />
          {/* Subtle lighting mask configuration to preserve high-contrast text layout */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>

        {/* Brand Meta Messaging */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 select-none">
          <div className="mb-8">
            <Link href="/" className="text-4xl font-black tracking-tighter text-white font-display">
              
            </Link>
          </div>

          <p className="text-pink-brand uppercase tracking-[0.5em] text-[10px] font-black mb-3">
            
          </p>

          <h1 className="text-white text-6xl sm:text-9xl font-black tracking-tight mb-6 leading-none uppercase font-display mix-blend-difference drop-shadow-[0_10px_10px_rgba(0,0,0,1)]">
            BEAT THE HEAT
          </h1>


          <Link
            href="/products"
            className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-claret hover:text-white transition-all transform hover:scale-105 shadow-2xl"
          >
            SHOP COLLECTION 
          </Link>
        </div>
      </div>

     

    </div>
  );
}