import JewelArt from "./JewelArt";
import type { Product } from "@/lib/types";

/** Shows the product photo, or a drawn illustration until photos are uploaded. */
export default function ProductVisual({ p, index = 0, variant }: { p: Pick<Product, "images" | "category" | "metal" | "stone" | "art_variant" | "name">; index?: number; variant?: number }) {
  const src = p.images?.[index];
  if (src) return <img className="pimg" src={src} alt={p.name} loading="lazy" decoding="async" />;
  return <JewelArt type={p.category} metal={p.metal} stone={p.stone} v={variant ?? p.art_variant} />;
}
