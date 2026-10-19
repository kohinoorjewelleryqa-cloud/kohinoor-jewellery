// Fixed reference data for a SILVER-ONLY store.
// Categories and collections are also stored in the database (editable in the
// admin panel); these are the defaults and the fallback used in demo mode.

/** Silver finishes. All 925 finishes are priced at the 925 rate; 999 at the 999 rate. */
export const METALS = [
  { id: "ag925", label: "925 Sterling Silver", short: "Sterling Silver", purity: "925", rateKey: "ag925", colors: ["#FFFFFF", "#D2D5D9", "#8A8F96"] },
  { id: "ag925ox", label: "Oxidised 925 Silver", short: "Oxidised Silver", purity: "925", rateKey: "ag925", colors: ["#C9CBCE", "#7C8086", "#3E4146"] },
  { id: "ag925gp", label: "Gold-plated 925 Silver", short: "Gold-plated Silver", purity: "925", rateKey: "ag925", colors: ["#F7E2A8", "#C9A04B", "#88692A"] },
  { id: "ag925rp", label: "Rose-gold-plated 925 Silver", short: "Rose-gold Silver", purity: "925", rateKey: "ag925", colors: ["#FBD9C9", "#D7967B", "#9A5A44"] },
  { id: "ag999", label: "999 Fine Silver", short: "Fine Silver 999", purity: "999", rateKey: "ag999", colors: ["#FFFFFF", "#E3E5E8", "#9AA0A6"] },
] as const;
export type MetalId = (typeof METALS)[number]["id"];
export const METAL = Object.fromEntries(METALS.map((m) => [m.id, m])) as Record<string, (typeof METALS)[number]>;

/** The two rates the store enters each day (QAR per gram). */
export const RATE_KEYS = [
  { id: "ag999", label: "999 Fine Silver", short: "999" },
  { id: "ag925", label: "925 Sterling Silver", short: "925" },
] as const;
export const DEFAULT_RATES: Record<string, number> = { ag999: 6.4, ag925: 5.95 };
export const rateFor = (rates: Record<string, number>, metal: string) => rates[METAL[metal]?.rateKey ?? "ag925"] ?? 0;

export const STONES: Record<string, { label: string; color?: string }> = {
  none: { label: "No stone" },
  cz: { label: "Cubic zirconia", color: "#EEF6FF" },
  pearl: { label: "Pearl", color: "#F5EFE4" },
  ruby: { label: "Ruby", color: "#C3123B" },
  emerald: { label: "Emerald", color: "#0E8A5F" },
  sapphire: { label: "Sapphire", color: "#2049B8" },
  turquoise: { label: "Turquoise", color: "#3FB8AF" },
};

export const OCCASIONS = ["Everyday", "Office", "Party", "Eid", "Birthday", "Anniversary", "National Day", "Gifting"];
export const GENDERS = ["Women", "Men", "Kids", "Unisex"];

export const DEFAULT_CATEGORIES = [
  { slug: "rings", name: "Rings", sizes: ["6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22"], intro: "Sterling silver bands, statement rings and stackables, plain or set with cubic zirconia and coloured stones. Free resizing within 30 days." },
  { slug: "earrings", name: "Earrings", sizes: [], intro: "Studs, hoops, huggies, drops and oxidised jhumkas in 925 silver." },
  { slug: "necklaces", name: "Necklaces & Pendants", sizes: ["16 in","18 in","20 in","22 in"], intro: "Pendants, chains, chokers and layered necklaces in sterling, oxidised and gold-plated silver." },
  { slug: "bracelets", name: "Bracelets & Bangles", sizes: [], intro: "Tennis and link bracelets, cuffs, kadas and bangles in 925 silver." },
  { slug: "anklets", name: "Anklets", sizes: [], intro: "Traditional silver payals and light everyday anklets." },
  { slug: "sets", name: "Jewellery Sets", sizes: [], intro: "Matching necklace and earring sets, ready to gift." },
];

export const DEFAULT_COLLECTIONS = [
  { slug: "everyday-sterling", name: "Everyday Sterling", description: "Light 925 pieces for daily wear" },
  { slug: "oxidised-heritage", name: "Oxidised Heritage", description: "Antique-finish jhumkas, chokers and payals" },
  { slug: "golden-touch", name: "Golden Touch", description: "Gold-plated sterling silver" },
  { slug: "doha-pearl", name: "Doha Pearl", description: "Pearls set in sterling silver" },
  { slug: "men-in-silver", name: "Men in Silver", description: "Chains, bands and bracelets for men" },
];

export const QATAR_AREAS = ["Doha", "Lusail", "Al Wakrah", "Al Rayyan", "Al Khor", "Umm Salal", "Al Daayen", "Mesaieed", "Dukhan", "Al Shamal"];

export const ORDER_STATUSES = ["new", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
export const STATUS_LABEL: Record<string, string> = { new: "New", confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled" };
