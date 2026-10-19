"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useStore } from "./StoreProvider";
import { HeartIcon } from "./WishButton";
import { startProgress } from "./NavProgress";
import { METALS, OCCASIONS } from "@/lib/constants";
import { slugify } from "@/lib/pricing";
import type { Category } from "@/lib/types";

export const NAV = [
  { key: "all", label: "All Jewellery", href: "/shop", mega: true },
  { key: "rings", label: "Rings", href: "/jewellery/rings" },
  { key: "earrings", label: "Earrings", href: "/jewellery/earrings" },
  { key: "necklaces", label: "Necklaces & Pendants", href: "/jewellery/necklaces" },
  { key: "bracelets", label: "Bracelets & Bangles", href: "/jewellery/bracelets" },
  { key: "anklets", label: "Anklets", href: "/jewellery/anklets" },
  { key: "sets", label: "Sets", href: "/jewellery/sets" },
  { key: "men", label: "Men", href: "/men" },
  { key: "kids", label: "Kids", href: "/kids" },
  { key: "gifts", label: "Gifts", href: "/gifts", prem: true },
];

function SearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  useEffect(() => { setQ(sp.get("q") ?? ""); }, [sp]);
  return (
    <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); startProgress(); router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop"); }}>
      <label htmlFor="q" className="sr">Search jewellery</label>
      <input id="q" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search silver rings, oxidised jhumkas, anklets, SKU…" autoComplete="off" />
      <button type="submit" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></button>
    </form>
  );
}

export default function Header({ rates, categories }: { rates: Record<string, number>; categories: Category[] }) {
  const { cart, wish } = useStore();
  const path = usePathname();
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bag = cart.reduce((a, l) => a + l.qty, 0);
  useEffect(() => { setMenu(false); setMega(false); }, [path]);
  useEffect(() => { document.body.style.overflow = menu ? "hidden" : ""; }, [menu]);

  const toggleTheme = () => {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("kj_theme", r.dataset.theme); } catch { /* ignore */ }
  };
  const active = (href: string) => (href === "/shop" ? path === "/shop" : path.startsWith(href));
  const half = Math.ceil(categories.length * 0.66);

  return (
    <>
      <div className="util"><div className="wrap">
        <div className="rates num">
          <span className="lbl"><span className="hide-sm">Today&apos;s </span>Silver (QAR/g):</span>
          <span>925 <b>{rates.ag925?.toFixed(2)}</b></span>
          <span className="hide-sm">999 <b>{rates.ag999?.toFixed(2)}</b></span>
          <Link className="hide-sm lbl" href="/silver-rate" style={{ textDecoration: "underline" }}>Calculator</Link>
        </div>
        <div className="u-right">
          <button type="button" onClick={toggleTheme} aria-label="Toggle dark mode"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -2 }}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg></button>
          <span style={{ padding: "4px 8px" }}>QAR</span>
        </div>
      </div></div>

      <header className="site">
        <div className="wrap hdr">
          <button className="ib menu-btn" type="button" aria-label="Open menu" onClick={() => setMenu(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M3 12h18M3 18h18" /></svg></button>
          <Link className="brand" href="/" aria-label="Kohinoor Jewellery home">
            <img src="/logo.webp" alt="Kohinoor Jewellery crown monogram" width={36} height={54} />
            <span className="wm"><b>KOHINOOR</b><span>JEWELLERY</span></span>
          </Link>
          <Suspense fallback={<div className="search" />}><SearchBox /></Suspense>
          <div className="hicons">
            <Link className="ib" href="/wishlist" aria-label="Wishlist"><HeartIcon /><span className="cnt num" data-z={wish.length ? 0 : 1}>{wish.length}</span></Link>
            <Link className="ib" href="/cart" aria-label="Shopping bag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg><span className="cnt num" data-z={bag ? 0 : 1}>{bag}</span></Link>
          </div>
        </div>
        <nav className="cats" aria-label="Categories" onMouseLeave={() => { timer.current = setTimeout(() => setMega(false), 180); }}>
          <div className="wrap"><ul>
            {NAV.map((n) => (
              <li key={n.key}>
                <Link href={n.href} className={n.prem ? "prem" : undefined} aria-current={active(n.href) ? "true" : undefined}
                  onMouseEnter={() => { if (timer.current) clearTimeout(timer.current); setMega(!!n.mega); }}
                  onFocus={() => setMega(!!n.mega)}>{n.label}</Link>
              </li>
            ))}
          </ul></div>
          {mega && (
            <div className="mega" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setMega(false); }} onMouseEnter={() => timer.current && clearTimeout(timer.current)}>
              <div className="wrap">
                <div><h4>By type</h4><ul>{categories.slice(0, half).map((c) => <li key={c.slug}><Link href={`/jewellery/${c.slug}`}>{c.name}</Link></li>)}</ul></div>
                <div><h4>More</h4><ul>{categories.slice(half).map((c) => <li key={c.slug}><Link href={`/jewellery/${c.slug}`}>{c.name}</Link></li>)}<li><Link href="/new-arrivals">New arrivals</Link></li><li><Link href="/best-sellers">Best sellers</Link></li></ul></div>
                <div><h4>By finish</h4><ul>{METALS.map((m) => <li key={m.id}><Link href={`/shop?metal=${m.id}`}>{m.label}</Link></li>)}</ul></div>
                <div><h4>By occasion</h4><ul>{OCCASIONS.map((o) => <li key={o}><Link href={`/shop?occ=${encodeURIComponent(o)}`}>{o}</Link></li>)}</ul></div>
                <div className="promo"><small style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>New season</small><b>Oxidised Heritage, made for Eid</b><span style={{ opacity: 0.85, fontSize: 13.5 }}>Jhumkas, chokers and payals in antique-finish 925 silver.</span><Link className="btn g" href="/collections/oxidised-heritage" style={{ alignSelf: "flex-start", marginTop: 6 }}>Explore the collection</Link></div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {menu && (
        <div>
          <div className="scrim" onClick={() => setMenu(false)} />
          <aside className="drawer start" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="dh"><h3>Menu</h3><button className="ib" type="button" aria-label="Close" onClick={() => setMenu(false)}>✕</button></div>
            <div className="db mnav" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setMenu(false); }}>
              {NAV.map((n) => <Link key={n.key} href={n.href}>{n.label}<span>›</span></Link>)}
              {categories.filter((c) => !NAV.some((n) => n.href.endsWith(`/${c.slug}`))).map((c) => <Link key={c.slug} href={`/jewellery/${c.slug}`}>{c.name}<span>›</span></Link>)}
              <Link href="/silver-rate">Today&apos;s silver rate<span>›</span></Link>
              <Link href="/wishlist">Wishlist<span>›</span></Link>
              <Link href="/contact">Contact us<span>›</span></Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export const occHref = (o: string) => `/shop?occ=${encodeURIComponent(o)}`;
export const colHref = (slug: string) => `/collections/${slug}`;
export { slugify };
