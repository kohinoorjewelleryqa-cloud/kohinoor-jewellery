import type { PricedProduct } from "./types";
import { METAL, STONES } from "./constants";

export type Filters = {
  q: string;
  cat: string[];
  metal: string[];
  stone: string[];
  occ: string[];
  for: string[];
  col: string[];
  min: number | null;
  max: number | null;
  new: boolean;
  best: boolean;
  stock: boolean;
  sort: string;
  page: number;
};

export const LIST_KEYS = ["cat", "metal", "stone", "occ", "for", "col"] as const;
export const PER_PAGE = 24;

type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(",") : v || "").split(",").map((s) => s.trim()).filter(Boolean);

export function parseFilters(sp: SP, preset: Partial<Filters> = {}): Filters {
  const one = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined)) || "";
  const f: Filters = {
    q: one("q"),
    cat: arr(sp.cat), metal: arr(sp.metal), stone: arr(sp.stone), occ: arr(sp.occ), for: arr(sp.for), col: arr(sp.col),
    min: one("min") ? Number(one("min")) : null,
    max: one("max") ? Number(one("max")) : null,
    new: one("new") === "1", best: one("best") === "1", stock: one("stock") === "1",
    sort: one("sort") || "featured",
    page: Math.max(1, parseInt(one("page") || "1", 10) || 1),
  };
  for (const k of LIST_KEYS) if (!f[k].length && preset[k]?.length) f[k] = preset[k] as string[];
  if (preset.new) f.new = true;
  if (preset.best) f.best = true;
  return f;
}

function match(p: PricedProduct, f: Filters, skip?: string) {
  if (skip !== "cat" && f.cat.length && !f.cat.includes(p.category)) return false;
  if (skip !== "metal" && f.metal.length && !f.metal.includes(p.metal)) return false;
  if (skip !== "stone" && f.stone.length && !f.stone.includes(p.stone)) return false;
  if (skip !== "occ" && f.occ.length && !p.occasions.some((o) => f.occ.includes(o))) return false;
  if (skip !== "for" && f.for.length && !f.for.includes(p.gender)) return false;
  if (skip !== "col" && f.col.length && !f.col.includes(p.collection || "")) return false;
  if (f.min != null && p.price < f.min) return false;
  if (f.max != null && p.price > f.max) return false;
  if (f.new && !p.is_new) return false;
  if (f.best && !p.is_bestseller) return false;
  if (f.stock && p.stock <= 0) return false;
  if (f.q) {
    const hay = `${p.name} ${p.sku} ${p.category} ${p.style ?? ""} ${METAL[p.metal]?.label ?? ""} ${STONES[p.stone]?.label ?? ""} ${p.collection ?? ""} ${p.occasions.join(" ")} ${p.gender}`.toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  return true;
}

export function applyFilters(all: PricedProduct[], f: Filters) {
  const list = all.filter((p) => match(p, f));
  const score = (p: PricedProduct) => (p.is_bestseller ? 3 : 0) + (p.is_new ? 2 : 0) + (p.stock > 0 ? 1 : 0);
  switch (f.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "newest": list.sort((a, b) => Number(b.is_new) - Number(a.is_new) || (b.created_at || b.sku).localeCompare(a.created_at || a.sku)); break;
    case "weight": list.sort((a, b) => b.weight_g - a.weight_g); break;
    default: list.sort((a, b) => score(b) - score(a) || a.sku.localeCompare(b.sku));
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(f.page, pages);
  return { total, pages, page, items: list.slice((page - 1) * PER_PAGE, page * PER_PAGE) };
}

/** Counts per option for each filter group, honouring the other active filters. */
export function facetCounts(all: PricedProduct[], f: Filters) {
  const out: Record<string, Record<string, number>> = {};
  const acc: Record<string, (p: PricedProduct) => string[]> = {
    cat: (p) => [p.category], metal: (p) => [p.metal], stone: (p) => [p.stone], occ: (p) => p.occasions, for: (p) => [p.gender], col: (p) => (p.collection ? [p.collection] : []),
  };
  for (const k of LIST_KEYS) {
    const m: Record<string, number> = {};
    for (const p of all) if (match(p, f, k)) for (const v of acc[k](p)) m[v] = (m[v] || 0) + 1;
    out[k] = m;
  }
  return out;
}
