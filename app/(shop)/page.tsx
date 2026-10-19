import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import JewelArt from "@/components/JewelArt";
import { PHOTOS, img } from "@/lib/stock";
import ProductCard from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { METALS, OCCASIONS } from "@/lib/constants";
import type { PricedProduct } from "@/lib/types";

export const revalidate = 600;

const OCC_PHOTO: Record<string, string> = {
  Everyday: PHOTOS.earrings[0], Office: PHOTOS.necklaces[3], Party: PHOTOS.lifestyle[2], Eid: PHOTOS.oxidised,
  Birthday: PHOTOS.necklaces[0], Anniversary: PHOTOS.rings[1], "National Day": PHOTOS.sets[0], Gifting: PHOTOS.pearl[0],
};
const CAT_PHOTO: Record<string, string> = {
  rings: PHOTOS.rings[2], earrings: PHOTOS.oxidised, necklaces: PHOTOS.necklaces[0], bracelets: PHOTOS.bracelets[0], anklets: PHOTOS.display, sets: PHOTOS.sets[0],
};
const COL_PHOTO: Record<string, string> = {
  "everyday-sterling": PHOTOS.lifestyle[0], "oxidised-heritage": PHOTOS.oxidised, "golden-touch": "1599643478518-a784e5dc4c8f",
  "doha-pearl": PHOTOS.pearl[0], "men-in-silver": PHOTOS.necklaces[3],
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
  // Show pieces with photos first so the homepage rows look their best.
  const pick = (fn: (p: PricedProduct) => boolean, n = 15) => products.filter(fn).sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0)).slice(0, n);
  const best = pick((p) => p.is_bestseller);
  const oxidised = pick((p) => p.metal === "ag925ox");
  const under100 = pick((p) => p.price <= 100);
  const fresh = pick((p) => p.is_new);

  return (
    <main>
      <section className="hero"><div className="wrap">
        <HeroSlider>
          <div className="slide photo"><img src={img(PHOTOS.lifestyle[0], 1800)} alt="Woman wearing a sterling silver necklace" fetchPriority="high" /><div className="copy"><span className="eyebrow">925 Sterling Silver</span><h1>Silver that shines <i>every day</i></h1><p>Rings, earrings, necklaces and anklets in hallmarked sterling silver, delivered across Qatar.</p><Link className="btn g" href="/shop">Shop all silver</Link></div></div>
          <div className="slide photo"><img src={img(PHOTOS.oxidised, 1800)} alt="Oxidised silver earrings" loading="lazy" /><div className="copy"><span className="eyebrow">Oxidised Heritage</span><h2>Antique silver, <i>made for Eid</i></h2><p>Oxidised jhumkas, chokers and payals with turquoise and ruby accents.</p><Link className="btn g" href="/collections/oxidised-heritage">Shop the collection</Link></div></div>
          <div className="slide photo"><img src={img(PHOTOS.sets[0], 1800)} alt="Silver necklace and earring set" loading="lazy" /><div className="copy"><span className="eyebrow">Ready to gift</span><h2>Sets made for <i>celebrations</i></h2><p>Matching necklace and earring sets, gift-boxed and delivered the same day in Doha.</p><Link className="btn g" href="/jewellery/sets">Shop jewellery sets</Link></div></div>
        </HeroSlider>
        <div className="trust">
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z" /><path d="m9 12 2 2 4-4" /></svg><p style={{ margin: 0 }}><b>925 hallmarked</b><span>Stamped on every piece</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M12 21 8 9l4-6 4 6z" /></svg><p style={{ margin: 0 }}><b>Nickel-free silver</b><span>Gentle on sensitive skin</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg><p style={{ margin: 0 }}><b>Same-day in Doha</b><span>Insured, signed delivery</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></svg><p style={{ margin: 0 }}><b>Free polishing</b><span>Bring it back any time</span></p></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" /></svg><p style={{ margin: 0 }}><b>Order on WhatsApp</b><span>Or cash on delivery</span></p></div>
        </div>
      </div></section>

      <section className="row"><div className="wrap"><div className="sh"><h2><small>{products.length.toLocaleString("en-US")} designs</small>Shop by category</h2><Link href="/shop">View all →</Link></div>
        <div className="catgrid photo">{categories.map((c) => (
          <Link key={c.slug} href={`/jewellery/${c.slug}`}>
            <span className="im">{CAT_PHOTO[c.slug] ? <img src={img(CAT_PHOTO[c.slug], 700)} alt={c.name} loading="lazy" /> : <JewelArt type={c.slug} metal="ag925" stone="cz" v={1} />}</span>
            <b>{c.name}</b><span className="num">{count((p) => p.category === c.slug)} designs</span>
          </Link>
        ))}</div>
      </div></section>

      <Rail eyebrow="Most loved in Qatar" title="Best sellers" href="/best-sellers" items={best} />

      <section className="row"><div className="wrap"><div className="duo">
        <Link className="ban photo" href="/collections/golden-touch"><img src={img("1599643478518-a784e5dc4c8f", 1200)} alt="Gold-plated silver necklaces" loading="lazy" /><span className="t"><small>Golden Touch</small><b>Gold-plated sterling silver</b><span>The look of gold, at silver prices.</span><em>Shop now →</em></span></Link>
        <Link className="ban photo" href="/collections/doha-pearl"><img src={img(PHOTOS.pearl[0], 1200)} alt="Pearl necklace in a gift box" loading="lazy" /><span className="t"><small>Doha Pearl</small><b>Pearls set in silver</b><span>A nod to Qatar&apos;s pearling heritage.</span><em>Shop now →</em></span></Link>
      </div></div></section>

      <Rail eyebrow="Antique finish" title="Oxidised favourites" href="/collections/oxidised-heritage" items={oxidised} />

      <section className="story"><div className="wrap">
        <div className="story-im"><img src={img(PHOTOS.display, 1400)} alt="Sterling silver jewellery on display" loading="lazy" /></div>
        <div className="story-t">
          <small>The Kohinoor promise</small>
          <h2>Pure 925 silver, finished by hand</h2>
          <p>Every piece is made in hallmarked sterling silver, polished and checked by hand before it reaches you. Prices follow the day&apos;s silver rate, and the making charge is always shown.</p>
          <div className="story-stats num"><div><b>925</b><span>Hallmark on every piece</span></div><div><b>{products.length.toLocaleString("en-US")}</b><span>Designs online</span></div><div><b>Same day</b><span>Delivery in Doha</span></div></div>
          <Link className="btn p" href="/about">Our story</Link>
        </div>
      </div></section>

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Moments</small>Shop by occasion</h2></div>
        <div className="occ">{OCCASIONS.map((o) => <Link key={o} href={`/shop?occ=${encodeURIComponent(o)}`}><span className="c">{OCC_PHOTO[o] ? <img src={img(OCC_PHOTO[o], 300)} alt="" loading="lazy" /> : null}</span>{o}</Link>)}</div>
      </div></section>

      <Rail eyebrow="Easy gifting" title="Under QAR 100" href="/shop?max=100" items={under100} />

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Curated</small>Collections</h2></div>
        <div className="cols photo">{collections.map((c) => (
          <Link key={c.slug} className="coll" href={`/collections/${c.slug}`}>
            <span className="im">{COL_PHOTO[c.slug] ? <img src={img(COL_PHOTO[c.slug], 900)} alt={c.name} loading="lazy" /> : <JewelArt type="pendants" metal="ag925" stone="cz" v={0} />}</span>
            <span className="t"><span><b>{c.name}</b><br /><span>{c.description}</span></span><span className="num" style={{ color: "var(--maroon)", fontWeight: 600 }}>{count((p) => p.collection === c.slug)} →</span></span>
          </Link>
        ))}</div>
      </div></section>

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Finish &amp; colour</small>Shop by finish</h2><Link href="/silver-rate">Today&apos;s silver rate →</Link></div>
        <div className="metals five">{METALS.map((m) => <Link key={m.id} href={`/shop?metal=${m.id}`}><span className="sw" style={{ background: `linear-gradient(135deg,${m.colors[0]},${m.colors[1]} 55%,${m.colors[2]})` }} />{m.short}<span className="num">{count((p) => p.metal === m.id)} pieces</span></Link>)}</div>
      </div></section>

      <Rail eyebrow="Just in" title="New arrivals" href="/new-arrivals" items={fresh} />

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Styled in silver</small>Wear it your way</h2><Link href="/shop">Shop the looks →</Link></div>
        <div className="looks">{PHOTOS.lifestyle.map((id, i) => <Link key={id} href={["/jewellery/necklaces", "/jewellery/earrings", "/jewellery/sets", "/jewellery/earrings", "/jewellery/necklaces"][i]}><img src={img(id, 600)} alt="Customer wearing Kohinoor silver" loading="lazy" /></Link>)}</div>
      </div></section>

      <section className="row"><div className="wrap"><div className="sh"><h2><small>Gift guide</small>Shop by recipient</h2></div>
        <div className="recip">
          <Link href="/shop?for=Women&occ=Gifting">For Her</Link><Link href="/men">For Him</Link><Link href="/shop?occ=Anniversary">For Wife</Link>
          <Link href="/shop?occ=Eid">For Mother</Link><Link href="/kids">For Daughter</Link><Link href="/shop?occ=Gifting">For Friends</Link>
        </div>
      </div></section>

      <section className="seo"><div className="wrap">
        <div>
          <h2>925 sterling silver jewellery in Doha</h2>
          <p>Kohinoor Jewellery brings hallmarked 925 sterling silver to customers across Qatar: everyday studs and stackable rings, oxidised jhumkas and payals, gold-plated pieces and pearl designs. Prices follow the day&apos;s silver rate and the exact gram weight of each piece, with the making charge shown clearly.</p>
          <h3>Delivery across Qatar</h3><p>In-stock pieces are delivered the same day within Doha, Lusail and Al Wakrah, and next day elsewhere in Qatar.</p>
          <h3>Silver care</h3><p>Silver darkens slowly with air and perfume. Keep pieces in their pouch and bring them to our showroom for free cleaning and polishing at any time.</p>
        </div>
        <div><h2>Frequently asked questions</h2>
          <details><summary>How is the price of silver jewellery calculated?</summary><p>Most pieces are priced as gram weight × today&apos;s silver rate, plus the making charge and any stones. The breakdown is shown on the product page.</p></details>
          <details><summary>Is it real 925 silver?</summary><p>Yes. Every sterling piece is stamped 925, meaning 92.5% pure silver.</p></details>
          <details><summary>How do I order?</summary><p>Tap “Order on WhatsApp” on any product, or add pieces to your bag and check out with cash on delivery.</p></details>
          <p style={{ marginTop: 12 }}><Link href="/faq" style={{ color: "var(--maroon)", fontWeight: 600 }}>All FAQs →</Link></p>
        </div>
      </div></section>
    </main>
  );
}
