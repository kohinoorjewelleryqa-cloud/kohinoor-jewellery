"use client";
import { useEffect, useState } from "react";
import type { PricedProduct } from "./types";

/** Loads current prices for a list of product ids. */
export function useProducts(ids: string[], enabled = true) {
  const key = ids.join(",");
  const [data, setData] = useState<PricedProduct[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (!key) { setData([]); return; }
    let live = true;
    fetch(`/api/products?ids=${encodeURIComponent(key)}`).then((r) => r.json()).then((d) => { if (live) setData(d); }).catch(() => live && setData([]));
    return () => { live = false; };
  }, [key, enabled]);
  return data;
}
