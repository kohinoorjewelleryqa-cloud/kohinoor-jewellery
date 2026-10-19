"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import ProductVisual from "@/components/ProductVisual";
import { useStore } from "@/components/StoreProvider";
import { useProducts } from "@/lib/useProducts";
import { QATAR_AREAS } from "@/lib/constants";
import { qar } from "@/lib/pricing";
import { placeOrder, type CheckoutResult } from "./actions";

const PAYMENTS = ["Cash on delivery", "Card on delivery", "Pay at showroom pickup"];
const SLOTS = ["Today, 6–9 pm (in-stock, Doha)", "Tomorrow, 10 am–1 pm", "Tomorrow, 4–8 pm", "Showroom pickup"];

export default function CheckoutPage() {
  const { cart, ready, clearCart } = useStore();
  const products = useProducts([...new Set(cart.map((l) => l.id))], ready);
  const lines = cart.map((l) => ({ ...l, p: products?.find((p) => p.id === l.id) })).filter((l) => l.p);
  const total = lines.reduce((a, l) => a + l.p!.price * l.qty, 0);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Extract<CheckoutResult, { ok: true }> | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) || "");
    setErr("");
    start(async () => {
      const r = await placeOrder({ lines: cart, name: v("name"), phone: v("phone"), email: v("email"), area: v("area"), zone: v("zone"), street: v("street"), building: v("building"), slot: v("slot"), payment: v("payment"), notes: v("notes") });
      if (!r.ok) { setErr(r.error); return; }
      clearCart(); setDone(r); window.scrollTo(0, 0);
    });
  };

  return (
    <main className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/cart">Bag</Link><span>/</span><span>Checkout</span></nav>
      <div className="pagehead"><h1>Checkout</h1></div>
      {done ? (
        <div className="panel confirm">
          <b className="big">Thank you</b>
          <span className="num">Your order <b>{done.orderNo}</b> for {qar(done.total)} has been received. Our team will call you to confirm the delivery time.</span>
          <a className="btn wa-btn" href={done.whatsappUrl} target="_blank" rel="noopener">Send order details on WhatsApp</a>
          {done.demo && <div className="demo-flag">Demo mode: the order was not saved. Connect Supabase to store orders.</div>}
          <Link className="btn o" href="/shop">Continue shopping</Link>
        </div>
      ) : !ready || products === null ? <p className="intro-seo">Loading…</p> : !lines.length ? (
        <div className="panel confirm"><b className="big">Nothing to check out yet</b><Link className="btn p" href="/shop">Browse jewellery</Link></div>
      ) : (
        <>
          <div className="steps"><span>Bag</span>›<b>Delivery &amp; payment</b>›<span>Confirmation</span></div>
          <div className="two">
            <form className="panel" id="coForm" onSubmit={submit} noValidate>
              <h2>Delivery details</h2>
              <div className="form-grid">
                <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" /></div>
                <div className="field"><label htmlFor="phone">Mobile (+974)</label><input id="phone" name="phone" required inputMode="tel" placeholder="5X XXX XXX" autoComplete="tel" /></div>
                <div className="field full"><label htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" autoComplete="email" /></div>
                <div className="field"><label htmlFor="area">Area</label><select id="area" name="area">{QATAR_AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
                <div className="field"><label htmlFor="zone">Zone</label><input id="zone" name="zone" inputMode="numeric" required placeholder="66" /></div>
                <div className="field"><label htmlFor="street">Street</label><input id="street" name="street" inputMode="numeric" required placeholder="340" /></div>
                <div className="field"><label htmlFor="building">Building</label><input id="building" name="building" inputMode="numeric" required placeholder="12" /></div>
                <div className="field full"><label htmlFor="slot">Delivery time</label><select id="slot" name="slot">{SLOTS.map((s) => <option key={s}>{s}</option>)}</select></div>
                <div className="field full"><label htmlFor="notes">Notes or gift message (optional)</label><input id="notes" name="notes" placeholder="Eid Mubarak, with love" /></div>
              </div>
              <h2 style={{ marginTop: 22 }}>Payment</h2>
              <div className="radios">{PAYMENTS.map((x, i) => <label key={x}><input type="radio" name="payment" value={x} defaultChecked={i === 0} />{x}</label>)}</div>
              {err && <p role="alert" style={{ color: "var(--warn)", fontSize: 14 }}>{err}</p>}
            </form>
            <aside className="panel summary"><h2>Your order</h2>
              {lines.map(({ p, size, qty }) => (
                <div className="citem" key={`${p!.id}-${size}`} style={{ gridTemplateColumns: "56px 1fr auto" }}>
                  <div className="th" style={{ width: 56, height: 56 }}><ProductVisual p={p!} /></div>
                  <div style={{ minWidth: 0 }}><b>{p!.name}</b><small className="num">Qty {qty}{size ? ` · Size ${size}` : ""}</small></div>
                  <b className="num" style={{ fontSize: 13.5 }}>{qar(p!.price * qty)}</b>
                </div>
              ))}
              <div className="sum num"><span>Subtotal</span><span>{qar(total)}</span></div>
              <div className="sum"><span>Delivery</span><span style={{ color: "var(--ok)" }}>Free</span></div>
              <div className="sum t num"><span>Total</span><span>{qar(total)}</span></div>
              <button className="btn p block" type="submit" form="coForm" disabled={pending}>{pending ? "Placing order…" : "Place order"}</button>
              <Link className="btn o block" href="/cart">Back to bag</Link>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
