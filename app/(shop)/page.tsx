import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import JewelArt from "@/components/JewelArt";
import ProductCard from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { METALS, OCCASIONS } from "@/lib/constants";
import type { PricedProduct } from "@/lib/types";

export const revalidate = 600;

const OCC_ART: Record<string, [string, string, string, number]> = {
  Wedding: ["sets", "yg22", "kundan", 1], Engagement: ["rings", "pt", "diamond", 0], Anniversary: ["bracelets", "wg18", "diamond", 1], Birthday: ["pendants", "rg18", "diamond", 0],
  Eid: ["bangles", "yg21", "none", 2], "Daily Wear": ["earrings", "yg18", "diamond", 3], "National Day": ["pendants", "yg21", "ruby", 3], Gifting: ["coins", "yg24", "none", 0],
};
const CAT_ART: Record<string, [string, string, number]> = {
  rings: ["yg22", "diamond", 1], necklaces: ["yg21", "ruby", 1], earrings: ["wg18", "pearl", 1], bangles: ["yg22", "none", 2], bracelets: ["rg18", "diamond", 1], pendants: ["yg18", "emerald", 0],
  chains: ["yg21", "none", 0], anklets: ["yg22", "none", 0], nosepins: ["yg18", "diamond", 1], sets: ["yg22", "kundan", 1], coins: ["yg24", "none", 1], cufflinks: ["yg21", "sapphire", 0],
};
const COL_ART: Record<string, [string, string, string, number]> = {
  "mughal-heritage": ["necklaces", "yg22", "ruby", 0], "doha-pearl": ["earrings", "yg18", "pearl", 1], "royal-kundan": ["sets", "yg22", "kundan", 0],
  "everyday-lite": ["pendants", "rg18", "diamond", 0], "bridal-grandeur": ["sets", "yg21", "emerald", 0], "men-of-gold": ["rings", "yg21", "none", 1],
};

function Rail({ eyebrow, title, href, items }: { eyebrow: string; title: string; href: string; items: PricedProduct[] }) {
  if (!items.length) return null;
  return (
    <section className="row"><div className="wrap">
      <div className="sh"><h2><small>{eyebrow}</small>{title}</h2><Link href={href}>View all →</Link></div>
      <div className="rail">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div></section>
  );
}

