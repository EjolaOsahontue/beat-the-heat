"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Mail, Phone, MapPin, Camera, Loader2 } from "lucide-react";

export default function ContactUsPage() {
  const [contactInfo, setContactInfo] = useState({
    email: "info@bth.com",
    phone: "+234 000 000 0000",
    address: "Lagos, Nigeria",
    instagram_url: "https://instagram.com/",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchContactDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("contact_email, contact_phone, contact_address, instagram_url")
          .eq("id", 1)
          .single();

        if (!error && data) {
          setContactInfo({
            email: data.contact_email || "info@bth.com",
            phone: data.contact_phone || "+234 000 000 0000",
            address: data.contact_address || "Lagos, Nigeria",
            instagram_url: data.instagram_url || "https://instagram.com/",
          });
        }
      } catch (err) {
        console.error("Failed to load contact settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
          Contact Us
        </h1>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-400">
          Get in touch with the BTH+ team
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Contact Info Card */}
        <div className="bg-zinc-50 border border-zinc-200 p-8 md:p-12 rounded-[2rem] flex flex-col justify-between space-y-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">
              Reach Out Directly
            </h2>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-white rounded-xl border border-zinc-200 text-zinc-900">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Email Address</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm font-bold text-zinc-900 hover:underline break-all">
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-white rounded-xl border border-zinc-200 text-zinc-900">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Phone Support</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-sm font-bold text-zinc-900 hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-white rounded-xl border border-zinc-200 text-zinc-900">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Headquarters</p>
                  <p className="text-sm font-bold text-zinc-900 leading-snug">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Link Button */}
          {contactInfo.instagram_url && (
            <a
              href={contactInfo.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-black text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-opacity hover:opacity-90 w-full text-center"
            >
              Follow Us On Instagram <Camera size={14} className="ml-1" />
            </a>
          )}
        </div>

        {/* Customer Experience Card */}
        <div className="bg-zinc-900 text-zinc-100 p-8 md:p-12 rounded-[2rem] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-wide text-white mb-4">
              BTH+ Support hours
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">
              Have a question about an order, a release, or an upcoming event? Drop us a line. Our support team is here to help you out.
            </p>
            <div className="border-t border-zinc-800 pt-6 space-y-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <div className="flex justify-between"><span className="text-zinc-500">Mon - Fri</span> <span className="text-white">9am - 6pm</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Sat - Sun</span> <span className="text-white">11am - 4pm</span></div>
            </div>
          </div>
          <div className="text-[9px] font-bold tracking-widest uppercase text-zinc-600 mt-8 border-t border-zinc-800 pt-4 text-center md:text-left">
            BTH+ Core Systems v4.0
          </div>
        </div>

      </div>
    </div>
  );
}