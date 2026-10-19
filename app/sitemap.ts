import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, collections } = await getCatalog();
  const fixed = ["", "/shop", "/men", "/kids", "/gifts", "/new-arrivals", "/best-sellers", "/silver-rate", "/about", "/contact", "/faq", "/delivery-returns"];
  return [
    ...fixed.map((p) => ({ url: `${site}${p}`, changeFrequency: "daily" as const })),
    ...categories.map((c) => ({ url: `${site}/jewellery/${c.slug}`, changeFrequency: "daily" as const })),
    ...collections.map((c) => ({ url: `${site}/collections/${c.slug}`, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ url: `${site}/product/${p.slug}`, changeFrequency: "daily" as const })),
  ];
}
export const revalidate = 3600;
