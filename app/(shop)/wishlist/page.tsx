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
        <div className="panel confirm"><b className="big">No saved pieces yet</b><span style={{ color: "var(--muted)" }}>Tap the heart on any design to save it here.</span><Link className="btn p" href="/shop">Browse jewellery</Link></div>
      )}
    </main>
  );
}
