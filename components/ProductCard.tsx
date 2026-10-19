import Link from "next/link";
import ProductVisual from "./ProductVisual";
import WishButton from "./WishButton";
import { METAL } from "@/lib/constants";
import { qar } from "@/lib/pricing";
import type { PricedProduct } from "@/lib/types";

export default function ProductCard({ p }: { p: PricedProduct }) {
  const badge = p.is_bestseller ? <span className="badge">Bestseller</span> : p.is_new ? <span className="badge gold">New</span> : p.making_discount_pct > 0 ? <span className="badge gold">{p.making_discount_pct}% off making</span> : null;
  const href = `/product/${p.slug}`;
  return (
    <article className="card">
      {badge}
      <Link className="im" href={href} aria-label={p.name} prefetch={false}><ProductVisual p={p} /></Link>
      <WishButton id={p.id} />
      <div className="bd">
        <Link className="nm" href={href} prefetch={false}>{p.name}</Link>
        <span className="spec num">{METAL[p.metal]?.short} · {p.weight_g.toFixed(p.weight_g < 10 ? 2 : 1)} g{p.carat ? ` · ${p.carat} ct` : ""}</span>
        <div className="pr num"><b>{qar(p.price)}</b>{p.was ? <s>{qar(p.was)}</s> : null}</div>
        {p.stock > 0 ? <span className="dl">● Same-day in Doha</span> : <span className="dl mto">Made to order · 7–14 days</span>}
      </div>
    </article>
  );
}