export default async function Home() {
  const { products, categories, collections } = await getCatalog();
  const count = (fn: (p: PricedProduct) => boolean) => products.filter(fn).length;
  const best = products.filter((p) => p.is_bestseller).slice(0, 15);
  const bridal = products.filter((p) => p.category === "sets").sort((a, b) => b.price - a.price).slice(0, 15);
  const diamonds = products.filter((p) => p.stone === "diamond" && p.category === "rings").slice(0, 15);
  const fresh = products.filter((p) => p.is_new).slice(0, 15);

  return (
    <main>
      <section className="hero"><div className="wrap">
        <HeroSlider>
          <div className="slide"><div className="copy"><span className="eyebrow">Bridal Collection 2026</span><h1>Treasures worthy of <i>a crown</i></h1><p>Royal Kundan and polki sets in 22K gold, hand-finished for the wedding season in Doha.</p><Link className="btn g" href="/jewellery/sets">Shop bridal sets</Link></div><div className="art"><JewelArt type="sets" metal="yg22" stone="kundan" v={1} /></div></div>
          <div className="slide"><div className="copy"><span className="eyebrow">Qatar National Day · 18 December</span><h2>Wear the <i>maroon</i> with pride</h2><p>Ruby-set gold pendants, crescents and bangles for the national celebration.</p><Link className="btn g" href="/shop?occ=National%20Day">Shop the edit</Link></div><div className="art"><JewelArt type="pendants" metal="yg21" stone="ruby" v={3} /></div></div>
          <div className="slide"><div className="copy"><span className="eyebrow">Everyday Lite</span><h2>18K under <i>5 grams</i></h2><p>Light diamond studs, pendants and huggies for daily wear, priced at today&apos;s rate.</p><Link className="btn g" href="/collections/everyday-lite">Shop everyday</Link></div><div className="art"><JewelArt type="rings" metal="rg18" stone="diamond" v={3} /></div></div>
        </HeroSlider>
        <div className="trust">
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z" /><path d="m9 12 2 2 4-4" /></svg><p style={{ margin: 0 }}><b>Hallmarked gold</b><span>Purity stamped on every piece</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M12 21 8 9l4-6 4 6z" /></svg><p style={{ margin: 0 }}><b>Certified diamonds</b><span>Lab report above 0.30 ct</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg><p style={{ margin: 0 }}><b>Same-day in Doha</b><span>Insured, signed delivery</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></svg><p style={{ margin: 0 }}><b>Lifetime exchange</b><span>At the day&apos;s gold rate</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" /></svg><p style={{ margin: 0 }}><b>Order on WhatsApp</b><span>Or cash on delivery</span></p></div>
        </div>
      </div></section>

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Moments</small>Shop by occasion</h2></div>
        <div className="occ">{OCCASIONS.map((o) => { const a = OCC_ART[o]; return <Link key={o} href={`/shop?occ=${encodeURIComponent(o)}`}><span className="c"><JewelArt type={a[0]} metal={a[1]} stone={a[2]} v={a[3]} /></span>{o}</Link>; })}</div>
      </div></section>

      <section className="row"><div className="wrap"><div className="sh"><h2><small>{products.length.toLocaleString("en-US")} designs</small>Shop by category</h2><Link href="/shop">View all →</Link></div>
        <div className="catgrid">{categories.map((c) => { const a = CAT_ART[c.slug] ?? ["yg22", "none", 0]; return <Link key={c.slug} href={`/jewellery/${c.slug}`}><span className="im"><JewelArt type={c.slug} metal={a[0]} stone={a[1]} v={a[2]} /></span><b>{c.name}</b><span className="num">{count((p) => p.category === c.slug)} designs</span></Link>; })}</div>
      </div></section>

      <Rail eyebrow="Most loved in Qatar" title="Best sellers" href="/best-sellers" items={best} />

      <section className="row"><div className="wrap"><div className="duo">
        <Link className="ban a" href="/diamond"><span className="t"><small>Engagement</small><b>Solitaires from 0.30 ct</b><span>Platinum and 18K white gold, certified.</span></span><JewelArt type="rings" metal="pt" stone="diamond" v={0} /></Link>
        <Link className="ban b" href="/jewellery/coins"><span className="t"><small>Invest in gold</small><b>24K coins &amp; bars</b><span>999.9 fine gold from 1 g to 100 g.</span></span><JewelArt type="coins" metal="yg24" stone="none" v={1} /></Link>
      </div></div></section>

      <Rail eyebrow="For the wedding season" title="Bridal edit" href="/jewellery/sets" items={bridal} />

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Purity &amp; colour</small>Shop by metal</h2><Link href="/gold-rate">Today&apos;s rates →</Link></div>
        <div className="metals">{METALS.filter((m) => m.id !== "yg24").map((m) => <Link key={m.id} href={`/shop?metal=${m.id}`}><span className="sw" style={{ background: `linear-gradient(135deg,${m.colors[0]},${m.colors[1]} 55%,${m.colors[2]})` }} />{m.short}<span className="num">{count((p) => p.metal === m.id)} pieces</span></Link>)}</div>
      </div></section>

      <Rail eyebrow="Top picks" title="Diamond rings" href="/diamond" items={diamonds} />

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Curated</small>Collections</h2></div>
        <div className="cols">{collections.map((c) => { const a = COL_ART[c.slug] ?? ["pendants", "yg22", "none", 0]; return <Link key={c.slug} className="coll" href={`/collections/${c.slug}`}><span className="im"><JewelArt type={a[0]} metal={a[1]} stone={a[2]} v={a[3]} /></span><span className="t"><span><b>{c.name}</b><br /><span>{c.description}</span></span><span className="num" style={{ color: "var(--maroon)", fontWeight: 600 }}>{count((p) => p.collection === c.slug)} →</span></span></Link>; })}</div>
      </div></section>

      <Rail eyebrow="Just in" title="New arrivals" href="/new-arrivals" items={fresh} />

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Gift guide</small>Shop by recipient</h2></div>
        <div className="recip">
          <Link href="/shop?for=Women&occ=Gifting">For Her</Link><Link href="/men">For Him</Link><Link href="/shop?occ=Anniversary">For Wife</Link>
          <Link href="/shop?occ=Eid">For Mother</Link><Link href="/kids">For Daughter</Link><Link href="/bridal">For the Bride</Link>
        </div>
      </div></section>

      <section className="seo"><div className="wrap">
        <div>
          <h2>Gold, diamond and bridal jewellery in Doha</h2>
          <p>Kohinoor Jewellery brings hallmarked designs to customers across Qatar, from 21K and 22K Gulf gold to certified diamonds, pearls and Royal Kundan bridal sets. Every price on this site is calculated from the day&apos;s gold rate, the exact gram weight of the piece and a clearly shown making charge.</p>
          <h3>Delivery across Qatar</h3><p>In-stock pieces are delivered the same day within Doha, Lusail and Al Wakrah, and next day elsewhere in Qatar.</p>
          <h3>Old gold exchange</h3><p>Bring your old gold to our showroom for a free purity test. We credit its value at the day&apos;s buyback rate against any new purchase.</p>
        </div>
        <div><h2>Frequently asked questions</h2>
          <details><summary>How is the price of gold jewellery calculated?</summary><p>Price = gram weight × today&apos;s rate for that karat, plus the making charge, plus the value of any stones. The breakdown is shown on every product page.</p></details>
          <details><summary>Is your gold hallmarked?</summary><p>Yes. Every gold piece carries a purity stamp, and diamonds above 0.30 ct come with a lab certificate.</p></details>
          <details><summary>How do I order?</summary><p>Tap “Order on WhatsApp” on any product, or add pieces to your bag and check out with cash on delivery.</p></details>
          <p style={{ marginTop: 12 }}><Link href="/faq" style={{ color: "var(--maroon)", fontWeight: 600 }}>All FAQs →</Link></p>
        </div>
      </div></section>
    </main>
  );
}
