"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/StoreProvider";
import { checkPayment, retryPayment, switchToCashOnDelivery } from "../actions";
import { PAY_KEY } from "../CheckoutClient";

const saved = (): { order?: string; phone?: string } => {
  try { return JSON.parse(sessionStorage.getItem(PAY_KEY) || "{}"); } catch { return {}; }
};

export default function ResultActions({ mode, order }: { mode: "paid" | "pending" | "failed"; order: string }) {
  const { clearCart, ready } = useStore();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, start] = useTransition();
  const cleared = useRef(false);
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(() => { const s = saved(); setPhone(s.order === order ? s.phone ?? "" : ""); }, [order]);

  // Paid (or switched to pay on delivery): empty the bag and forget the saved payment details.
  useEffect(() => {
    if (mode !== "paid" || !ready || cleared.current) return;
    cleared.current = true;
    clearCart();
    try { sessionStorage.removeItem(PAY_KEY); } catch { /* ignore */ }
  }, [mode, ready, clearCart]);

  // Still waiting for the bank: check again every few seconds, for up to a minute.
  useEffect(() => {
    if (mode !== "pending") return;
    let n = 0;
    const t = setInterval(async () => {
      if (++n > 12) { clearInterval(t); return; }
      if (await checkPayment(order)) { clearInterval(t); router.refresh(); }
    }, 5000);
    return () => clearInterval(t);
  }, [mode, order, router]);

  if (mode !== "failed" || phone === null) return null;

  const retry = () => start(async () => {
    setErr("");
    const r = await retryPayment(order, phone);
    if (r.ok) window.location.href = r.payUrl; else setErr(r.error);
  });
  const cod = () => start(async () => {
    setErr("");
    const r = await switchToCashOnDelivery(order, phone);
    if (r.ok) router.replace(`/checkout/result?order=${encodeURIComponent(order)}`);
    else setErr("We couldn't update the order. Please message us on WhatsApp.");
  });

  if (!phone) return <p className="pay-note">To try again, please message us on WhatsApp with your order number.</p>;
  return (
    <>
      <button className="btn p" type="button" onClick={retry} disabled={busy}>{busy ? "Please wait…" : "Try the payment again"}</button>
      <button className="btn o" type="button" onClick={cod} disabled={busy}>Pay on delivery instead</button>
      {err && <p role="alert" style={{ color: "var(--warn)", fontSize: 14, margin: 0 }}>{err}</p>}
    </>
  );
}
