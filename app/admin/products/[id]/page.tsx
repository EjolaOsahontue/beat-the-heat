'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Grid,
} from 'lucide-react';
import Link from 'next/link';

// ============================================================
// TYPES
// ============================================================

type SKU = {
  id?: string;
  sku_name: string;
  variant_options: Record<string, string>;
  quantity: string | number;
  price: string | number | null;
};

type VariantAxis = {
  name: string;
  values: string[];
};

type SizeChartData = {
  columns: string[];
  rows: Record<string, string>[];
  supportedSystems: string[]; // e.g., ["US/INTL", "UK", "EU"]
  systemMappings: Record<string, Record<string, string>>; // e.g., { "EU": { "S": "46", "M": "48" } }
};

// ============================================================
// HELPERS
// ============================================================

function parseVariantOptions(raw: any): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap(combo => arr.map(val => [...combo, val])),
    [[]]
  );
}

function buildSkuName(options: Record<string, string>): string {
  return Object.values(options).filter(Boolean).join(' / ') || 'Standard';
}

function deriveAxes(skus: SKU[]): VariantAxis[] {
  const map: Record<string, Set<string>> = {};
  for (const sku of skus) {
    for (const [k, v] of Object.entries(sku.variant_options || {})) {
      if (!map[k]) map[k] = new Set();
      map[k].add(v);
    }
  }
  return Object.entries(map).map(([name, set]) => ({
    name,
    values: Array.from(set),
  }));
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminProductEditor() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === 'new';

  // ── Form State ────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    description: '',
    base_price: '',
    images: [] as string[],
  });

  // ── Size Chart State ──────────────────────────────────────
  const [hasSizeChart, setHasSizeChart] = useState(false);
  const [sizeChart, setSizeChart] = useState<SizeChartData>({
    columns: ['Base Size', 'Chest (in)', 'Length (in)'],
    rows: [{ 'Base Size': 'S' }, { 'Base Size': 'M' }, { 'Base Size': 'L' }],
    supportedSystems: ['US', 'UK', 'EU'],
    systemMappings: {
      UK: { S: 'S', M: 'M', L: 'L' },
      EU: { S: '46', M: '48', L: '50' },
    },
  });

  const [newChartColumn, setNewChartColumn] = useState('');
  const [newSystemName, setNewSystemName] = useState('');

  // ── Variant axes & SKUs ──────────────────────────────────
  const [axes, setAxes] = useState<VariantAxis[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);

  // ── UI state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openAxis, setOpenAxis] = useState<number | null>(null);
  const [newAxisName, setNewAxisName] = useState('');

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (isNew) { setLoading(false); return; }

    const load = async () => {
      try {
        const [p, s] = await Promise.all([
          supabase.from('products').select('*').eq('id', id).single(),
          supabase.from('product_skus').select('*').eq('product_id', id),
        ]);
        if (p.error) throw p.error;
        if (s.error) throw s.error;

        if (p.data) {
          setForm({
            name: p.data.name || '',
            description: p.data.description || '',
            base_price: p.data.base_price ?? p.data.price ?? '',
            images: p.data.images || [],
          });

          if (p.data.size_chart) {
            setHasSizeChart(true);
            setSizeChart(p.data.size_chart as SizeChartData);
          }
        }

        if (s.data && s.data.length > 0) {
          const parsed: SKU[] = s.data.map((item: any) => ({
            id: item.id,
            sku_name: item.sku_name || 'Standard',
            variant_options: parseVariantOptions(item.variant_options),
            quantity: item.quantity ?? '',
            price: item.price ?? '',
          }));
          setSkus(parsed);
          setAxes(deriveAxes(parsed));
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isNew]);

  // ============================================================
  // AXIS MANAGEMENT
  // ============================================================

  const addAxis = () => {
    const name = newAxisName.trim();
    if (!name) return;
    if (axes.find(a => a.name.toLowerCase() === name.toLowerCase())) {
      alert('That variant type already exists.');
      return;
    }
    const newAxes = [...axes, { name, values: [] }];
    setAxes(newAxes);
    setNewAxisName('');
    setOpenAxis(newAxes.length - 1);
  };

  const removeAxis = (axisIdx: number) => {
    const axisName = axes[axisIdx].name;
    const newAxes = axes.filter((_, i) => i !== axisIdx);
    setAxes(newAxes);
    setSkus(prev =>
      prev.map(sku => {
        const vo = { ...sku.variant_options };
        delete vo[axisName];
        return { ...sku, variant_options: vo, sku_name: buildSkuName(vo) };
      })
    );
    regenerateSkus(newAxes);
  };

  const addValueToAxis = (axisIdx: number, value: string) => {
    const val = value.trim();
    if (!val) return;
    if (axes[axisIdx].values.map(v => v.toLowerCase()).includes(val.toLowerCase())) {
      alert('That value already exists.');
      return;
    }
    const newAxes = axes.map((a, i) =>
      i === axisIdx ? { ...a, values: [...a.values, val] } : a
    );
    setAxes(newAxes);
    regenerateSkus(newAxes);
  };

  const removeValueFromAxis = (axisIdx: number, valIdx: number) => {
    const newAxes = axes.map((a, i) =>
      i === axisIdx
        ? { ...a, values: a.values.filter((_, vi) => vi !== valIdx) }
        : a
    );
    setAxes(newAxes);
    regenerateSkus(newAxes);
  };

  const regenerateSkus = (currentAxes: VariantAxis[]) => {
    const filledAxes = currentAxes.filter(a => a.values.length > 0);
    if (filledAxes.length === 0) { setSkus([]); return; }

    const combinations = cartesian(filledAxes.map(a => a.values));

    setSkus(prev =>
      combinations.map(combo => {
        const options: Record<string, string> = {};
        filledAxes.forEach((axis, i) => { options[axis.name] = combo[i]; });

        const existing = prev.find(sku =>
          Object.entries(options).every(([k, v]) => sku.variant_options[k] === v) &&
          Object.keys(sku.variant_options).length === Object.keys(options).length
        );

        return {
          id: existing?.id,
          sku_name: buildSkuName(options),
          variant_options: options,
          quantity: existing?.quantity ?? '',
          price: existing?.price ?? '',
        };
      })
    );
  };

  // ============================================================
  // SIZE CHART MANAGEMENT LOGIC
  // ============================================================

  const addChartColumn = () => {
    const col = newChartColumn.trim();
    if (!col || sizeChart.columns.includes(col)) return;
    setSizeChart(prev => ({
      ...prev,
      columns: [...prev.columns, col],
    }));
    setNewChartColumn('');
  };

  const removeChartColumn = (colName: string) => {
    if (colName === 'Base Size') return;
    setSizeChart(prev => {
      const updatedRows = prev.rows.map(row => {
        const copy = { ...row };
        delete copy[colName];
        return copy;
      });
      return {
        ...prev,
        columns: prev.columns.filter(c => c !== colName),
        rows: updatedRows,
      };
    });
  };

  const addChartRow = () => {
    setSizeChart(prev => ({
      ...prev,
      rows: [...prev.rows, { 'Base Size': '' }],
    }));
  };

  const removeChartRow = (idx: number) => {
    setSizeChart(prev => {
      const baseValue = prev.rows[idx]['Base Size'];
      const updatedMappings = { ...prev.systemMappings };
      
      // Clean up conversion maps for removed sizes
      Object.keys(updatedMappings).forEach(sys => {
        if (updatedMappings[sys] && baseValue) {
          delete updatedMappings[sys][baseValue];
        }
      });

      return {
        ...prev,
        rows: prev.rows.filter((_, i) => i !== idx),
        systemMappings: updatedMappings,
      };
    });
  };

  const updateChartCell = (rowIdx: number, colName: string, val: string) => {
    setSizeChart(prev => {
      const updatedRows = [...prev.rows];
      const oldBaseValue = updatedRows[rowIdx]['Base Size'];
      updatedRows[rowIdx] = { ...updatedRows[rowIdx], [colName]: val };

      // If updating the Base Size descriptor, transform references in conversion layouts
      let updatedMappings = { ...prev.systemMappings };
      if (colName === 'Base Size' && oldBaseValue && oldBaseValue !== val) {
        Object.keys(updatedMappings).forEach(sys => {
          if (updatedMappings[sys] && updatedMappings[sys][oldBaseValue]) {
            updatedMappings[sys][val] = updatedMappings[sys][oldBaseValue];
            delete updatedMappings[sys][oldBaseValue];
          }
        });
      }

      return { ...prev, rows: updatedRows, systemMappings: updatedMappings };
    });
  };

  const addSizingSystem = () => {
    const sys = newSystemName.trim().toUpperCase();
    if (!sys || sizeChart.supportedSystems.includes(sys)) return;
    setSizeChart(prev => ({
      ...prev,
      supportedSystems: [...prev.supportedSystems, sys],
      systemMappings: { ...prev.systemMappings, [sys]: {} },
    }));
    setNewSystemName('');
  };

  const removeSizingSystem = (sys: string) => {
    if (sys === 'US') return; // Preserve base system anchor
    setSizeChart(prev => {
      const updatedMappings = { ...prev.systemMappings };
      delete updatedMappings[sys];
      return {
        ...prev,
        supportedSystems: prev.supportedSystems.filter(s => s !== sys),
        systemMappings: updatedMappings,
      };
    });
  };

  const updateSystemMapping = (sys: string, baseSize: string, val: string) => {
    if (!baseSize) return;
    setSizeChart(prev => ({
      ...prev,
      systemMappings: {
        ...prev.systemMappings,
        [sys]: {
          ...(prev.systemMappings[sys] || {}),
          [baseSize]: val,
        },
      },
    }));
  };

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, images: [...prev.images, data.publicUrl] }));
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = async () => {
    try {
      if (!form.name.trim()) { alert('Product name is required.'); return; }
      if (form.base_price === '') { alert('Base price is required.'); return; }
      if (Number(form.base_price) < 0) { alert('Base price cannot be negative.'); return; }

      for (const sku of skus) {
        if (sku.quantity === '') { alert(`Set stock for: ${sku.sku_name}`); return; }
        if (Number(sku.quantity) < 0) { alert('Stock cannot be negative.'); return; }
        if (sku.price !== '' && sku.price !== null && Number(sku.price) < 0) {
          alert('Price cannot be negative.'); return;
        }
      }

      setSaving(true);
      const basePrice = Number(form.base_price) || 0;

      const productPayload: any = {
        name: form.name.trim(),
        description: form.description,
        images: form.images,
        base_price: basePrice,
        price: basePrice,
        size_chart: hasSizeChart ? sizeChart : null, // Handles optional dynamic chart writing
      };

      if (!isNew) productPayload.id = id;

      const { data: prod, error: pErr } = await supabase
        .from('products').upsert(productPayload).select().single();
      if (pErr) throw pErr;

      const currentSkuIds = skus.filter(s => s.id).map(s => s.id);
      const { data: dbSkus, error: fetchErr } = await supabase
        .from('product_skus').select('id').eq('product_id', prod.id);
      if (fetchErr) throw fetchErr;

      const deletedIds = (dbSkus || [])
        .filter(db => !currentSkuIds.includes(db.id)).map(db => db.id);
      if (deletedIds.length > 0) {
        const { error: delErr } = await supabase
          .from('product_skus').delete().in('id', deletedIds);
        if (delErr) throw delErr;
      }

      const skuPayload = skus.map(s => {
        let rawOptions = s.variant_options || {};
        if (typeof rawOptions === 'string') {
          try { rawOptions = JSON.parse(rawOptions); } catch { rawOptions = {}; }
        }
        const payload: any = {
          product_id: prod.id,
          sku_name: s.sku_name || buildSkuName(rawOptions),
          variant_options: rawOptions,
          quantity: Number(s.quantity) || 0,
          price: s.price === '' || s.price === null || s.price === undefined ? null : Number(s.price),
        };
        if (s.id) payload.id = s.id;
        return payload;
      });

      const newSkus = skuPayload.filter(s => !s.id);
      const existingSkus = skuPayload.filter(s => s.id);

      if (existingSkus.length > 0) {
        const { error: uErr } = await supabase.from('product_skus').upsert(existingSkus, { onConflict: 'id' });
        if (uErr) throw uErr;
      }
      if (newSkus.length > 0) {
        const { error: iErr } = await supabase.from('product_skus').insert(newSkus);
        if (iErr) throw iErr;
      }

      router.push('/admin/inventory');
      router.refresh();
    } catch (err: any) {
      alert('Save Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-black italic text-2xl uppercase animate-pulse">
        BTH Loading...
      </div>
    );
  }

  const filledAxes = axes.filter(a => a.values.length > 0);

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 space-y-12 bg-white min-h-screen text-black">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-zinc-100 pb-10">
        <div className="space-y-2">
          <Link href="/admin/inventory" className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-2 hover:text-black transition-colors">
            <ArrowLeft size={12} /> Back to Inventory
          </Link>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter">Architect</h1>
        </div>
        <button onClick={handleSave} disabled={saving || uploading} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Sync Piece
        </button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COMPONENT COLUMN */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Base Product Info */}
          <section className="space-y-6">
            <input
              className="w-full text-4xl font-black uppercase italic border-none bg-zinc-50 p-8 rounded-[2rem] outline-none ring-1 ring-zinc-100 focus:ring-2 focus:ring-black transition-all"
              placeholder="PRODUCT NAME"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-50 p-6 rounded-[2rem] ring-1 ring-zinc-100">
                <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block ml-2">Base Price (₦)</label>
                <input type="number" className="w-full bg-transparent text-2xl font-black outline-none" placeholder="0" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <textarea className="w-full bg-zinc-50 p-8 rounded-[2rem] font-medium text-sm border-none outline-none ring-1 ring-zinc-100 focus:ring-2 focus:ring-black min-h-[120px]" placeholder="PRODUCT DESCRIPTION" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
          </section>

          {/* DYNAMIC SIZE CHART MATRIX EDITOR */}
          <section className="bg-zinc-50/50 rounded-[2.5rem] p-8 ring-1 ring-zinc-100 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2"><Grid size={16} /> Size Chart Engine</h2>
                <p className="text-[10px] text-zinc-400 font-medium">Activate customizable metrics & localization variants for this piece.</p>
              </div>
              <button
                type="button"
                onClick={() => setHasSizeChart(!hasSizeChart)}
                className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all ${hasSizeChart ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}
              >
                {hasSizeChart ? 'Chart Enabled' : 'Chart Disabled'}
              </button>
            </div>

            {hasSizeChart && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Systems Customizers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl ring-1 ring-zinc-100">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">1. Sizing Systems (Communities)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sizeChart.supportedSystems.map(sys => (
                        <span key={sys} className="text-[10px] font-black bg-zinc-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          {sys} {sys !== 'US' && <X size={10} className="cursor-pointer text-zinc-400 hover:text-black" onClick={() => removeSizingSystem(sys)} />}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input type="text" placeholder="e.g., UK, EU, CM" value={newSystemName} onChange={e => setNewSystemName(e.target.value)} className="bg-zinc-50 rounded-lg px-3 py-1 text-xs font-bold uppercase outline-none" />
                      <button type="button" onClick={addSizingSystem} className="bg-zinc-900 text-white font-black text-[9px] px-3 uppercase rounded-lg">Add System</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">2. Column Metrics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sizeChart.columns.map(col => (
                        <span key={col} className="text-[10px] font-black bg-zinc-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          {col} {col !== 'Base Size' && <X size={10} className="cursor-pointer text-zinc-400 hover:text-black" onClick={() => removeChartColumn(col)} />}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input type="text" placeholder="Chest (cm), Waist..." value={newChartColumn} onChange={e => setNewChartColumn(e.target.value)} className="bg-zinc-50 rounded-lg px-3 py-1 text-xs font-bold outline-none" />
                      <button type="button" onClick={addChartColumn} className="bg-zinc-900 text-white font-black text-[9px] px-3 uppercase rounded-lg">Add Column</button>
                    </div>
                  </div>
                </div>

                {/* Spreadsheet UI */}
                <div className="overflow-x-auto rounded-2xl ring-1 ring-zinc-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 text-white text-[9px] uppercase font-black tracking-wider">
                        <th className="p-3 border border-zinc-800">Base Size</th>
                        {/* Dynamic community mapping headers columns */}
                        {sizeChart.supportedSystems.filter(s => s !== 'US').map(sys => (
                          <th key={sys} className="p-3 border border-zinc-800 bg-zinc-900 text-zinc-300">{sys} Conv.</th>
                        ))}
                        {sizeChart.columns.filter(c => c !== 'Base Size').map(col => (
                          <th key={col} className="p-3 border border-zinc-800">{col}</th>
                        ))}
                        <th className="p-3 border border-zinc-800 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.rows.map((row, rIdx) => {
                        const currentBaseVal = row['Base Size'] || '';
                        return (
                          <tr key={rIdx} className="hover:bg-zinc-50/50">
                            {/* Base Column */}
                            <td className="p-2 border border-zinc-100">
                              <input type="text" value={currentBaseVal} onChange={e => updateChartCell(rIdx, 'Base Size', e.target.value)} className="w-full font-black uppercase text-xs p-1 bg-transparent outline-none border-b border-dashed border-transparent focus:border-black" placeholder="e.g., S" />
                            </td>
                            {/* Mapping Cells */}
                            {sizeChart.supportedSystems.filter(s => s !== 'US').map(sys => (
                              <td key={sys} className="p-2 border border-zinc-100 bg-zinc-50/50">
                                <input type="text" value={sizeChart.systemMappings[sys]?.[currentBaseVal] || ''} onChange={e => updateSystemMapping(sys, currentBaseVal, e.target.value)} disabled={!currentBaseVal} className="w-full font-bold text-xs p-1 bg-transparent outline-none border-b border-dashed border-transparent focus:border-black disabled:opacity-30" placeholder="Conv." />
                              </td>
                            ))}
                            {/* Metrics Value Data Cells */}
                            {sizeChart.columns.filter(c => c !== 'Base Size').map(col => (
                              <td key={col} className="p-2 border border-zinc-100">
                                <input type="text" value={row[col] || ''} onChange={e => updateChartCell(rIdx, col, e.target.value)} className="w-full text-xs font-medium p-1 bg-transparent outline-none border-b border-dashed border-transparent focus:border-black" placeholder="—" />
                              </td>
                            ))}
                            {/* Delete row action */}
                            <td className="p-2 border border-zinc-100 text-center">
                              <button type="button" onClick={() => removeChartRow(rIdx)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button type="button" onClick={addChartRow} className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl font-black text-xs uppercase text-zinc-400 hover:text-black hover:border-black transition-colors flex items-center justify-center gap-2">
                  <Plus size={14} /> Append Row Configuration
                </button>
              </div>
            )}
          </section>

          {/* VARIANT BUILDER */}
          <section className="space-y-6">
            <div className="px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 italic mb-1">Variant Types</h2>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">Define your variant types (e.g. Size, Color) then add their values.</p>
            </div>

            <div className="space-y-3">
              {axes.map((axis, axisIdx) => (
                <AxisCard
                  key={axis.name}
                  axis={axis}
                  isOpen={openAxis === axisIdx}
                  onToggle={() => setOpenAxis(openAxis === axisIdx ? null : axisIdx)}
                  onRemoveAxis={() => removeAxis(axisIdx)}
                  onAddValue={val => addValueToAxis(axisIdx, val)}
                  onRemoveValue={valIdx => removeValueFromAxis(axisIdx, valIdx)}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <input className="flex-1 bg-zinc-50 px-5 py-4 rounded-2xl text-sm font-bold outline-none ring-1 ring-zinc-100 focus:ring-2 focus:ring-black transition-all" placeholder="New variant type — e.g. Size, Color..." value={newAxisName} onChange={e => setNewAxisName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAxis()} />
              <button onClick={addAxis} disabled={!newAxisName.trim()} className="bg-black text-white px-6 py-4 rounded-2xl font-black text-xs uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"><Plus size={16} /> Add Type</button>
            </div>

            {/* Matrix Table */}
            {skus.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 italic">Stock Matrix — {skus.length} variant{skus.length !== 1 ? 's' : ''}</h2>
                </div>
                <div className="rounded-[2rem] overflow-hidden ring-1 ring-zinc-100">
                  <div className="grid bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-6 py-4 gap-4" style={{ gridTemplateColumns: `${filledAxes.map(() => '1fr').join(' ')} 90px 120px` }}>
                    {filledAxes.map(a => <span key={a.name}>{a.name}</span>)}
                    <span>Stock</span>
                    <span>Price (₦)</span>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {skus.map((sku, i) => {
                      const qty = Number(sku.quantity);
                      const stockColor = sku.quantity === '' ? 'text-zinc-400' : qty === 0 ? 'text-red-500' : qty <= 3 ? 'text-amber-500' : 'text-emerald-600';
                      return (
                        <div key={sku.id || `new-${i}`} className="grid items-center px-6 py-3 gap-4 bg-white hover:bg-zinc-50/60 transition-colors" style={{ gridTemplateColumns: `${filledAxes.map(() => '1fr').join(' ')} 90px 120px` }}>
                          {filledAxes.map(axis => (
                            <span key={axis.name} className="text-[11px] font-black uppercase tracking-wide text-zinc-700">{sku.variant_options[axis.name] || '—'}</span>
                          ))}
                          <input type="number" min="0" className={`w-full bg-zinc-50 rounded-xl px-3 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-black transition-all ${stockColor}`} placeholder="0" value={sku.quantity} onChange={e => { const n = [...skus]; n[i] = { ...n[i], quantity: e.target.value }; setSkus(n); }} />
                          <input type="number" min="0" className="w-full bg-zinc-50 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-black transition-all text-zinc-500" placeholder="Base" value={sku.price ?? ''} onChange={e => { const n = [...skus]; n[i] = { ...n[i], price: e.target.value }; setSkus(n); }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4">
          <div className="bg-zinc-50 p-8 rounded-[3rem] space-y-6 sticky top-10 border border-zinc-100 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 italic">Media Vault</h2>
            <div className="grid grid-cols-2 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-zinc-200 shadow-inner bg-white">
                  <img src={img} className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-black text-[9px] uppercase tracking-widest">Remove</button>
                </div>
              ))}
              <label className="aspect-[3/4] border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-black transition-all group">
                {uploading ? <Loader2 className="animate-spin text-black" size={24} /> : (
                  <>
                    <Upload className="text-zinc-300 group-hover:text-black transition-colors" size={24} />
                    <span className="text-[9px] font-black uppercase mt-2 text-zinc-400 group-hover:text-black">Upload</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// AXIS CARD HELPER
// ============================================================
type AxisCardProps = {
  axis: VariantAxis;
  isOpen: boolean;
  onToggle: () => void;
  onRemoveAxis: () => void;
  onAddValue: (val: string) => void;
  onRemoveValue: (valIdx: number) => void;
};

function AxisCard({ axis, isOpen, onToggle, onRemoveAxis, onAddValue, onRemoveValue }: AxisCardProps) {
  const [input, setInput] = useState('');
  const commit = () => { if (!input.trim()) return; onAddValue(input.trim()); setInput(''); };
  return (
    <div className="rounded-2xl ring-1 ring-zinc-100 overflow-hidden bg-zinc-50">
      <div className="flex items-center px-5 py-4 gap-3">
        <button type="button" onClick={onToggle} className="flex items-center gap-3 flex-1 text-left min-w-0">
          <span className="font-black uppercase text-sm tracking-wide shrink-0">{axis.name}</span>
          {axis.values.length > 0 ? (
            <div className="flex gap-1.5 flex-wrap">
              {axis.values.map(v => <span key={v} className="text-[9px] font-black uppercase bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-md">{v}</span>)}
            </div>
          ) : <span className="text-[10px] text-zinc-400 font-bold italic">No values yet</span>}
          <span className="ml-auto shrink-0 text-zinc-400">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
        </button>
        <button type="button" onClick={onRemoveAxis} className="p-2 text-zinc-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16} /></button>
      </div>
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 pt-4">
          {axis.values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {axis.values.map((val, vi) => (
                <div key={val} className="flex items-center bg-black text-white pl-4 pr-2 py-2 rounded-xl gap-2 text-[11px] font-black uppercase">
                  <span>{val}</span>
                  <button type="button" onClick={() => onRemoveValue(vi)} className="hover:text-red-300 transition-colors"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input className="flex-1 bg-white px-4 py-3 rounded-xl text-sm font-bold outline-none ring-1 ring-zinc-100 focus:ring-2 focus:ring-black transition-all" placeholder="Value..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && commit()} />
            <button type="button" onClick={commit} disabled={!input.trim()} className="bg-black text-white px-5 py-3 rounded-xl font-black text-xs uppercase"><Plus size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}