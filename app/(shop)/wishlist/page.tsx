"use client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { useProducts } from "@/lib/useProducts";

export default function WishlistPage() {
  const { wish, ready } = useStore();
  const items = useProducts(wish, ready);
  return (
    <main className="wrap" style={{ paddingBottom: 40 }}>
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Wishlist</span></nav>
      <div className="pagehead"><h1>Wishlist</h1></div>
      {items === null ? <p className="intro-seo">Loading…</p> : items.length ? (
        <><p style={{ color: "var(--muted)", margin: "0 0 14px" }}>{items.length} saved {items.length === 1 ? "piece" : "pieces"}</p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>{items.map((p) => <ProductCard key={p.id} p={p} />)}</div></>
      ) : (
        <div className="panel confirm empty"><span className="empty-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg></span><b className="big">No saved pieces yet</b><span style={{ color: "var(--muted)" }}>Tap the heart on any design to save it here.</span><Link className="btn p" href="/shop">Browse jewellery</Link></div>
      )}
    </main>
  );
}
