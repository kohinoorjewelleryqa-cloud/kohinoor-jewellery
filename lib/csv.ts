import { DEFAULT_CATEGORIES, METAL, STONES, GENDERS } from "./constants";
import { slugify } from "./pricing";
import type { Product } from "./types";

export const CSV_COLUMNS = ["sku", "name", "category", "style", "metal", "stone", "carat", "weight_g", "making_pct", "making_discount_pct", "stone_value", "fixed_price", "stock", "occasions", "gender", "collection", "is_new", "is_bestseller", "is_active", "description", "image_urls"] as const;

const yes = (v: unknown) => ["1", "yes", "true", "y"].includes(String(v ?? "").trim().toLowerCase());
const n = (v: unknown) => { const x = parseFloat(String(v ?? "").replace(/,/g, "")); return Number.isFinite(x) ? x : 0; };

export type ParsedRow = { row: Record<string, unknown>; hasImages: boolean };

// Friendly words people type in spreadsheets, mapped to the store's finish codes.
const METAL_ALIAS: Record<string, string> = {
  "925": "ag925", sterling: "ag925", "sterling silver": "ag925", "925 sterling silver": "ag925", silver: "ag925",
  oxidised: "ag925ox", oxidized: "ag925ox", "oxidised silver": "ag925ox", "oxidized silver": "ag925ox",
  "gold-plated": "ag925gp", "gold plated": "ag925gp", "gold-plated silver": "ag925gp", "gold plated silver": "ag925gp",
  "rose-gold-plated": "ag925rp", "rose gold plated": "ag925rp", "rose gold": "ag925rp",
  "999": "ag999", "fine silver": "ag999", "999 fine silver": "ag999",
};
const STONE_ALIAS: Record<string, string> = { "cubic zirconia": "cz", zircon: "cz", zirconia: "cz", "": "none", no: "none" };

/** Validate one spreadsheet row. Returns the database row or an error message. */
export function rowToProduct(r: Record<string, string>, line: number, cats: { slug: string; name: string }[], colSlugs: string[]): ParsedRow | string {
  const g = (k: string) => String(r[k] ?? "").trim();
  const sku = g("sku").toUpperCase(), name = g("name");
  if (!sku) return `Row ${line}: SKU is missing`;
  if (!name) return `Row ${line} (${sku}): name is missing`;
  const catIn = slugify(g("category"));
  const category = cats.find((c) => c.slug === catIn || slugify(c.name) === catIn)?.slug;
  if (!category) return `Row ${line} (${sku}): unknown category “${g("category")}”. Use one of: ${cats.map((c) => c.slug).join(", ")}`;
  const metalIn = g("metal").toLowerCase();
  const metal = METAL[metalIn] ? metalIn : METAL_ALIAS[metalIn];
  if (!metal) return `Row ${line} (${sku}): unknown finish “${g("metal")}”. Use: ${Object.keys(METAL).join(", ")}`;
  const weight = n(g("weight_g"));
  if (!(weight > 0)) return `Row ${line} (${sku}): weight_g must be more than 0`;
  const stoneIn = g("stone").toLowerCase();
  const stone = STONES[stoneIn] ? stoneIn : STONE_ALIAS[stoneIn] ?? stoneIn;
  if (!STONES[stone]) return `Row ${line} (${sku}): unknown stone “${g("stone")}”`;
  const collection = g("collection") ? slugify(g("collection")) : null;
  if (collection && !colSlugs.includes(collection)) return `Row ${line} (${sku}): unknown collection “${g("collection")}”`;
  const gender = GENDERS.find((x) => x.toLowerCase() === g("gender").toLowerCase()) ?? "Women";
  const images = g("image_urls").split(/[;\n]/).map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
  const row: Record<string, unknown> = {
    sku, name, slug: `${slugify(name)}-${slugify(sku)}`, category, style: g("style") || null, metal, stone,
    carat: n(g("carat")), weight_g: weight, making_pct: n(g("making_pct")), making_discount_pct: n(g("making_discount_pct")), stone_value: n(g("stone_value")), fixed_price: n(g("fixed_price")) > 0 ? n(g("fixed_price")) : null,
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
    making_pct: p.making_pct, making_discount_pct: p.making_discount_pct, stone_value: p.stone_value, fixed_price: p.fixed_price ?? "", stock: p.stock, occasions: (p.occasions ?? []).join(";"),
    gender: p.gender, collection: p.collection ?? "", is_new: p.is_new ? "yes" : "no", is_bestseller: p.is_bestseller ? "yes" : "no", is_active: p.is_active ? "yes" : "no",
    description: p.description ?? "", image_urls: (p.images ?? []).join(";"),
  };
}

export const KNOWN_CATEGORIES = DEFAULT_CATEGORIES.map((c) => c.slug);
