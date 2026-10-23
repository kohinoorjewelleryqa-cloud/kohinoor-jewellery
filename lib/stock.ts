// Free stock photography (Unsplash License: free for commercial use, no attribution required).
// Used for homepage banners and for SAMPLE products only (SKUs starting "KJS-").
// Real products always show their own uploaded photos. To swap any image, change its id here.

export const img = (id: string, w = 900, dpr = 1) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85${dpr > 1 ? `&dpr=${dpr}` : ""}`;

/** Sharp on high-resolution (Retina) screens: the browser picks the 2× file only where needed. */
export const srcSet = (src: string) => (src.includes("images.unsplash.com") ? `${src}&dpr=2 2x` : undefined);
/** src + srcSet props for a stock photo. */
export const photo = (id: string, w: number) => ({ src: img(id, w), srcSet: `${img(id, w, 2)} 2x` });

export const PHOTOS = {
  rings: ["1590703160323-ac5d3fc14089", "1589674781759-c21c37956a44", "1550368566-f9cc32d7392d", "1583937443566-6fe1a1c6e400", "1590703160416-5b17d229e381", "1561995734-ef4b62bb6586", "1786052347995-41ae3e0279ed"],
  earrings: ["1765464281313-b3844388b316", "1713004539634-a6694a83f3d9", "1535632787350-4e68ef0ac584", "1786052351703-f4a67662ea10", "1659727640714-7e9a1d8b31cb"],
  necklaces: ["1588444968576-f8fe92ce56fd", "1676329947145-99145926d3eb", "1636103952204-0b738c225264", "1558554745-e862ef8538bd", "1625627796701-e3c0911b89f3"],
  bracelets: ["1786052351994-37c1af4c55d7", "1605884878538-6468614df578", "1676120963306-8969fa6a810e", "1786052348368-9c23c72205f9", "1676303679145-8679f5ceeb16"],
  anklets: ["1635770607507-beb7d7972491", "1757331631646-0e1bca72b725"],
  sets: ["1738754697421-77e0120889f6", "1738754719555-05aca36707b1", "1738754681329-e1671088de9f", "1738754835779-cae7fb8907a2"],
  pearl: ["1595345705177-ffe090eb0784", "1515562141207-7a88fb7ce338", "1682629846138-7db022565bd5"],
  men: ["1593295583578-fda964d48b72", "1778759335316-72d5c55683d2"],
  // People wearing silver, for the hero and "Wear it your way"
  lifestyle: ["1788499584615-dee99c3a60f4", "1788886989861-5f8c5868f587", "1524324625284-39263f7046aa", "1761222101900-9c9e34fac2ce", "1744722093742-aad22c7fa68b"],
  display: "1738754932729-6416b38f7cd6", // a table of silver jewellery
  oxidised: "1659727640714-7e9a1d8b31cb",
  heritage: "1767971958465-16d986fad8df", // traditional silver with turquoise and pearl
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
