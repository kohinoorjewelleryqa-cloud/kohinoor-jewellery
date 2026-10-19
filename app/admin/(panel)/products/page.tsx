"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop } from "@/lib/admin";
import { priceProduct, qar } from "@/lib/pricing";
import { DEFAULT_RATES, METAL } from "@/lib/constants";
import { artSvg } from "@/lib/art";
import type { Category, Product } from "@/lib/types";

const PER = 50;

export default function ProductsAdmin() {
  const [rows, setRows] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("all");
  const [cats, setCats] = useState<Category[]>([]);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = supabaseBrowser();
    db.from("categories").select("*").order("sort_order").then(({ data }) => setCats((data as Category[]) ?? []));
    db.from("settings").select("rates").eq("id", 1).maybeSingle().then(({ data }) => data?.rates && setRates({ ...DEFAULT_RATES, ...data.rates }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabaseBrowser().from("products").select("*", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
    if (q.trim()) query = query.or(`name.ilike.%${q.trim()}%,sku.ilike.%${q.trim()}%`);
    if (cat) query = query.eq("category", cat);
    if (status === "active") query = query.eq("is_active", true);
    if (status === "hidden") query = query.eq("is_active", false);
    if (status === "nostock") query = query.lte("stock", 0);
    const { data, count } = await query;
    setRows((data as Product[]) ?? []); setCount(count ?? 0); setLoading(false);
  }, [page, q, cat, status]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const toggle = async (p: Product) => {
    await supabaseBrowser().from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)));
    refreshShop();
  };
  const pages = Math.max(1, Math.ceil(count / PER));

  return (
    <>
      <div className="sh" style={{ alignItems: "center" }}><div><h1>Products</h1><p className="sub" style={{ margin: 0 }}>{count.toLocaleString()} products</p></div><Link className="btn p" href="/admin/products/new">Add product</Link></div>
      <div className="bar" style={{ marginTop: 16 }}>
        <input className="grow" placeholder="Search name or SKU" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search products" />
        <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} aria-label="Category"><option value="">All categories</option>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status"><option value="all">All</option><option value="active">Live on shop</option><option value="hidden">Hidden</option><option value="nostock">No stock</option></select>
      </div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th></th><th>Product</th><th>Category</th><th>Metal</th><th>Weight</th><th>Price today</th><th>Stock</th><th>On shop</th><th></th></tr></thead>
        <tbody>
          {rows.map((p) => {
            const pr = priceProduct(p, rates);
            return (
              <tr key={p.id}>
                <td><div className="th-img">{p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: artSvg(p.category, p.metal, p.stone, p.art_variant) }} />}</div></td>
                <td className="wrap-cell"><Link href={`/admin/products/${p.id}`} style={{ fontWeight: 600, textDecoration: "none" }}>{p.name}</Link><br /><small className="num" style={{ color: "var(--muted)" }}>{p.sku}</small></td>
                <td>{cats.find((c) => c.slug === p.category)?.name ?? p.category}</td>
                <td>{METAL[p.metal]?.short}</td>
                <td className="num">{p.weight_g} g</td>
                <td className="num">{qar(pr.price)}</td>
                <td className="num">{p.stock > 0 ? p.stock : <span className="pill off">0</span>}</td>
                <td><button className={`pill ${p.is_active ? "ok" : "off"}`} style={{ border: 0, cursor: "pointer" }} onClick={() => toggle(p)}>{p.is_active ? "Live" : "Hidden"}</button></td>
                <td><Link href={`/admin/products/${p.id}`} style={{ color: "var(--maroon)" }}>Edit</Link></td>
              </tr>
            );
          })}
          {!rows.length && <tr><td colSpan={9} style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>{loading ? "Loading…" : "No products found. Add one, or import your spreadsheet."}</td></tr>}
        </tbody>
      </table></div>
      {pages > 1 && <div className="bar" style={{ justifyContent: "center", marginTop: 14 }}>
        <button className="btn o" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span className="num">Page {page} of {pages}</span>
        <button className="btn o" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>}
    </>
  );
}
