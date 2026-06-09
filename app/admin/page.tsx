'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Trash2, Save, Loader2, CheckCircle2 } from 'lucide-react';

type SiteContentRow = {
  key: string;
  value: string;
};

const ABOUT_KEY = 'about_us';
const GALLERY_KEY = 'gallery_images';
const LANDING_BG_KEY = 'landing_background';

export default function AdminSiteContent() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bucketLoading, setBucketLoading] = useState(false);

  const [aboutText, setAboutText] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [landingBg, setLandingBg] = useState('');

  const [landingBucketImages, setLandingBucketImages] = useState<string[]>([]);
  const [landingFile, setLandingFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);

  const parsedGallery = useMemo(
    () => galleryImages.filter(Boolean),
    [galleryImages]
  );

  const fetchSiteContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('site_content')
        .select('*')
        .in('key', [ABOUT_KEY, GALLERY_KEY, LANDING_BG_KEY]);

      if (dbError) throw dbError;

      const rows = (data ?? []) as SiteContentRow[];
      const byKey = new Map(rows.map((r) => [r.key, r.value]));

      const about = byKey.get(ABOUT_KEY) ?? '';
      const galleryRaw = byKey.get(GALLERY_KEY) ?? '[]';
      const landingBgValue = byKey.get(LANDING_BG_KEY) ?? '';

      let gallery: string[] = [];
      try {
        const parsed = JSON.parse(galleryRaw);
        gallery = Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
      } catch (e) {
        console.error("JSON parse failed for gallery data:", e);
        gallery = [];
      }

      setAboutText(about);
      setGalleryImages(gallery);
      setLandingBg(landingBgValue);

      await refreshLandingImagesBucket();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  const refreshLandingImagesBucket = async () => {
    setBucketLoading(true);
    try {
      const { data: files, error: storageError } = await supabase.storage
        .from('landing-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (storageError) throw storageError;

      if (files) {
        const urls = files.map((file) => {
          const { data } = supabase.storage.from('landing-images').getPublicUrl(file.name);
          return data.publicUrl;
        });
        setLandingBucketImages(urls);
      }
    } catch (err: any) {
      console.error("Storage bucket listing error:", err.message);
    } finally {
      setBucketLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteContent();
  }, []);

  const upsert = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  };

  const extractFileName = (url: string, bucketName: string) => {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  };

  const removeImage = async (idx: number) => {
    const urlToRemove = galleryImages[idx];
    if (!urlToRemove) return;
    if (!confirm("Delete this image from the gallery?")) return;

    const updatedGallery = galleryImages.filter((_, i) => i !== idx);
    setSaving(true);
    try {
      await upsert(GALLERY_KEY, JSON.stringify(updatedGallery));
      setGalleryImages(updatedGallery);
      const fileName = extractFileName(urlToRemove, 'gallery-images');
      if (fileName) {
        await supabase.storage.from('gallery-images').remove([fileName]);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLandingUpload = async () => {
    if (!landingFile) return;
    setBucketLoading(true);
    try {
      const ext = landingFile.name.split('.').pop();
      const fileName = `landing_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('landing-images')
        .upload(fileName, landingFile);
      if (uploadError) throw uploadError;
      setLandingFile(null);
      await refreshLandingImagesBucket();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBucketLoading(false);
    }
  };

  const removeLandingBucketImage = async (url: string) => {
    const fileName = extractFileName(url, 'landing-images');
    if (!fileName) return;
    if (!confirm("Permanently delete this background?")) return;

    setBucketLoading(true);
    try {
      await supabase.storage.from('landing-images').remove([fileName]);
      if (url === landingBg) {
        setLandingBg('');
        await upsert(LANDING_BG_KEY, '');
      }
      await refreshLandingImagesBucket();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBucketLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await upsert(ABOUT_KEY, aboutText);
      await upsert(GALLERY_KEY, JSON.stringify(parsedGallery));
      await upsert(LANDING_BG_KEY, landingBg);
      alert('Changes saved successfully.');
      await fetchSiteContent();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6 border-zinc-900">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight italic">
              Site Content
            </h1>
            <p className="text-zinc-500 font-bold text-xs mt-1 uppercase tracking-widest">
              Manage Landing Page, Gallery & About Us
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="self-start sm:self-auto bg-white text-black px-5 py-2.5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all"
          >
            Back
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-200 rounded-2xl p-4 font-bold text-xs uppercase tracking-widest">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-[30vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* LANDING BACKGROUND */}
            <section className="bg-zinc-950 border border-zinc-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem]">
              <h2 className="font-black uppercase text-lg sm:text-xl tracking-wide text-white mb-5">
                Landing Page Background
              </h2>

              <div className="flex flex-col gap-3 mb-6 bg-black p-4 rounded-2xl border border-zinc-900">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLandingFile(e.target.files?.[0] || null)}
                  className="w-full p-2 text-xs text-zinc-500 font-bold file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-white file:text-black"
                />
                <button
                  type="button"
                  onClick={handleLandingUpload}
                  disabled={!landingFile || bucketLoading}
                  className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-xs tracking-widest disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                >
                  {bucketLoading && <Loader2 className="animate-spin" size={14} />}
                  Upload Image
                </button>
              </div>

              {landingBucketImages.length === 0 ? (
                <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                  No background images uploaded yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {landingBucketImages.map((url, idx) => {
                    const isActive = landingBg === url;
                    return (
                      <div
                        key={idx}
                        className={`relative border rounded-xl overflow-hidden bg-black transition-all ${
                          isActive ? 'border-claret ring-2 ring-claret/20' : 'border-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-28 sm:h-36 object-cover opacity-60" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-2 pt-8 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLandingBg(url)}
                            className={`w-full py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-1 ${
                              isActive ? 'bg-claret text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isActive && <CheckCircle2 size={9} />}
                            {isActive ? 'Active' : 'Set Active'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLandingBucketImage(url)}
                            className="text-[9px] uppercase font-black text-red-500 hover:text-red-400 flex items-center justify-center gap-1 py-1"
                          >
                            <Trash2 size={9} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* GALLERY */}
            <section className="bg-zinc-950 border border-zinc-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem]">
              <h2 className="font-black uppercase text-lg sm:text-xl text-white tracking-wider mb-1">
                Gallery
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-5">
                Manage your lookbook images
              </p>

              <div className="flex flex-col gap-3 bg-black p-4 rounded-2xl border border-zinc-900 mb-5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2 text-xs text-zinc-500 font-bold"
                />
                <button
                  onClick={async () => {
                    if (!imageFile) return;
                    const ext = imageFile.name.split('.').pop();
                    const fileName = `gallery_${Date.now()}.${ext}`;
                    const { error } = await supabase.storage
                      .from('gallery-images')
                      .upload(fileName, imageFile);
                    if (error) return alert(error.message);
                    const { data } = supabase.storage.from('gallery-images').getPublicUrl(fileName);
                    const updatedList = [...parsedGallery, data.publicUrl];
                    await upsert(GALLERY_KEY, JSON.stringify(updatedList));
                    setGalleryImages(updatedList);
                    setImageFile(null);
                    alert("Image uploaded!");
                  }}
                  className="w-full bg-white text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Upload To Gallery
                </button>
              </div>

              {parsedGallery.length === 0 ? (
                <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                  No gallery images yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {parsedGallery.map((url, idx) => (
                    <div key={idx} className="border border-zinc-900 rounded-xl overflow-hidden relative group bg-black">
                      <img src={url} alt="" className="w-full h-28 sm:h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-red-500 font-black text-[10px] uppercase tracking-wider gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ABOUT US */}
            <section className="bg-zinc-950 border border-zinc-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem]">
              <h2 className="font-black uppercase text-lg sm:text-xl text-white tracking-wider mb-4">
                About Us
              </h2>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full min-h-[140px] p-4 bg-black border border-zinc-900 text-white rounded-2xl font-bold text-sm focus:outline-none focus:border-zinc-700 resize-none"
                placeholder="Write store description..."
              />
            </section>

          </div>
        )}

        {/* SAVE BUTTON */}
        <div className="mt-8 flex justify-end border-t pt-6 border-zinc-900">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full sm:w-auto bg-claret text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-xl disabled:opacity-40"
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}