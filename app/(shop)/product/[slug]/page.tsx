import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { getCatalog, getDescription } from "@/lib/catalog";
import { METAL, STONES } from "@/lib/constants";
import { qar } from "@/lib/pricing";

type Props = { params: Promise<{ slug: string }> };
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCatalog()).products.find((x) => x.slug === slug);
  if (!p) return {};
  const desc = `${p.name} in ${METAL[p.metal]?.label}, ${p.weight_g} g. ${qar(p.price)}. SKU ${p.sku}. Same-day delivery in Doha.`;
  return { title: `${p.name} · ${p.sku}`, description: desc, alternates: { canonical: `/product/${p.slug}` }, openGraph: { title: p.name, description: desc, images: p.images?.[0] ? [p.images[0]] : undefined } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCatalog();
  const p = cat.products.find((x) => x.slug === slug);
  if (!p) notFound();
  const c = cat.categories.find((x) => x.slug === p.category);
  const col = cat.collections.find((x) => x.slug === p.collection);
  const m = METAL[p.metal];
  const description = await getDescription(p);
  const rate = p.rate;
  const similar = cat.products.filter((x) => x.id !== p.id && x.category === p.category && (x.metal === p.metal || x.stone === p.stone)).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 10);
  const more = col ? cat.products.filter((x) => x.collection === col.slug && x.category !== p.category).slice(0, 10) : [];
  const url = `${site}/product/${p.slug}`;
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.sku, image: p.images?.length ? p.images : undefined, description: description || undefined,
    brand: { "@type": "Brand", name: "Kohinoor Jewellery" }, material: m?.label,
    offers: { "@type": "Offer", priceCurrency: "QAR", price: p.price, url, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder" },
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>{c && <><Link href={`/jewellery/${c.slug}`}>{c.name}</Link><span>/</span></>}<span>{p.name}</span></nav>
      <div className="pdp">
        <ProductGallery p={p} />
        <div className="info">
          <span className="sku num">{p.sku} · {m?.label}</span>
          <h1>{p.name}</h1>
          <div className="price num">{qar(p.price)} {p.was ? <s style={{ fontSize: 16, color: "var(--muted)", fontWeight: 400 }}>{qar(p.was)}</s> : null}<small>{p.isFixed ? "Inclusive of all charges." : "Inclusive of all charges. Updates daily with the silver rate."}</small></div>
          <ProductActions id={p.id} name={p.name} sku={p.sku} price={qar(p.price)} sizes={c?.sizes ?? []} sizeLabel={p.category === "necklaces" ? "Length" : "Size"} whatsapp={cat.settings.whatsapp} url={url} />
          <div className="note">{p.stock > 0 ? <><b style={{ color: "var(--ok)" }}>In stock</b> · Same-day delivery in Doha, Lusail and Al Wakrah.</> : <><b>Made to order</b> · Ready in 7–14 days.</>} Questions? WhatsApp {cat.settings.phone}</div>
          {!p.isFixed && <div className="box"><h3>Price breakdown</h3>
            <table className="brk num"><tbody>
              <tr><td>{m?.label} <small>{p.weight_g.toFixed(3)} g × {rate.toFixed(2)}</small></td><td>{qar(p.metalValue)}</td></tr>
              <tr><td>Making charges <small>{p.making_pct}%{p.making_discount_pct ? ` · ${p.making_discount_pct}% off` : ""}</small></td><td>{qar(p.makingValue - p.discountValue)}</td></tr>
              {p.stone !== "none" && <tr><td>{STONES[p.stone]?.label ?? p.stone}</td><td>{qar(p.stone_value)}</td></tr>}
              <tr className="tot"><td>Total</td><td>{qar(p.price)}</td></tr>
            </tbody></table>
          </div>}
          {description && <div className="box"><h3>Description</h3><p style={{ margin: 0, color: "var(--muted)" }}>{description}</p></div>}
          <div className="box"><h3>Product details</h3>
            <dl className="specs num">
              <dt>SKU</dt><dd>{p.sku}</dd><dt>Silver</dt><dd>{m?.label}</dd><dt>Gross weight</dt><dd>{p.weight_g.toFixed(3)} g</dd>
              {p.stone !== "none" && <><dt>Stone</dt><dd>{STONES[p.stone]?.label ?? p.stone}</dd></>}
              {p.style && <><dt>Style</dt><dd>{p.style}</dd></>}
              {col && <><dt>Collection</dt><dd><Link href={`/collections/${col.slug}`} style={{ color: "var(--maroon)" }}>{col.name}</Link></dd></>}
              <dt>For</dt><dd>{p.gender}</dd>
              {p.occasions.length > 0 && <><dt>Occasion</dt><dd>{p.occasions.join(", ")}</dd></>}
              <dt>Hallmark</dt><dd>{m?.purity === "999" ? "999 fine silver stamp" : "925 sterling silver stamp"}</dd>
            </dl>
          </div>
        </div>
      </div>
      {similar.length > 0 && <section className="row"><div className="sh"><h2>Similar designs</h2>{c && <Link className="more" href={`/jewellery/${c.slug}`}>View all →</Link>}</div><div className="rail">{similar.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}
      {more.length > 0 && col && <section className="row"><div className="sh"><h2>More from {col.name}</h2><Link className="more" href={`/collections/${col.slug}`}>View all →</Link></div><div className="rail">{more.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}
      <RecentlyViewed current={p.id} />
    </main>
  );
}
