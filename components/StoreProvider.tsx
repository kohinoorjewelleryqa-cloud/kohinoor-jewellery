"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CartLine } from "@/lib/types";

type Toast = { msg: string; href?: string; label?: string } | null;
type Store = {
  cart: CartLine[];
  wish: string[];
  ready: boolean;
  addToCart: (id: string, size: string | null, qty?: number) => void;
  setQty: (id: string, size: string | null, qty: number) => void;
  removeLine: (id: string, size: string | null) => void;
  clearCart: () => void;
  toggleWish: (id: string) => void;
  toast: (msg: string, href?: string, label?: string) => void;
};

const Ctx = createContext<Store | null>(null);
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [t, setT] = useState<Toast>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setCart(read("kj_cart_v2", [])); setWish(read("kj_wish_v2", [])); setReady(true); }, []);
  useEffect(() => { if (ready) write("kj_cart_v2", cart); }, [cart, ready]);
  useEffect(() => { if (ready) write("kj_wish_v2", wish); }, [wish, ready]);

  const toast = useCallback((msg: string, href?: string, label?: string) => {
    setT({ msg, href, label });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setT(null), 2800);
  }, []);

  const value = useMemo<Store>(() => ({
    cart, wish, ready, toast,
    addToCart: (id, size, qty = 1) => setCart((c) => { const f = c.find((l) => l.id === id && l.size === size); return f ? c.map((l) => (l === f ? { ...l, qty: l.qty + qty } : l)) : [...c, { id, size, qty }]; }),
    setQty: (id, size, qty) => setCart((c) => c.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.max(1, qty) } : l))),
    removeLine: (id, size) => setCart((c) => c.filter((l) => !(l.id === id && l.size === size))),
    clearCart: () => setCart([]),
    toggleWish: (id) => setWish((w) => {
      const has = w.includes(id);
      toast(has ? "Removed from wishlist" : "Saved to wishlist", has ? undefined : "/wishlist", "View");
      return has ? w.filter((x) => x !== id) : [...w, id];
    }),
  }), [cart, wish, ready, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {t && (
        <div className="toast" role="status">
          {t.msg}
          {t.href && <Link href={t.href}>{t.label}</Link>}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
