// Demo catalogue: 2,000 realistic sample products, generated deterministically.
// Used (1) automatically when Supabase isn't configured yet, and
// (2) to produce supabase/demo-products-2000.csv for importing.
import type { Product } from "./types";
import { DEFAULT_CATEGORIES, OCCASIONS, DEFAULT_COLLECTIONS } from "./constants";
import { slugify } from "./pricing";

const PLAN: Record<string, { n: number; code: string; w: [number, number]; styles: string[] }> = {
  rings: { n: 320, code: "RG", w: [2.2, 12], styles: ["Solitaire Ring", "Band", "Cocktail Ring", "Eternity Band", "Signet Ring", "Stackable Ring", "Halo Ring", "Twist Ring"] },
  necklaces: { n: 260, code: "NK", w: [8, 60], styles: ["Necklace", "Choker", "Collar Necklace", "Layered Necklace", "Rani Haar", "Lariat Necklace"] },
  earrings: { n: 300, code: "ER", w: [2, 22], styles: ["Drop Earrings", "Jhumka", "Hoop Earrings", "Studs", "Chandbali", "Ear Cuffs", "Huggies"] },
  bangles: { n: 200, code: "BG", w: [10, 48], styles: ["Bangle", "Kada", "Bangle Pair", "Openable Bangle", "Filigree Bangle"] },
  bracelets: { n: 180, code: "BR", w: [4, 28], styles: ["Bracelet", "Tennis Bracelet", "Link Bracelet", "Charm Bracelet", "Cuff Bracelet"] },
  pendants: { n: 200, code: "PD", w: [1.5, 12], styles: ["Pendant", "Heart Pendant", "Initial Pendant", "Drop Pendant", "Crescent Pendant"] },
  chains: { n: 140, code: "CH", w: [4, 45], styles: ["Rope Chain", "Box Chain", "Cuban Chain", "Figaro Chain", "Singapore Chain"] },
  anklets: { n: 80, code: "AK", w: [3, 18], styles: ["Anklet", "Payal", "Charm Anklet"] },
  nosepins: { n: 60, code: "NP", w: [0.4, 2.5], styles: ["Nose Pin", "Nath", "Nose Stud"] },
  sets: { n: 120, code: "ST", w: [40, 180], styles: ["Bridal Set", "Necklace Set", "Wedding Set", "Choker Set"] },
  coins: { n: 80, code: "CB", w: [1, 100], styles: ["Gold Coin", "Gold Bar"] },
  cufflinks: { n: 60, code: "CL", w: [6, 16], styles: ["Cufflinks", "Engraved Cufflinks"] },
};
const MOTIFS = ["Mughal", "Doha", "Al Bidda", "Lusail", "Pearl Diver", "Desert Rose", "Crescent", "Lotus", "Mashrabiya", "Peacock", "Falcon", "Dhow", "Sadu", "Oasis", "Jasmine", "Arabesque", "Halo", "Infinity", "Royal", "Kohinoor", "Zubarah", "Souq", "Najma", "Layla", "Noor", "Aseel", "Qamar", "Yasmin", "Ghazal", "Marjan"];
const SHORT: Record<string, string> = { yg24: "24K", yg22: "22K", yg21: "21K", yg18: "18K", wg18: "White Gold", rg18: "Rose Gold", pt: "Platinum", ag: "Silver" };

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let cache: Product[] | null = null;
export function demoProducts(): Product[] {
  if (cache) return cache;
  const R = rng(20261019);
  const pick = <T,>(a: T[]) => a[Math.floor(R() * a.length)];
  const pickW = (pairs: [string, number][]) => { let s = pairs.reduce((a, p) => a + p[1], 0), r = R() * s; for (const p of pairs) { if ((r -= p[1]) <= 0) return p[0]; } return pairs[0][0]; };
  const out: Product[] = [];
  let id = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const c = PLAN[cat.slug];
    for (let i = 0; i < c.n; i++) {
      id++;
      const style = pick(c.styles);
      let metal = "yg24", stone = "none", carat = 0, gender = "Women";
      if (cat.slug !== "coins") {
        metal = pickW([["yg22", 30], ["yg21", 24], ["yg18", 18], ["wg18", 8], ["rg18", 9], ["pt", cat.slug === "rings" ? 6 : 2], ["ag", 5]]);
        stone = pickW([["none", cat.slug === "chains" ? 90 : 34], ["diamond", 30], ["pearl", 8], ["ruby", 7], ["emerald", 7], ["sapphire", 5], ["polki", cat.slug === "sets" ? 14 : 3], ["kundan", cat.slug === "sets" ? 18 : 3]]);
        if (["wg18", "pt"].includes(metal) && ["polki", "kundan"].includes(stone)) stone = "diamond";
      }
      if (["rings", "chains", "bracelets", "cufflinks"].includes(cat.slug) && R() < (cat.slug === "cufflinks" ? 1 : 0.28)) { gender = "Men"; if (stone !== "none" && R() < 0.6) stone = "none"; }
      else if (["earrings", "bangles", "chains", "anklets", "pendants"].includes(cat.slug) && R() < 0.1) gender = "Kids";
      else if (cat.slug === "coins") gender = "Unisex";
      let w = c.w[0] + Math.pow(R(), 1.7) * (c.w[1] - c.w[0]);
      if (gender === "Kids") w *= 0.45;
      if (cat.slug === "coins") w = pick([1, 2, 4, 5, 8, 10, 20, 50, 100]);
      w = Math.round(w * 1000) / 1000;
      if (stone === "diamond") carat = Math.round((0.08 + Math.pow(R(), 2) * (cat.slug === "sets" ? 6 : cat.slug === "rings" ? 2 : 1.6)) * 100) / 100;
      const making = cat.slug === "coins" ? 3 : metal === "ag" ? 35 : cat.slug === "chains" ? 6 + R() * 5 : stone === "diamond" ? 14 + R() * 8 : 8 + R() * 10;
      let stoneValue = 0;
      if (stone === "diamond") stoneValue = carat * 6500 * (0.8 + R() * 0.5);
      else if (stone === "pearl") stoneValue = 120 + R() * 900;
      else if (["ruby", "emerald", "sapphire"].includes(stone)) stoneValue = 180 + R() * 2600;
      else if (stone === "polki") stoneValue = 900 + R() * 6000;
      else if (stone === "kundan") stoneValue = 300 + R() * 2200;
      const occ = new Set<string>();
      if (cat.slug === "sets" || R() < 0.12) occ.add("Wedding");
      if (stone === "diamond" && cat.slug === "rings") occ.add("Engagement");
      occ.add(pick(OCCASIONS)); if (R() < 0.5) occ.add(pick(OCCASIONS));
      if (w < 5 && cat.slug !== "coins") occ.add("Daily Wear");
      let collection: string | null = null;
      if (cat.slug === "sets" && stone === "kundan") collection = "royal-kundan";
      else if (stone === "pearl" && R() < 0.7) collection = "doha-pearl";
      else if (gender === "Men") collection = "men-of-gold";
      else if (w < 5 && metal.endsWith("18")) collection = "everyday-lite";
      else if (cat.slug === "sets") collection = "bridal-grandeur";
      else if (metal === "yg22" && R() < 0.4) collection = "mughal-heritage";
      const motif = MOTIFS[(id * 7 + i) % MOTIFS.length];
      const sku = `KJ-${c.code}-${String(id).padStart(5, "0")}`;
      const name = `${motif} ${metal === "ag" ? "Silver " : ""}${style}`;
      const offMaking = R() < 0.12;
      const isNew = R() < 0.1, best = R() < 0.08, inStock = R() < 0.82, stock = inStock ? Math.floor(1 + R() * 14) : 0, v = Math.floor(R() * 4);
      out.push({
        id: `demo-${id}`, sku, slug: `${slugify(name)}-${sku.toLowerCase()}`, name, category: cat.slug, style, metal, stone, carat,
        weight_g: w, making_pct: Math.round(making * 10) / 10, making_discount_pct: offMaking ? 20 : 0, stone_value: Math.round(stoneValue),
        stock, occasions: [...occ], gender, collection, is_new: isNew, is_bestseller: best, is_active: true,
        description: `${name} in ${SHORT[metal]}${stone !== "none" ? ` with ${stone}` : ""}. Hallmarked and finished by hand.`,
        images: [], art_variant: v,
      });
    }
  }
  void DEFAULT_COLLECTIONS;
  cache = out;
  return out;
}
