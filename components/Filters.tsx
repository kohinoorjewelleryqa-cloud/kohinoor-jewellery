"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { METALS, STONES, OCCASIONS, GENDERS } from "@/lib/constants";
import type { Filters } from "@/lib/filter";
import type { Category, Collection } from "@/lib/types";

function useUrl() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const update = (fn: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    fn(p);
    p.delete("page");
    const qs = p.toString();
    start(() => router.push(qs ? `${path}?${qs}` : path, { scroll: false }));
  };
  return { sp, update, pending };
}

type Props = {
  f: Filters;
  facets: Record<string, Record<string, number>>;
  locked: string[];
  categories: Category[];
  collections: Collection[];
  total: number;
};

function groups(categories: Category[], collections: Collection[]) {
  return [
    { key: "cat", label: "Category", opts: categories.map((c) => [c.slug, c.name]) },
    { key: "metal", label: "Metal & purity", opts: METALS.map((m) => [m.id, m.label]) },
    { key: "stone", label: "Stone", opts: Object.entries(STONES).map(([k, v]) => [k, v.label]) },
    { key: "occ", label: "Occasion", opts: OCCASIONS.map((o) => [o, o]) },
    { key: "for", label: "For", opts: GENDERS.map((g) => [g, g]) },
    { key: "col", label: "Collection", opts: collections.map((c) => [c.slug, c.name]) },
  ] as { key: keyof Filters; label: string; opts: [string, string][] }[];
}

function Panel({ f, facets, locked, categories, collections, idp }: Props & { idp: string }) {
  const { update } = useUrl();
  const [min, setMin] = useState(f.min?.toString() ?? "");
  const [max, setMax] = useState(f.max?.toString() ?? "");
  useEffect(() => { setMin(f.min?.toString() ?? ""); setMax(f.max?.toString() ?? ""); }, [f.min, f.max]);
  const toggle = (key: string, v: string, on: boolean) => update((p) => {
    const cur = (p.get(key) || "").split(",").filter(Boolean);
    const next = on ? [...new Set([...cur, v])] : cur.filter((x) => x !== v);
    if (next.length) p.set(key, next.join(",")); else p.delete(key);
  });
  const price = (a: string, b: string) => update((p) => { a ? p.set("min", a) : p.delete("min"); b ? p.set("max", b) : p.delete("max"); });
  const flag = (k: string, on: boolean) => update((p) => (on ? p.set(k, "1") : p.delete(k)));

  return (
    <>
      {groups(categories, collections).filter((g) => !locked.includes(g.key as string)).map((g) => {
        const sel = f[g.key] as string[];
        return (
          <div className="fg" key={g.key as string}>
            <h4>{g.label}{sel.length ? <span style={{ color: "var(--maroon)" }}>{sel.length}</span> : null}</h4>
            {g.opts.map(([v, l]) => (
              <label key={v}>
                <input type="checkbox" id={`${idp}-${g.key as string}-${v}`} checked={sel.includes(v)} onChange={(e) => toggle(g.key as string, v, e.target.checked)} />
                {l}<span className="c num">{facets[g.key as string]?.[v] || 0}</span>
              </label>
            ))}
          </div>
        );
      })}
      <div className="fg">
        <h4>Price (QAR)</h4>
        <form className="prange" onSubmit={(e) => { e.preventDefault(); price(min, max); }}>
          <input id={`${idp}-min`} inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} onBlur={() => price(min, max)} aria-label="Minimum price" />
          <span>–</span>
          <input id={`${idp}-max`} inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} onBlur={() => price(min, max)} aria-label="Maximum price" />
        </form>
        <div className="chips" style={{ margin: "10px 0 0" }}>
          {([[0, 1000], [1000, 3000], [3000, 8000], [8000, 20000], [20000, 0]] as const).map(([a, b]) => (
            <button key={a} type="button" className="chip" onClick={() => price(a ? String(a) : "", b ? String(b) : "")}>{b ? `${a.toLocaleString()}–${b.toLocaleString()}` : `${a.toLocaleString()}+`}</button>
          ))}
        </div>
      </div>
      <div className="fg">
        <label><input type="checkbox" id={`${idp}-stock`} checked={f.stock} onChange={(e) => flag("stock", e.target.checked)} />Ready to ship</label>
        {!locked.includes("new") && <label><input type="checkbox" id={`${idp}-new`} checked={f.new} onChange={(e) => flag("new", e.target.checked)} />New arrivals</label>}
        {!locked.includes("best") && <label><input type="checkbox" id={`${idp}-best`} checked={f.best} onChange={(e) => flag("best", e.target.checked)} />Best sellers</label>}
      </div>
    </>
  );
}

