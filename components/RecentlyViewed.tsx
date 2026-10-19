"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/lib/useProducts";

export default function RecentlyViewed({ current }: { current: string }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    let list: string[] = [];
    try { list = JSON.parse(localStorage.getItem("kj_recent") || "[]"); } catch { /* ignore */ }
    setIds(list.filter((x) => x !== current).slice(0, 10));
    try { localStorage.setItem("kj_recent", JSON.stringify([current, ...list.filter((x) => x !== current)].slice(0, 12))); } catch { /* ignore */ }
  }, [current]);
  const items = useProducts(ids, ids.length > 0);
  if (!items?.length) return null;
  return <section className="row"><div className="sh"><h2>Recently viewed</h2></div><div className="rail">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>;
}
