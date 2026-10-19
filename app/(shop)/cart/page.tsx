"use client";
import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";
import { useStore } from "@/components/StoreProvider";
import { useProducts } from "@/lib/useProducts";
import { METAL } from "@/lib/constants";
import { qar } from "@/lib/pricing";

export default function CartPage() {
  const { cart, ready, setQty, removeLine, toggleWish, wish } = useStore();
  const products = useProducts([...new Set(cart.map((l) => l.id))], ready);
  const lines = cart.map((l) => ({ ...l, p: products?.find((p) => p.id === l.id) })).filter((l) => l.p);
  const total = lines.reduce((a, l) => a + l.p!.price * l.qty, 0);

  return (
    <main className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shopping bag</span></nav>
      <div className="pagehead"><h1>Shopping bag</h1></div>
      {!ready || products === null ? <p className="intro-seo">Loading your bag…</p> : !lines.length ? (
        <div className="panel confirm"><b className="big">Your bag is empty</b><span style={{ color: "var(--muted)" }}>Browse our designs and add your favourites.</span><Link className="btn p" href="/shop">Start shopping</Link></div>
      ) : (
        <div className="two">
          <div className="panel"><h2>{lines.length} {lines.length === 1 ? "piece" : "pieces"}</h2>
            {lines.map(({ p, size, qty }) => (
              <div className="bagrow" key={`${p!.id}-${size}`}>
                <Link className="th" href={`/product/${p!.slug}`}><ProductVisual p={p!} /></Link>
                <div style={{ minWidth: 0 }}>
                  <Link href={`/product/${p!.slug}`}>{p!.name}</Link>
                  <small className="num">{p!.sku} · {METAL[p!.metal]?.short} · {p!.weight_g.toFixed(2)} g{size ? ` · Size ${size}` : ""}</small>
                  <span className="qty"><button type="button" aria-label="Decrease" onClick={() => setQty(p!.id, size, qty - 1)}>−</button><span className="num">{qty}</span><button type="button" aria-label="Increase" onClick={() => setQty(p!.id, size, qty + 1)}>+</button></span>
                </div>
                <div style={{ textAlign: "end", display: "grid", gap: 6, justifyItems: "end" }}>
                  <b className="num">{qar(p!.price * qty)}</b>
                  <button className="rm" type="button" onClick={() => removeLine(p!.id, size)}>Remove</button>
                  <button className="rm" type="button" onClick={() => { if (!wish.includes(p!.id)) toggleWish(p!.id); removeLine(p!.id, size); }}>Move to wishlist</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="panel summary"><h2>Order summary</h2>
            <div className="sum num"><span>Subtotal</span><span>{qar(total)}</span></div>
            <div className="sum"><span>Delivery in Qatar</span><span style={{ color: "var(--ok)" }}>Free</span></div>
            <div className="sum t num"><span>Total</span><span>{qar(total)}</span></div>
            <Link className="btn p block" href="/checkout">Checkout</Link>
            <Link className="btn o block" href="/shop">Continue shopping</Link>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>Prices follow today&apos;s silver rate and are confirmed when you place the order.</p>
          </aside>
        </div>
      )}
    </main>
  );
}
