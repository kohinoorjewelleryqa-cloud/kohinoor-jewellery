// Demo catalogue: 2,000 realistic SILVER sample products, generated deterministically.
// Used (1) automatically when Supabase isn't configured yet, and
// (2) to produce supabase/demo-products-2000.csv for importing.
import type { Product } from "./types";
import { DEFAULT_CATEGORIES, OCCASIONS } from "./constants";
import { slugify } from "./pricing";

const PLAN: Record<string, { n: number; code: string; w: [number, number]; styles: string[] }> = {
  rings: { n: 380, code: "RG", w: [2, 12], styles: ["Band", "Statement Ring", "Stackable Ring", "Solitaire Ring", "Signet Ring", "Twist Ring", "Halo Ring", "Adjustable Ring"] },
  earrings: { n: 420, code: "ER", w: [1.5, 16], styles: ["Studs", "Hoop Earrings", "Huggies", "Drop Earrings", "Jhumka", "Chandbali", "Ear Cuffs"] },
  necklaces: { n: 450, code: "NK", w: [3, 55], styles: ["Pendant", "Heart Pendant", "Initial Pendant", "Crescent Pendant", "Rope Chain", "Box Chain", "Cuban Chain", "Choker", "Layered Necklace", "Statement Necklace"] },
  bracelets: { n: 360, code: "BR", w: [5, 45], styles: ["Tennis Bracelet", "Link Bracelet", "Charm Bracelet", "Cuff Bracelet", "Bangle", "Kada", "Bangle Pair"] },
  anklets: { n: 190, code: "AK", w: [6, 60], styles: ["Payal", "Anklet", "Charm Anklet", "Ghungroo Payal"] },
  sets: { n: 200, code: "ST", w: [15, 110], styles: ["Necklace Set", "Pendant Set", "Choker Set", "Party Set"] },
};
const MOTIFS = ["Doha", "Al Bidda", "Lusail", "Pearl Diver", "Desert Rose", "Crescent", "Lotus", "Mashrabiya", "Falcon", "Dhow", "Sadu", "Oasis", "Jasmine", "Arabesque", "Halo", "Infinity", "Najma", "Layla", "Noor", "Aseel", "Qamar", "Yasmin", "Ghazal", "Marjan", "Souq", "Zubarah", "Kohinoor", "Moonlight", "Sahara", "Corniche"];
const FINISH_NAME: Record<string, string> = { ag925: "sterling silver", ag925ox: "oxidised silver", ag925gp: "gold-plated silver", ag925rp: "rose-gold-plated silver", ag999: "999 fine silver" };

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
  const R = rng(20261020);
  const pick = <T,>(a: T[]) => a[Math.floor(R() * a.length)];
  const pickW = (pairs: [string, number][]) => { let s = pairs.reduce((a, p) => a + p[1], 0), r = R() * s; for (const p of pairs) { if ((r -= p[1]) <= 0) return p[0]; } return pairs[0][0]; };
  const out: Product[] = [];
  let id = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const c = PLAN[cat.slug];
    for (let i = 0; i < c.n; i++) {
      id++;
      const style = pick(c.styles);
      const traditional = ["Jhumka", "Chandbali", "Payal", "Ghungroo Payal", "Kada", "Choker"].includes(style);
      let metal = pickW([["ag925", 52], ["ag925ox", traditional ? 40 : 10], ["ag925gp", 18], ["ag925rp", 10], ["ag999", cat.slug === "bracelets" || cat.slug === "anklets" ? 8 : 2]]);
      let stone = pickW([["none", style.includes("Chain") ? 90 : 38], ["cz", 34], ["pearl", 9], ["ruby", 5], ["emerald", 5], ["sapphire", 4], ["turquoise", metal === "ag925ox" ? 12 : 3]]);
      let gender = "Women";
      if (["rings", "bracelets", "necklaces"].includes(cat.slug) && R() < (style.includes("Chain") || style === "Signet Ring" || style === "Kada" ? 0.7 : 0.15)) { gender = "Men"; if (stone !== "none" && R() < 0.7) stone = "none"; if (metal === "ag925rp") metal = "ag925"; }
      else if (["earrings", "bracelets", "anklets", "necklaces"].includes(cat.slug) && R() < 0.1) gender = "Kids";
      let w = c.w[0] + Math.pow(R(), 1.6) * (c.w[1] - c.w[0]);
      if (gender === "Kids") w *= 0.5;
      w = Math.round(w * 100) / 100;
      const making = Math.round((metal === "ag999" ? 40 + R() * 40 : 90 + R() * 140) * 10) / 10;
      let stoneValue = 0;
      if (stone === "cz") stoneValue = 10 + R() * 70;
      else if (stone === "pearl") stoneValue = 30 + R() * 170;
      else if (stone !== "none") stoneValue = 40 + R() * 260;
      const occ = new Set<string>();
      occ.add(pick(OCCASIONS)); if (R() < 0.5) occ.add(pick(OCCASIONS));
      if (w < 6) occ.add("Everyday");
      if (cat.slug === "sets") occ.add("Gifting");
      let collection: string | null = null;
      if (gender === "Men") collection = "men-in-silver";
      else if (stone === "pearl" && R() < 0.8) collection = "doha-pearl";
      else if (metal === "ag925ox") collection = "oxidised-heritage";
      else if (metal === "ag925gp" && R() < 0.8) collection = "golden-touch";
      else if (w < 6 && metal === "ag925") collection = "everyday-sterling";
      const motif = MOTIFS[(id * 7 + i) % MOTIFS.length];
      const sku = `KJS-${c.code}-${String(id).padStart(5, "0")}`;
      const name = `${motif} ${metal === "ag925ox" ? "Oxidised " : metal === "ag925gp" ? "Gold-plated " : ""}${style}`;
      const offMaking = R() < 0.12;
      const isNew = R() < 0.1, best = R() < 0.08, stock = R() < 0.85 ? Math.floor(1 + R() * 20) : 0, v = Math.floor(R() * 4);
      out.push({
        id: `demo-${id}`, sku, slug: `${slugify(name)}-${sku.toLowerCase()}`, name, category: cat.slug, style, metal, stone, carat: 0,
        weight_g: w, making_pct: making, making_discount_pct: offMaking ? 20 : 0, stone_value: Math.round(stoneValue), fixed_price: null,
        stock, occasions: [...occ], gender, collection, is_new: isNew, is_bestseller: best, is_active: true,
        description: `${name} in ${FINISH_NAME[metal]}${stone !== "none" ? ` with ${stone === "cz" ? "cubic zirconia" : stone}` : ""}. 925 hallmarked and finished by hand.`.replace("925 hallmarked", metal === "ag999" ? "999 stamped" : "925 hallmarked"),
        images: [], art_variant: v,
      });
    }
  }
  cache = out;
  return out;
}
