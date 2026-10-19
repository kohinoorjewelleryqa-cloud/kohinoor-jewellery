import { DEFAULT_CATEGORIES, METAL, STONES, GENDERS } from "./constants";
import { slugify } from "./pricing";
import type { Product } from "./types";

export const CSV_COLUMNS = ["sku", "name", "category", "style", "metal", "stone", "carat", "weight_g", "making_pct", "making_discount_pct", "stone_value", "stock", "occasions", "gender", "collection", "is_new", "is_bestseller", "is_active", "description", "image_urls"] as const;

const yes = (v: unknown) => ["1", "yes", "true", "y"].includes(String(v ?? "").trim().toLowerCase());
const n = (v: unknown) => { const x = parseFloat(String(v ?? "").replace(/,/g, "")); return Number.isFinite(x) ? x : 0; };

export type ParsedRow = { row: Record<string, unknown>; hasImages: boolean };

/** Validate one spreadsheet row. Returns the database row or an error message. */
export function rowToProduct(r: Record<string, string>, line: number, catSlugs: string[], colSlugs: string[]): ParsedRow | string {
  const g = (k: string) => String(r[k] ?? "").trim();
  const sku = g("sku").toUpperCase(), name = g("name");
  if (!sku) return `Row ${line}: SKU is missing`;
  if (!name) return `Row ${line} (${sku}): name is missing`;
  const category = slugify(g("category"));
  if (!catSlugs.includes(category)) return `Row ${line} (${sku}): unknown category “${g("category")}”. Use one of: ${catSlugs.join(", ")}`;
  const metal = g("metal").toLowerCase();
  if (!METAL[metal]) return `Row ${line} (${sku}): unknown metal “${g("metal")}”. Use: ${Object.keys(METAL).join(", ")}`;
  const weight = n(g("weight_g"));
  if (!(weight > 0)) return `Row ${line} (${sku}): weight_g must be more than 0`;
  const stone = (g("stone") || "none").toLowerCase();
  if (!STONES[stone]) return `Row ${line} (${sku}): unknown stone “${g("stone")}”`;
  const collection = g("collection") ? slugify(g("collection")) : null;
  if (collection && !colSlugs.includes(collection)) return `Row ${line} (${sku}): unknown collection “${g("collection")}”`;
  const gender = GENDERS.find((x) => x.toLowerCase() === g("gender").toLowerCase()) ?? "Women";
  const images = g("image_urls").split(/[;\n]/).map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
  const row: Record<string, unknown> = {
    sku, name, slug: `${slugify(name)}-${slugify(sku)}`, category, style: g("style") || null, metal, stone,
    carat: n(g("carat")), weight_g: weight, making_pct: n(g("making_pct")), making_discount_pct: n(g("making_discount_pct")), stone_value: n(g("stone_value")),
    stock: Math.max(0, Math.floor(n(g("stock")))), occasions: g("occasions").split(/[;,]/).map((s) => s.trim()).filter(Boolean), gender, collection,
    is_new: yes(g("is_new")), is_bestseller: yes(g("is_bestseller")), is_active: g("is_active") === "" ? true : yes(g("is_active")),
    description: g("description") || null, art_variant: Math.abs([...sku].reduce((a, c) => a + c.charCodeAt(0), 0)) % 4,
  };
  if (images.length) row.images = images;
  return { row, hasImages: images.length > 0 };
}

export function productToCsvRow(p: Product) {
  return {
    sku: p.sku, name: p.name, category: p.category, style: p.style ?? "", metal: p.metal, stone: p.stone, carat: p.carat, weight_g: p.weight_g,
    making_pct: p.making_pct, making_discount_pct: p.making_discount_pct, stone_value: p.stone_value, stock: p.stock, occasions: (p.occasions ?? []).join(";"),
    gender: p.gender, collection: p.collection ?? "", is_new: p.is_new ? "yes" : "no", is_bestseller: p.is_bestseller ? "yes" : "no", is_active: p.is_active ? "yes" : "no",
    description: p.description ?? "", image_urls: (p.images ?? []).join(";"),
  };
}

export const KNOWN_CATEGORIES = DEFAULT_CATEGORIES.map((c) => c.slug);
