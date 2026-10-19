import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "./ProductCard";
import { FilterSidebar, FilterButton, SortSelect, Chips } from "./Filters";
import { getCatalog } from "@/lib/catalog";
import { parseFilters, applyFilters, facetCounts, type Filters } from "@/lib/filter";

type SP = Record<string, string | string[] | undefined>;

function pageHref(base: string, sp: SP, n: number) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (k !== "page" && v) p.set(k, Array.isArray(v) ? v.join(",") : v);
  if (n > 1) p.set("page", String(n));
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function Listing({ base, sp, preset = {}, title, intro, crumbMid }: { base: string; sp: SP; preset?: Partial<Filters>; title: string; intro?: string | null; crumbMid?: [string, string] }) {
  const cat = await getCatalog();
  const f = parseFilters(sp, preset);
  const { total, pages, page, items } = applyFilters(cat.products, f);
  const facets = facetCounts(cat.products, f);
  const locked = Object.keys(preset);
  const shared = { f, facets, locked, categories: cat.categories, collections: cat.collections, total };
  const heading = f.q ? `Results for “${f.q}”` : title;
  const nums = [...new Set([1, pages, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);

  return (
    <main className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>{crumbMid && <><Link href={crumbMid[1]}>{crumbMid[0]}</Link><span>/</span></>}<span>{title}</span></nav>
      <div className="shophead">
        <div><h1>{heading}</h1><p className="num">{total.toLocaleString("en-US")} of {cat.products.length.toLocaleString("en-US")} designs</p></div>
        <div className="shopbar"><Suspense><FilterButton {...shared} /><SortSelect value={f.sort} /></Suspense></div>
      </div>
      {intro && <p className="intro-seo">{intro}</p>}
      <div className="shop">
        <Suspense><FilterSidebar {...shared} /></Suspense>
        <div style={{ minWidth: 0 }}>
          <Suspense><Chips {...shared} /></Suspense>
          <div className="grid">
            {items.length ? items.map((p) => <ProductCard key={p.id} p={p} />) : (
              <div className="empty"><b>No pieces match these filters</b>Remove a filter or widen the price range to see more designs.<br /><br /><Link className="btn o" href={base}>Clear all filters</Link></div>
            )}
          </div>
          {pages > 1 && (
            <nav className="pager" aria-label="Pages">
              {page > 1 ? <Link href={pageHref(base, sp, page - 1)} aria-label="Previous page">‹</Link> : <span className="pg-dis">‹</span>}
              {nums.map((n, i) => (
                <span key={n} style={{ display: "contents" }}>
                  {i > 0 && n - nums[i - 1] > 1 && <span className="gap">…</span>}
                  <Link href={pageHref(base, sp, n)} aria-current={n === page ? "page" : undefined} className="num">{n}</Link>
                </span>
              ))}
              {page < pages ? <Link href={pageHref(base, sp, page + 1)} aria-label="Next page">›</Link> : <span className="pg-dis">›</span>}
            </nav>
          )}
          {total > 0 && <p className="showing num">Showing {(page - 1) * 24 + 1}–{Math.min(page * 24, total)} of {total.toLocaleString("en-US")}</p>}
        </div>
      </div>
    </main>
  );
}
