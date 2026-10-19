import "server-only";
import { unstable_cache } from "next/cache";
import { publicClient, supabaseConfigured } from "./supabase-server";
import { priceProduct } from "./pricing";
import { demoProducts } from "./demo";
import { DEFAULT_CATEGORIES, DEFAULT_COLLECTIONS, DEFAULT_RATES } from "./constants";
import type { Catalog, Category, Collection, Product, Settings, PricedProduct } from "./types";

const DEMO_SETTINGS: Settings = {
  store_name: "Kohinoor Jewellery",
  phone: "+974 0000 0000",
  whatsapp: "97400000000",
  email: "info@example.com",
  address: "Showroom address, Doha, Qatar",
  hours: "Sat–Thu 10 am–10 pm · Fri 4 pm–10 pm",
  rates: DEFAULT_RATES,
  rates_updated_at: null,
};

const PRODUCT_COLUMNS =
  "id,sku,slug,name,category,style,metal,stone,carat,weight_g,making_pct,making_discount_pct,stone_value,stock,occasions,gender,collection,is_new,is_bestseller,is_active,images,art_variant,created_at";

async function loadFromSupabase(): Promise<Omit<Catalog, "products"> & { raw: Product[] }> {
  const db = publicClient();
  const [s, c, k] = await Promise.all([
    db.from("settings").select("*").eq("id", 1).maybeSingle(),
    db.from("categories").select("*").order("sort_order"),
    db.from("collections").select("*").order("sort_order"),
  ]);
  if (s.error) throw s.error;
  // Supabase returns at most 1,000 rows per request, so page through.
  const raw: Product[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("products").select(PRODUCT_COLUMNS).eq("is_active", true).order("created_at", { ascending: false }).range(from, from + 999);
    if (error) throw error;
    raw.push(...((data ?? []) as unknown as Product[]).map((p) => ({ ...p, description: null })));
    if (!data || data.length < 1000) break;
  }
  const settings = { ...DEMO_SETTINGS, ...(s.data ?? {}) } as Settings;
  settings.rates = { ...DEFAULT_RATES, ...(s.data?.rates ?? {}) };
  return {
    raw,
    settings,
    categories: ((c.data as Category[]) ?? []).map((x) => ({ ...x, sizes: x.sizes ?? [] })),
    collections: (k.data as Collection[]) ?? [],
    demo: false,
  };
}

// Descriptions are loaded per product page to keep the cached catalogue small.
const cachedDescription = unstable_cache(
  async (slug: string) => {
    const { data } = await publicClient().from("products").select("description").eq("slug", slug).maybeSingle();
    return (data?.description as string | null) ?? null;
  },
  ["kj-desc-v1"],
  { tags: ["catalog"], revalidate: 600 }
);
export async function getDescription(p: Product): Promise<string | null> {
  if (!supabaseConfigured) return p.description;
  return cachedDescription(p.slug);
}

const cachedLoad = unstable_cache(loadFromSupabase, ["kj-catalog-v1"], { tags: ["catalog"], revalidate: 600 });

export async function getCatalog(): Promise<Catalog> {
  if (!supabaseConfigured) {
    const settings = DEMO_SETTINGS;
    return {
      products: demoProducts().map((p) => priceProduct(p, settings.rates)),
      categories: DEFAULT_CATEGORIES,
      collections: DEFAULT_COLLECTIONS,
      settings,
      demo: true,
    };
  }
  const { raw, ...rest } = await cachedLoad();
  return { ...rest, products: raw.map((p) => priceProduct(p, rest.settings.rates)) };
}

export async function getProductBySlug(slug: string): Promise<PricedProduct | undefined> {
  const cat = await getCatalog();
  return cat.products.find((p) => p.slug === slug);
}
