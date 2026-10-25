"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import { startProgress } from "./NavProgress";

export default function ProductActions({ id, name, sku, price, sizes, sizeLabel, whatsapp, url }: { id: string; name: string; sku: string; price: string; sizes: string[]; sizeLabel: string; whatsapp: string; url: string }) {
  const { addToCart, toast } = useStore();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(sizes.length ? sizes[Math.floor(sizes.length / 2)] : null);
  const acts = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // The buy bar slides up once the main buttons have scrolled out of view.
  useEffect(() => {
    const el = acts.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const add = () => { addToCart(id, size); toast(`Added to bag · ${name}`, "/cart", "View bag"); };
  const msg = `Hello Kohinoor Jewellery, I'd like to order:\n${name}\nSKU: ${sku}${size ? `\n${sizeLabel}: ${size}` : ""}\nPrice shown: ${price}\n${url}`;
  return (
    <>
      {sizes.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{sizeLabel} <Link href="/faq#size" style={{ fontWeight: 400, color: "var(--maroon)" }}>Size guide</Link></div>
          <div className="sizes">{sizes.map((s) => <button key={s} type="button" aria-pressed={s === size} onClick={() => setSize(s)}>{s}</button>)}</div>
        </div>
      )}
      <div className="acts" ref={acts}>
        <a className="btn wa-btn" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener">Order on WhatsApp</a>
        <button className="btn p" type="button" onClick={add}>Add to bag</button>
        <button className="btn o" type="button" onClick={() => { addToCart(id, size); startProgress(); router.push("/checkout"); }}>Buy now</button>
      </div>
      {mounted && createPortal(<div className={`buybar${bar ? " on" : ""}`} aria-hidden={!bar}>
        <div className="buybar-in">
          <div className="buybar-t"><b>{name}</b><span className="num">{price}{size ? ` · ${sizeLabel} ${size}` : ""}</span></div>
          <button className="btn p" type="button" tabIndex={bar ? 0 : -1} onClick={add}>Add to bag</button>
        </div>
      </div>, document.body)}
    </>
  );
}
