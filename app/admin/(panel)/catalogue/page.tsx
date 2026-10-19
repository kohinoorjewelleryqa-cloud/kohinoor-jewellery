"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop } from "@/lib/admin";
import { slugify } from "@/lib/pricing";
import type { Category, Collection } from "@/lib/types";

export default function CataloguePage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [cols, setCols] = useState<Collection[]>([]);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [newCol, setNewCol] = useState({ name: "", description: "" });

  const load = () => {
    const db = supabaseBrowser();
    db.from("categories").select("*").order("sort_order").then(({ data }) => setCats((data as Category[]) ?? []));
    db.from("collections").select("*").order("sort_order").then(({ data }) => setCols((data as Collection[]) ?? []));
  };
  useEffect(load, []);

  const saveCat = async (c: Category) => {
    const { error } = await supabaseBrowser().from("categories").update({ name: c.name, intro: c.intro, sort_order: c.sort_order, sizes: c.sizes }).eq("slug", c.slug);
    if (!error) await refreshShop();
    setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: `${c.name} saved.` });
  };
  const saveCol = async (c: Collection) => {
    const { error } = await supabaseBrowser().from("collections").update({ name: c.name, description: c.description, sort_order: c.sort_order }).eq("slug", c.slug);
    if (!error) await refreshShop();
    setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: `${c.name} saved.` });
  };
  const addCol = async () => {
    if (!newCol.name.trim()) return;
    const { error } = await supabaseBrowser().from("collections").insert({ slug: slugify(newCol.name), name: newCol.name.trim(), description: newCol.description.trim() || null, sort_order: cols.length + 1 });
    if (!error) { await refreshShop(); setNewCol({ name: "", description: "" }); load(); }
    setMsg(error ? { t: "err", m: error.code === "23505" ? "A collection with that name already exists." : error.message } : { t: "ok", m: "Collection added." });
  };
  const delCol = async (c: Collection) => {
    const { error } = await supabaseBrowser().from("collections").delete().eq("slug", c.slug);
    if (!error) { await refreshShop(); load(); }
    setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: `${c.name} removed. Its products stay on the shop without a collection.` });
  };

  return (
    <>
      <h1>Categories &amp; collections</h1><p className="sub">Rename categories, edit the intro text shown on each category page, and manage collections.</p>
      {msg && <div className={`notice ${msg.t}`}>{msg.m}</div>}
      <div style={{ display: "grid", gap: 16 }}>
        <div className="panel"><h2>Categories</h2>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Name</th><th>Intro text</th><th>Sizes (comma separated)</th><th></th></tr></thead><tbody>
            {cats.map((c, i) => (
              <tr key={c.slug}>
                <td><input style={{ width: 54 }} type="number" value={c.sort_order ?? 0} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, sort_order: Number(e.target.value) } : x)))} aria-label="Order" /></td>
                <td><input value={c.name} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Name" /></td>
                <td className="wrap-cell"><input style={{ width: "100%", minWidth: 260 }} value={c.intro ?? ""} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, intro: e.target.value } : x)))} aria-label="Intro" /></td>
                <td><input value={(c.sizes ?? []).join(", ")} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x)))} aria-label="Sizes" /></td>
                <td><button className="btn o" style={{ padding: "6px 12px" }} onClick={() => saveCat(c)}>Save</button></td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
        <div className="panel"><h2>Collections</h2>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Name</th><th>Description</th><th></th></tr></thead><tbody>
            {cols.map((c, i) => (
              <tr key={c.slug}>
                <td><input style={{ width: 54 }} type="number" value={c.sort_order ?? 0} onChange={(e) => setCols(cols.map((x, j) => (j === i ? { ...x, sort_order: Number(e.target.value) } : x)))} aria-label="Order" /></td>
                <td><input value={c.name} onChange={(e) => setCols(cols.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Name" /></td>
                <td className="wrap-cell"><input style={{ width: "100%", minWidth: 260 }} value={c.description ?? ""} onChange={(e) => setCols(cols.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} aria-label="Description" /></td>
                <td style={{ display: "flex", gap: 6 }}><button className="btn o" style={{ padding: "6px 12px" }} onClick={() => saveCol(c)}>Save</button><button className="btn o" style={{ padding: "6px 12px" }} onClick={() => delCol(c)}>Remove</button></td>
              </tr>
            ))}
          </tbody></table></div>
          <div className="bar" style={{ marginTop: 14 }}>
            <input placeholder="New collection name" value={newCol.name} onChange={(e) => setNewCol({ ...newCol, name: e.target.value })} aria-label="New collection name" />
            <input className="grow" placeholder="Short description" value={newCol.description} onChange={(e) => setNewCol({ ...newCol, description: e.target.value })} aria-label="Description" />
            <button className="btn p" onClick={addCol}>Add collection</button>
          </div>
        </div>
      </div>
    </>
  );
}
