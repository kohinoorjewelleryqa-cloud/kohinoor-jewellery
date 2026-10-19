import type { Product, PricedProduct } from "./types";

export const round5 = (n: number) => Math.round(n / 5) * 5;

/** Price = weight × today's rate + making charge − making discount + stone value. */
export function priceProduct(p: Product, rates: Record<string, number>): PricedProduct {
  const rate = rates[p.metal] ?? 0;
  const metalValue = (p.weight_g || 0) * rate;
  const makingValue = (metalValue * (p.making_pct || 0)) / 100;
  const discountValue = (makingValue * (p.making_discount_pct || 0)) / 100;
  const full = metalValue + makingValue + (p.stone_value || 0);
  const price = round5(full - discountValue);
  return { ...p, metalValue, makingValue, discountValue, price, was: discountValue > 0 ? round5(full) : 0 };
}

export const qar = (n: number) => "QAR " + Math.round(n).toLocaleString("en-US");

export const slugify = (s: string) =>
  String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
