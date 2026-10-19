// Fixed reference data. Categories and collections are also stored in the
// database (editable in the admin panel); these are the defaults and the
// fallback used in demo mode.

export const METALS = [
  { id: "yg24", label: "24K Gold 999.9", short: "24K Gold", purity: "999.9", colors: ["#FFE9A6", "#E0AA2E", "#94690A"] },
  { id: "yg22", label: "22K Yellow Gold", short: "22K Gold", purity: "916", colors: ["#FBE3A0", "#D4A23C", "#8C6214"] },
  { id: "yg21", label: "21K Yellow Gold", short: "21K Gold", purity: "875", colors: ["#FADD92", "#CF9A35", "#86600F"] },
  { id: "yg18", label: "18K Yellow Gold", short: "18K Gold", purity: "750", colors: ["#F7E2A8", "#C9A04B", "#88692A"] },
  { id: "wg18", label: "18K White Gold", short: "White Gold", purity: "750", colors: ["#FFFFFF", "#C9CCD1", "#7E838B"] },
  { id: "rg18", label: "18K Rose Gold", short: "Rose Gold", purity: "750", colors: ["#FBD9C9", "#D7967B", "#9A5A44"] },
  { id: "pt", label: "Platinum 950", short: "Platinum", purity: "950", colors: ["#FAFBFC", "#B9BEC6", "#6F7580"] },
  { id: "ag", label: "Sterling Silver 925", short: "Silver", purity: "925", colors: ["#FFFFFF", "#D2D5D9", "#8A8F96"] },
] as const;
export type MetalId = (typeof METALS)[number]["id"];
export const METAL = Object.fromEntries(METALS.map((m) => [m.id, m])) as Record<string, (typeof METALS)[number]>;
export const GOLD_METALS = ["yg24", "yg22", "yg21", "yg18", "wg18", "rg18"];

export const STONES: Record<string, { label: string; color?: string }> = {
  none: { label: "No stone" },
  diamond: { label: "Diamond", color: "#EEF6FF" },
  pearl: { label: "Pearl", color: "#F5EFE4" },
  ruby: { label: "Ruby", color: "#C3123B" },
  emerald: { label: "Emerald", color: "#0E8A5F" },
  sapphire: { label: "Sapphire", color: "#2049B8" },
  polki: { label: "Polki", color: "#F1E9D4" },
  kundan: { label: "Kundan", color: "#E7F1EF" },
};

export const OCCASIONS = ["Wedding", "Engagement", "Anniversary", "Birthday", "Eid", "Daily Wear", "National Day", "Gifting"];
export const GENDERS = ["Women", "Men", "Kids", "Unisex"];

export const DEFAULT_CATEGORIES = [
  { slug: "rings", name: "Rings", sizes: ["6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22"], intro: "Solitaires, eternity bands, signet and cocktail rings in 18K, 21K and 22K gold and platinum. Free resizing within 30 days." },
  { slug: "necklaces", name: "Necklaces", sizes: [], intro: "Chokers, collar necklaces and Rani haars, from light everyday pieces to full bridal statements." },
  { slug: "earrings", name: "Earrings", sizes: [], intro: "Jhumkas, chandbalis, hoops, studs and huggies set with diamonds, pearls and coloured stones." },
  { slug: "bangles", name: "Bangles", sizes: ["2.2","2.4","2.6","2.8","2.10"], intro: "Kadas, filigree and openable bangles sold singly or in pairs, in Gulf sizes 2.2 to 2.10." },
  { slug: "bracelets", name: "Bracelets", sizes: [], intro: "Tennis, link, charm and cuff bracelets for women and men." },
  { slug: "pendants", name: "Pendants", sizes: [], intro: "Hearts, initials, crescents and drops in yellow, white and rose gold." },
  { slug: "chains", name: "Chains", sizes: ["16 in","18 in","20 in","22 in","24 in"], intro: "Rope, box, Cuban, Figaro and Singapore chains from 16 to 24 inches, priced by weight." },
  { slug: "anklets", name: "Anklets", sizes: [], intro: "Traditional payals and charm anklets with fine bells." },
  { slug: "nosepins", name: "Nose Pins", sizes: [], intro: "Delicate studs and naths in gold with diamond and pearl accents." },
  { slug: "sets", name: "Bridal Sets", sizes: [], intro: "Necklace and earring sets in Royal Kundan, polki, emerald and ruby for the wedding season." },
  { slug: "coins", name: "Coins & Bars", sizes: [], intro: "24K 999.9 fine gold coins and bars from 1 g to 100 g, for gifting and saving." },
  { slug: "cufflinks", name: "Cufflinks", sizes: [], intro: "Engraved and stone-set cufflinks in 21K gold for formal occasions." },
];

export const DEFAULT_COLLECTIONS = [
  { slug: "mughal-heritage", name: "Mughal Heritage", description: "Temple motifs, filigree and antique finish" },
  { slug: "doha-pearl", name: "Doha Pearl", description: "Gulf pearls set in 18K and 21K gold" },
  { slug: "royal-kundan", name: "Royal Kundan", description: "Hand-set kundan and polki for brides" },
  { slug: "everyday-lite", name: "Everyday Lite", description: "Light 18K pieces under 5 grams" },
  { slug: "bridal-grandeur", name: "Bridal Grandeur", description: "Statement sets for the wedding day" },
  { slug: "men-of-gold", name: "Men of Gold", description: "Chains, signets and cufflinks" },
];

export const DEFAULT_RATES: Record<string, number> = { yg24: 468, yg22: 430, yg21: 410, yg18: 352, wg18: 352, rg18: 352, pt: 145, ag: 6.2 };

export const QATAR_AREAS = ["Doha", "Lusail", "Al Wakrah", "Al Rayyan", "Al Khor", "Umm Salal", "Al Daayen", "Mesaieed", "Dukhan", "Al Shamal"];

export const ORDER_STATUSES = ["new", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
export const STATUS_LABEL: Record<string, string> = { new: "New", confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled" };
