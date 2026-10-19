"use client";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop } from "@/lib/admin";
import { rowToProduct, productToCsvRow, CSV_COLUMNS, type ParsedRow } from "@/lib/csv";
import type { Product } from "@/lib/types";

export default function ImportPage() {
  const [cats, setCats] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [file, setFile] = useState("");
  const [progress, setProgress] = useState<string>("");
  const [done, setDone] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const db = supabaseBrowser();
    db.from("categories").select("slug").then(({ data }) => setCats((data ?? []).map((x: { slug: string }) => x.slug)));
    db.from("collections").select("slug").then(({ data }) => setCols((data ?? []).map((x: { slug: string }) => x.slug)));
  }, []);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f.name); setDone(null); setRows([]); setErrors([]);
    Papa.parse<Record<string, string>>(f, {
      header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => {
        const ok: ParsedRow[] = [], bad: string[] = [], seen = new Set<string>();
        res.data.forEach((r, i) => {
          const out = rowToProduct(r, i + 2, cats, cols);
          if (typeof out === "string") { bad.push(out); return; }
          const sku = out.row.sku as string;
          if (seen.has(sku)) { bad.push(`Row ${i + 2}: SKU ${sku} appears more than once in the file`); return; }
          seen.add(sku); ok.push(out);
        });
        setRows(ok); setErrors(bad);
      },
      error: (e) => setErrors([`Couldn't read the file: ${e.message}`]),
    });
  };

  const run = async () => {
    setBusy(true); setDone(null);
    const db = supabaseBrowser();
    // Rows without photo links leave existing photos untouched.
    const groups = [rows.filter((r) => r.hasImages), rows.filter((r) => !r.hasImages)];
    let saved = 0;
    for (const g of groups) {
      for (let i = 0; i < g.length; i += 400) {
        const batch = g.slice(i, i + 400).map((r) => r.row);
        setProgress(`Saving ${saved + 1}–${saved + batch.length} of ${rows.length}…`);
        const { error } = await db.from("products").upsert(batch, { onConflict: "sku" });
        if (error) { setBusy(false); setProgress(""); setDone({ t: "err", m: `Stopped after ${saved} products: ${error.message}` }); return; }
        saved += batch.length;
      }
    }
    await refreshShop();
    setBusy(false); setProgress(""); setRows([]);
    setDone({ t: "ok", m: `${saved.toLocaleString()} products imported. New SKUs were added and existing SKUs were updated.` });
  };

  const exportAll = async () => {
    setProgress("Preparing download…");
    const db = supabaseBrowser();
    const all: Product[] = [];
    for (let from = 0; ; from += 1000) {
      const { data } = await db.from("products").select("*").order("sku").range(from, from + 999);
      all.push(...((data as Product[]) ?? []));
      if (!data || data.length < 1000) break;
    }
    const csv = Papa.unparse(all.map(productToCsvRow), { columns: [...CSV_COLUMNS] });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `kohinoor-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setProgress("");
  };

  return (
    <>
      <h1>Import products</h1>
      <p className="sub">Add or update many products at once from a spreadsheet. Matching is by SKU: a new SKU adds a product, an existing SKU updates it.</p>
      <div style={{ display: "grid", gap: 16 }}>
        <div className="panel"><h2>1. Get the template</h2>
          <p className="sub" style={{ marginBottom: 12 }}>Fill it in Excel or Google Sheets, then save or download it as <b>CSV</b>. Use semicolons to separate several occasions or photo links.</p>
          <div className="bar"><a className="btn o" href="/kohinoor-product-template.csv" download>Download template</a><button className="btn o" type="button" onClick={exportAll}>Download all current products</button></div>
          <details><summary>Column guide</summary>
            <div className="order-items" style={{ marginBottom: 12 }}>
              <span><b>sku, name</b>: required. SKU must be unique.</span>
              <span><b>category</b>: {cats.join(", ")}</span>
              <span><b>metal</b>: yg24, yg22, yg21, yg18, wg18 (white gold), rg18 (rose gold), pt (platinum), ag (silver)</span>
              <span><b>stone</b>: none, diamond, pearl, ruby, emerald, sapphire, polki, kundan</span>
              <span><b>weight_g, making_pct, making_discount_pct, stone_value, carat, stock</b>: numbers</span>
              <span><b>occasions</b>: Wedding; Engagement; Anniversary; Birthday; Eid; Daily Wear; National Day; Gifting</span>
              <span><b>gender</b>: Women, Men, Kids or Unisex · <b>collection</b>: {cols.join(", ") || "none yet"}</span>
              <span><b>is_new, is_bestseller, is_active</b>: yes or no · <b>image_urls</b>: photo links separated by ;</span>
            </div>
          </details>
        </div>
        <div className="panel"><h2>2. Upload your file</h2>
          <label className="btn p" style={{ cursor: "pointer" }}>Choose CSV file<input type="file" accept=".csv,text/csv" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} /></label>
          {file && <p className="sub" style={{ margin: "12px 0 0" }}>{file}: <b>{rows.length.toLocaleString()}</b> rows ready{errors.length ? `, ${errors.length} with problems` : ""}.</p>}
          {errors.length > 0 && <div className="notice err" style={{ marginTop: 12 }}><b>Fix these rows and upload again (or import the valid rows now):</b><ul style={{ margin: "6px 0 0", paddingInlineStart: 18 }}>{errors.slice(0, 25).map((e, i) => <li key={i}>{e}</li>)}</ul>{errors.length > 25 && <p style={{ margin: "6px 0 0" }}>…and {errors.length - 25} more.</p>}</div>}
        </div>
        <div className="panel"><h2>3. Import</h2>
          {done && <div className={`notice ${done.t}`}>{done.m}</div>}
          {progress && <p className="sub">{progress}</p>}
          <button className="btn p" type="button" disabled={!rows.length || busy} onClick={run}>{busy ? "Importing…" : `Import ${rows.length.toLocaleString()} products`}</button>
        </div>
      </div>
    </>
  );
}
