"use client";
import { useRef, useState } from "react";
import WishButton from "./WishButton";
import { artSvg, artType } from "@/lib/art";
import { srcSet } from "@/lib/stock";
import type { Product } from "@/lib/types";

/**
 * Product stage: one large view at a time on a soft studio background.
 * Views crossfade; round thumbnails sit on the stage (down the side on wide screens, along the bottom on phones).
 * Swipe on phones, hover to look closer on desktop.
 */
export default function ProductGallery({ p }: { p: Pick<Product, "id" | "name" | "images" | "category" | "style" | "metal" | "stone" | "art_variant"> }) {
  const photos = p.images?.filter(Boolean) ?? [];
  const views = photos.length ? photos.map((src) => ({ src })) : [0, 1, 2, 3].map((v) => ({ v }));
  const [i, setI] = useState(photos.length ? 0 : p.art_variant % 4);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touch = useRef<number | null>(null);
  const n = views.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  const render = (x: { src?: string; v?: number }, eager = false) =>
    x.src
      ? <img className="pimg" src={x.src} srcSet={srcSet(x.src)} sizes="(max-width:860px) 100vw, 55vw" alt={p.name} loading={eager ? "eager" : "lazy"} />
      : <span className="pg-art" dangerouslySetInnerHTML={{ __html: artSvg(artType(p.category, p.style), p.metal, p.stone, x.v ?? 0) }} />;

  return (
    <div className="pg">
      <div
        className={`pg-stage${zoom ? " zoom" : ""}`}
        onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onPointerLeave={() => setZoom(null)}
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1) * (document.dir === "rtl" ? -1 : 1)); }}
      >
        {views.map((x, j) => (
          <div key={j} className={`pg-view${j === i ? " on" : ""}`} aria-hidden={j !== i} style={j === i && zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
            {render(x, j === 0)}
          </div>
        ))}
        <WishButton id={p.id} />
        {n > 1 && (
          <div className="pg-rail" role="tablist" aria-label="Product views">
            {views.map((x, j) => (
              <button key={j} type="button" role="tab" aria-selected={j === i} aria-label={`View ${j + 1} of ${n}`} onClick={() => setI(j)}>{render(x)}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