export function FilterSidebar(props: Props) {
  return <aside className="filters" aria-label="Filters"><Panel {...props} idp="d" /></aside>;
}

export function FilterButton(props: Props) {
  const [open, setOpen] = useState(false);
  const { pending } = useUrl();
  const n = props.f.cat.length + props.f.metal.length + props.f.stone.length + props.f.occ.length + props.f.for.length + props.f.col.length + (props.f.min != null || props.f.max != null ? 1 : 0) + Number(props.f.stock);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  return (
    <>
      <button className="btn o fbtn" type="button" onClick={() => setOpen(true)}>Filters{n ? ` (${n})` : ""}</button>
      {open && (
        <div>
          <div className="scrim" onClick={() => setOpen(false)} />
          <aside className="drawer start" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="dh"><h3>Filters</h3><button className="ib" type="button" aria-label="Close" onClick={() => setOpen(false)}>✕</button></div>
            <div className="db"><Panel {...props} idp="m" /></div>
            <div className="df"><button className="btn p block" type="button" onClick={() => setOpen(false)}>{pending ? "Updating…" : `Show ${props.total.toLocaleString("en-US")} designs`}</button></div>
          </aside>
        </div>
      )}
    </>
  );
}

export function SortSelect({ value }: { value: string }) {
  const { update } = useUrl();
  return (
    <>
      <label className="sr" htmlFor="sortSel">Sort</label>
      <select id="sortSel" value={value} onChange={(e) => update((p) => (e.target.value === "featured" ? p.delete("sort") : p.set("sort", e.target.value)))}>
        <option value="featured">Featured</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="newest">Newest</option>
        <option value="weight">Heaviest first</option>
      </select>
    </>
  );
}

export function Chips({ f, locked, categories, collections }: Pick<Props, "f" | "locked" | "categories" | "collections">) {
  const { update } = useUrl();
  const chips: { label: string; rm: (p: URLSearchParams) => void }[] = [];
  for (const g of groups(categories, collections)) {
    if (locked.includes(g.key as string)) continue;
    const map = Object.fromEntries(g.opts);
    for (const v of f[g.key] as string[]) chips.push({ label: map[v] || v, rm: (p) => { const n = (p.get(g.key as string) || "").split(",").filter((x) => x && x !== v); n.length ? p.set(g.key as string, n.join(",")) : p.delete(g.key as string); } });
  }
  if (f.min != null || f.max != null) chips.push({ label: `QAR ${f.min ?? 0}–${f.max ?? "∞"}`, rm: (p) => { p.delete("min"); p.delete("max"); } });
  if (f.stock) chips.push({ label: "Ready to ship", rm: (p) => p.delete("stock") });
  if (f.new && !locked.includes("new")) chips.push({ label: "New", rm: (p) => p.delete("new") });
  if (f.best && !locked.includes("best")) chips.push({ label: "Bestseller", rm: (p) => p.delete("best") });
  if (f.q) chips.push({ label: `“${f.q}”`, rm: (p) => p.delete("q") });
  if (!chips.length) return null;
  return (
    <div className="chips">
      {chips.map((c, i) => <span className="chip" key={i}>{c.label}<button type="button" aria-label="Remove" onClick={() => update(c.rm)}>×</button></span>)}
      <button type="button" className="chip clear" onClick={() => update((p) => { for (const k of [...p.keys()]) p.delete(k); })}>Clear all</button>
    </div>
  );
}
