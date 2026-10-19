"use client";
import { useState } from "react";
import WishButton from "./WishButton";
import { artSvg, artType } from "@/lib/art";
import type { Product } from "@/lib/types";

export default function ProductGallery({ p }: { p: Pick<Product, "id" | "name" | "images" | "category" | "style" | "metal" | "stone" | "art_variant"> }) {
  const photos = p.images?.filter(Boolean) ?? [];
  const views = photos.length ? photos.map((src) => ({ src })) : [0, 1, 2, 3].map((v) => ({ v }));
  const [i, setI] = useState(photos.length ? 0 : p.art_variant % 4);
  const render = (x: { src?: string; v?: number }) =>
    x.src ? <img className="pimg" src={x.src} alt={p.name} /> : <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: artSvg(artType(p.category, p.style), p.metal, p.stone, x.v ?? 0) }} />;
  return (
    <div className="gal">
      {views.length > 1 && (
        <div className="thumbs">
          {views.map((x, j) => <button key={j} type="button" aria-pressed={j === i} aria-label={`View ${j + 1}`} onClick={() => setI(j)}>{render(x)}</button>)}
        </div>
      )}
      <div className="main-im">{render(views[i] ?? views[0])}<WishButton id={p.id} /></div>
    </div>
  );
}
