"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop } from "@/lib/admin";
import { priceProduct, qar, slugify } from "@/lib/pricing";
import { DEFAULT_RATES, METALS, STONES, OCCASIONS, GENDERS } from "@/lib/constants";
import type { Category, Collection, Product } from "@/lib/types";

const EMPTY: Product = { id: "", sku: "", slug: "", name: "", category: "rings", style: "", metal: "ag925", stone: "none", carat: 0, weight_g: 0, making_pct: 120, making_discount_pct: 0, stone_value: 0, fixed_price: null, stock: 1, occasions: [], gender: "Women", collection: null, is_new: true, is_bestseller: false, is_active: true, description: "", images: [], art_variant: 0 };

export default function ProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const [p, setP] = useState<Product>(EMPTY);
  const [cats, setCats] = useState<Category[]>([]);
  const [cols, setCols] = useState<Collection[]>([]);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    const db = supabaseBrowser();
    db.from("categories").select("*").order("sort_order").then(({ data }) => setCats((data as Category[]) ?? []));
    db.from("collections").select("*").order("sort_order").then(({ data }) => setCols((data as Collection[]) ?? []));
    db.from("settings").select("rates").eq("id", 1).maybeSingle().then(({ data }) => data?.rates && setRates({ ...DEFAULT_RATES, ...data.rates }));
    if (!isNew) db.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => data ? setP({ ...EMPTY, ...(data as Product) }) : setMsg({ t: "err", m: "Product not found." }));
  }, [id, isNew]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const num = (k: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, (e.target.value === "" ? 0 : Number(e.target.value)) as never);
  const priced = priceProduct(p, rates);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!p.sku.trim()) { setMsg({ t: "err", m: "Enter the SKU before adding photos." }); return; }
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 6)) {
      if (f.size > 5 * 1024 * 1024) { setMsg({ t: "err", m: `${f.name} is over 5 MB. Please resize it.` }); continue; }
      const path = `${slugify(p.sku)}/${Date.now()}-${slugify(f.name.replace(/\.[^.]+$/, ""))}.${(f.name.split(".").pop() || "jpg").toLowerCase()}`;
      const { error } = await supabaseBrowser().storage.from("product-images").upload(path, f, { cacheControl: "31536000", upsert: false });
      if (error) { setMsg({ t: "err", m: `Upload failed: ${error.message}` }); continue; }
      urls.push(supabaseBrowser().storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    set("images", [...p.images, ...urls]);
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.name.trim() || !p.sku.trim()) { setMsg({ t: "err", m: "Name and SKU are required." }); return; }
    if (!(p.weight_g > 0)) { setMsg({ t: "err", m: "Enter the gram weight; the price depends on it." }); return; }
    setBusy(true); setMsg(null);
    const row = { ...p, sku: p.sku.trim().toUpperCase(), name: p.name.trim(), slug: p.slug || `${slugify(p.name)}-${slugify(p.sku)}`, style: p.style || null, description: p.description || null, collection: p.collection || null };
    const { id: _omit, created_at: _c, ...data } = row;
    void _omit; void _c;
    const db = supabaseBrowser();
    const res = isNew ? await db.from("products").insert(data).select("id").single() : await db.from("products").update(data).eq("id", id).select("id").single();
    setBusy(false);
    if (res.error) { setMsg({ t: "err", m: res.error.code === "23505" ? "That SKU or link already exists. Use a different SKU." : res.error.message }); return; }
    await refreshShop();
    if (isNew) router.replace(`/admin/products/${res.data.id}`);
    setMsg({ t: "ok", m: "Saved. The shop is updated." });
  };

  const del = async () => {
    await supabaseBrowser().from("products").delete().eq("id", id);
    await refreshShop();
    router.replace("/admin/products");
  };

  const toggleOcc = (o: string) => set("occasions", p.occasions.includes(o) ? p.occasions.filter((x) => x !== o) : [...p.occasions, o]);

  return (
    <form onSubmit={save}>
      <p className="sub" style={{ marginBottom: 6 }}><Link href="/admin/products">← Products</Link></p>
      <div className="sh" style={{ alignItems: "center" }}><h1>{isNew ? "Add product" : p.name || "Edit product"}</h1>
        <div className="bar" style={{ margin: 0 }}>{!isNew && p.slug && <a className="btn o" href={`/product/${p.slug}`} target="_blank" rel="noopener">View on shop ↗</a>}<button className="btn p" type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button></div>
      </div>
      {msg && <div className={`notice ${msg.t}`}>{msg.m}</div>}
      <div style={{ display: "grid", gap: 16 }}>
        <div className="panel"><h2>Basics</h2>
          <div className="form">
            <div className="field full"><label htmlFor="name">Product name</label><input id="name" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Aseel Sterling Silver Stackable Ring" /></div>
            <div className="field"><label htmlFor="sku">SKU <span className="hint">unique code, e.g. KJ-RG-00097</span></label><input id="sku" value={p.sku} onChange={(e) => set("sku", e.target.value)} /></div>
            <div className="field"><label htmlFor="cat">Category</label><select id="cat" value={p.category} onChange={(e) => set("category", e.target.value)}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
            <div className="field"><label htmlFor="style">Style <span className="hint">optional</span></label><input id="style" value={p.style ?? ""} onChange={(e) => set("style", e.target.value)} placeholder="Stackable Ring" /></div>
            <div className="field"><label htmlFor="col">Collection</label><select id="col" value={p.collection ?? ""} onChange={(e) => set("collection", e.target.value || null)}><option value="">None</option>{cols.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
            <div className="field full"><label htmlFor="desc">Description</label><textarea id="desc" value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
          </div>
        </div>

        <div className="panel"><h2>Finish, weight &amp; price</h2>
          <div className="form">
            <div className="field"><label htmlFor="metal">Silver finish</label><select id="metal" value={p.metal} onChange={(e) => set("metal", e.target.value)}>{METALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
            <div className="field"><label htmlFor="w">Gross weight (grams)</label><input id="w" type="number" step="0.001" min="0" value={p.weight_g || ""} onChange={num("weight_g")} /></div>
            <div className="field"><label htmlFor="mk">Making charge (%)</label><input id="mk" type="number" step="0.1" min="0" value={p.making_pct} onChange={num("making_pct")} /></div>
            <div className="field"><label htmlFor="md">Discount on making (%) <span className="hint">0 for none</span></label><input id="md" type="number" step="1" min="0" max="100" value={p.making_discount_pct} onChange={num("making_discount_pct")} /></div>
            <div className="field"><label htmlFor="stone">Stone</label><select id="stone" value={p.stone} onChange={(e) => set("stone", e.target.value)}>{Object.entries(STONES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div className="field"><label htmlFor="fp">Fixed price (QAR) <span className="hint">optional · leave empty to price by weight</span></label><input id="fp" type="number" step="1" min="0" value={p.fixed_price ?? ""} onChange={(e) => set("fixed_price", e.target.value === "" ? null : Number(e.target.value))} /></div>
            <div className="field"><label htmlFor="sv">Stone value (QAR)</label><input id="sv" type="number" step="1" min="0" value={p.stone_value} onChange={num("stone_value")} /></div>
            <div className="field"><label htmlFor="stock">Stock <span className="hint">0 = made to order</span></label><input id="stock" type="number" step="1" min="0" value={p.stock} onChange={num("stock")} /></div>
          </div>
          <div className="notice info num" style={{ marginTop: 14, marginBottom: 0 }}>{priced.isFixed ? <>Price on the shop: <b>{qar(priced.price)}</b> (fixed price; the silver rate does not change it)</> : <>Price today: <b>{qar(priced.price)}</b> = silver {qar(priced.metalValue)} + making {qar(priced.makingValue - priced.discountValue)}{p.stone_value ? ` + stone ${qar(p.stone_value)}` : ""} (rate {priced.rate}/g)</>}</div>
        </div>

        <div className="panel"><h2>Photos</h2>
          <p className="sub" style={{ marginBottom: 10 }}>Square photos on a plain background work best (at least 1200 × 1200 px, under 5 MB). The first photo is the main image.</p>
          <div className="imgs">
            {p.images.map((src, i) => <div className="im" key={src}><img src={src} alt="" /><button type="button" aria-label="Remove photo" onClick={() => set("images", p.images.filter((_, j) => j !== i))}>✕</button></div>)}
            <label className="add">{uploading ? "Uploading…" : "+ Add photos"}<input type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} /></label>
          </div>
        </div>

        <div className="panel"><h2>Where it shows</h2>
          <div className="form">
            <div className="field"><label htmlFor="g">For</label><select id="g" value={p.gender} onChange={(e) => set("gender", e.target.value)}>{GENDERS.map((g) => <option key={g}>{g}</option>)}</select></div>
            <div className="field"><span>Labels</span><div className="checks">
              <label><input type="checkbox" checked={p.is_active} onChange={(e) => set("is_active", e.target.checked)} />Live on shop</label>
              <label><input type="checkbox" checked={p.is_new} onChange={(e) => set("is_new", e.target.checked)} />New arrival</label>
              <label><input type="checkbox" checked={p.is_bestseller} onChange={(e) => set("is_bestseller", e.target.checked)} />Bestseller</label>
            </div></div>
            <div className="field full"><span>Occasions</span><div className="checks">{OCCASIONS.map((o) => <label key={o}><input type="checkbox" checked={p.occasions.includes(o)} onChange={() => toggleOcc(o)} />{o}</label>)}</div></div>
          </div>
        </div>

        {!isNew && (
          <div className="panel"><h2>Delete product</h2>
            {confirmDel ? <div className="bar"><span>Delete “{p.name}” permanently?</span><button type="button" className="btn p" onClick={del}>Yes, delete</button><button type="button" className="btn o" onClick={() => setConfirmDel(false)}>Cancel</button></div>
              : <><p className="sub" style={{ marginBottom: 10 }}>To take it off the shop temporarily, untick “Live on shop” instead.</p><button type="button" className="btn o" onClick={() => setConfirmDel(true)}>Delete product</button></>}
          </div>
        )}
      </div>
    </form>
  );
}
