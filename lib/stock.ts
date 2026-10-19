// Free stock photography (Unsplash License: free for commercial use, no attribution required).
// Used for homepage banners and for SAMPLE products only (SKUs starting "KJS-").
// Real products always show their own uploaded photos. To swap any image, change its id here.

export const img = (id: string, w = 900, dpr = 1) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85${dpr > 1 ? `&dpr=${dpr}` : ""}`;

/** Sharp on high-resolution (Retina) screens: the browser picks the 2× file only where needed. */
export const srcSet = (src: string) => (src.includes("images.unsplash.com") ? `${src}&dpr=2 2x` : undefined);
/** src + srcSet props for a stock photo. */
export const photo = (id: string, w: number) => ({ src: img(id, w), srcSet: `${img(id, w, 2)} 2x` });

export const PHOTOS = {
  rings: ["1620968867360-5cda83d2bffd", "1590703160323-ac5d3fc14089", "1590703160416-5b17d229e381", "1599708978061-501091150ec9", "1705854937134-dd130d90df5d", "1605100804763-247f67b3557e"],
  earrings: ["1587337905415-bb0d87a75610", "1659727640714-7e9a1d8b31cb", "1615854430736-c9fae5a95083"],
  necklaces: ["1599643477877-530eb83abc8e", "1559128625-ca4df9a6e17b", "1573408301185-9146fe634ad0", "1623699654653-5f03c0168a6a", "1599459182681-c938b7f65af0"],
  bracelets: ["1517857399767-a9dc28f5a734", "1605884878538-6468614df578", "1618522761561-f1211c4781dd"],
  sets: ["1738754697421-77e0120889f6", "1738754719555-05aca36707b1", "1738754681329-e1671088de9f", "1738754835779-cae7fb8907a2"],
  pearl: ["1515562141207-7a88fb7ce338", "1595345705177-ffe090eb0784"],
  // People wearing silver, for banners and editorial sections
  lifestyle: ["1611652022419-a9419f74343d", "1608613381851-6a058de0dc11", "1631248622996-ac90313ddc2b", "1587337905415-bb0d87a75610", "1599459182681-c938b7f65af0"],
  display: "1738754932729-6416b38f7cd6",
  oxidised: "1659727640714-7e9a1d8b31cb",
} as const;

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Sample products get 1–3 stock photos from their category; anything else keeps its own photos (or drawings). */
export function samplePhotos(p: { sku: string; category: string; stone: string; images: string[] }): string[] {
  if (p.images?.length || !p.sku.startsWith("KJS-")) return p.images ?? [];
  const pool: readonly string[] | undefined = p.stone === "pearl" && p.category !== "rings" ? PHOTOS.pearl : (PHOTOS as Record<string, unknown>)[p.category] as readonly string[] | undefined;
  if (!pool?.length) return [];
  const h = hash(p.sku);
  const n = Math.min(pool.length, 1 + (h % 3));
  return Array.from({ length: n }, (_, i) => img(pool[(h + i) % pool.length], 1000));
}
