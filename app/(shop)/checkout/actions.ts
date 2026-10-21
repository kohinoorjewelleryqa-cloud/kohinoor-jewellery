"use server";
import { getCatalog } from "@/lib/catalog";
import { serviceClient, supabaseConfigured } from "@/lib/supabase-server";
import { qar } from "@/lib/pricing";
import type { CartLine, OrderItem } from "@/lib/types";
import { createSkipcashPayment, onlinePaymentsOn, skipcashEnabled, syncPayment } from "@/lib/skipcash";
import { PAY_ONLINE } from "@/lib/constants";

export type CheckoutInput = {
  lines: CartLine[];
  name: string; phone: string; email: string;
  area: string; zone: string; street: string; building: string;
  slot: string; payment: string; notes: string;
};
export type CheckoutResult = { ok: true; orderNo: string; total: number; whatsappUrl: string; demo: boolean; payUrl?: string } | { ok: false; error: string };

const clean = (s: unknown, max = 200) => String(s ?? "").trim().slice(0, max);

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = clean(input.name, 80), phone = clean(input.phone, 20).replace(/[^\d+]/g, "");
  const zone = clean(input.zone, 10), street = clean(input.street, 10), building = clean(input.building, 10);
  if (!name || !zone || !street || !building) return { ok: false, error: "Please fill in your name and full address (zone, street and building)." };
  if (phone.replace(/\D/g, "").length < 8) return { ok: false, error: "Please enter a valid mobile number (8 digits for Qatar)." };
  if (!Array.isArray(input.lines) || !input.lines.length) return { ok: false, error: "Your bag is empty." };
  const online = clean(input.payment, 40) === PAY_ONLINE;
  if (!online && !["Cash on delivery", "Card on delivery"].includes(clean(input.payment, 40))) input.payment = "Cash on delivery";
  const email = clean(input.email, 120);
  if (online && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter your email address. It is needed for your online payment receipt." };

  // Re-price every line on the server from today's rates — never trust prices from the browser.
  const cat = await getCatalog();
  if (online && !onlinePaymentsOn(cat.settings)) return { ok: false, error: "Online payment isn't available right now. Please choose cash or card on delivery." };
  const map = new Map(cat.products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  for (const l of input.lines.slice(0, 50)) {
    const p = map.get(l.id);
    if (!p) continue;
    const qty = Math.min(Math.max(1, Math.floor(Number(l.qty) || 1)), 20);
    items.push({ id: p.id, sku: p.sku, name: p.name, metal: p.metal, weight_g: p.weight_g, size: l.size ? clean(l.size, 12) : null, qty, unit_price: p.price, rate: p.isFixed ? 0 : p.rate });
  }
  if (!items.length) return { ok: false, error: "The pieces in your bag are no longer available." };
  const total = items.reduce((a, i) => a + i.unit_price * i.qty, 0);

  const d = new Date();
  const orderNo = `KJ-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const address = `${clean(input.area, 40)}, Zone ${zone}, Street ${street}, Building ${building}`;
  const summary = [`New order ${orderNo}`, `${name} · ${phone}`, address, ...items.map((i) => `• ${i.name} (${i.sku})${i.size ? ` size ${i.size}` : ""} × ${i.qty} — ${qar(i.unit_price * i.qty)}`), `Total: ${qar(total)}`, `Payment: ${clean(input.payment, 40)}`, `Slot: ${clean(input.slot, 60)}`].join("\n");
  const whatsappUrl = `https://wa.me/${cat.settings.whatsapp}?text=${encodeURIComponent(summary)}`;

  if (!supabaseConfigured) return { ok: true, orderNo, total, whatsappUrl, demo: true };

  const { error } = await serviceClient().from("orders").insert({
    order_no: orderNo, customer_name: name, phone, email: clean(input.email, 120) || null,
    area: clean(input.area, 40), zone, street, building, delivery_slot: clean(input.slot, 60), payment_method: clean(input.payment, 40),
    notes: clean(input.notes, 500) || null, items, total, status: "new",
    ...(online ? { payment_status: "pending" } : {}),
  });
  if (error) { console.error("order insert failed", error); return { ok: false, error: "We couldn't place your order just now. Please try again or order on WhatsApp." }; }

  // Online payment: send the customer to SkipCash's secure payment page.
  let payUrl: string | undefined;
  if (online) {
    try {
      const pay = await createSkipcashPayment({ orderNo, amount: total, name, phone, email });
      payUrl = pay.payUrl;
      await serviceClient().from("orders").update({ payment_ref: pay.id }).eq("order_no", orderNo);
    } catch {
      await serviceClient().from("orders").update({ payment_status: "failed" }).eq("order_no", orderNo);
      return { ok: false, error: "We couldn't open the online payment page. Please try again, or choose cash or card on delivery." };
    }
  }

  // Optional email alert to the store (set RESEND_API_KEY and ORDER_NOTIFY_EMAIL).
  if (process.env.RESEND_API_KEY && process.env.ORDER_NOTIFY_EMAIL) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Kohinoor Orders <onboarding@resend.dev>", to: [process.env.ORDER_NOTIFY_EMAIL], subject: `New order ${orderNo} · ${qar(total)}${online ? " · awaiting online payment" : ""}`, text: summary }),
    }).catch((e) => console.error("order email failed", e));
  }
  return { ok: true, orderNo, total, whatsappUrl, demo: false, payUrl };
}

const ORDER_NO = /^KJ-\d{6}-\d{4}$/;
type Pending = { order_no: string; customer_name: string; phone: string; email: string | null; total: number; payment_status: string; created_at: string };

async function pendingOrder(orderNo: string, phone: string): Promise<Pending | null> {
  if (!supabaseConfigured || !ORDER_NO.test(orderNo)) return null;
  const { data } = await serviceClient().from("orders").select("order_no,customer_name,phone,email,total,payment_status,created_at").eq("order_no", orderNo).maybeSingle();
  const o = data as Pending | null;
  // Only the customer who placed it (same mobile number) can change an unpaid online order, within 2 days.
  if (!o || o.phone.replace(/\D/g, "").slice(-8) !== phone.replace(/\D/g, "").slice(-8)) return null;
  if (!["pending", "failed"].includes(o.payment_status) || Date.now() - new Date(o.created_at).getTime() > 2 * 864e5) return null;
  return o;
}

/** Try the online payment again for an order whose card payment failed or was cancelled. */
export async function retryPayment(orderNo: string, phone: string): Promise<{ ok: true; payUrl: string } | { ok: false; error: string }> {
  const o = await pendingOrder(orderNo, phone);
  if (!o || !o.email || !onlinePaymentsOn((await getCatalog()).settings)) return { ok: false, error: "This order can't be paid online any more. Please contact us on WhatsApp." };
  try {
    const pay = await createSkipcashPayment({ orderNo, amount: Number(o.total), name: o.customer_name, phone: o.phone, email: o.email });
    await serviceClient().from("orders").update({ payment_status: "pending", payment_ref: pay.id }).eq("order_no", orderNo);
    return { ok: true, payUrl: pay.payUrl };
  } catch {
    return { ok: false, error: "The payment page couldn't be opened. Please try again in a moment." };
  }
}

/** Keep the order but pay on delivery instead. */
export async function switchToCashOnDelivery(orderNo: string, phone: string): Promise<{ ok: boolean }> {
  const o = await pendingOrder(orderNo, phone);
  if (!o) return { ok: false };
  const { error } = await serviceClient().from("orders").update({ payment_status: "unpaid", payment_method: "Cash on delivery" }).eq("order_no", orderNo);
  return { ok: !error };
}

/** While a payment is "awaiting confirmation", re-check it with SkipCash. Returns true once it is settled. */
export async function checkPayment(orderNo: string): Promise<boolean> {
  if (!skipcashEnabled || !ORDER_NO.test(orderNo)) return true;
  const { data } = await serviceClient().from("orders").select("payment_status,payment_ref").eq("order_no", orderNo).maybeSingle();
  if (!data || data.payment_status !== "pending") return true;
  if (!data.payment_ref) return false;
  const { outcome } = await syncPayment(String(data.payment_ref));
  return outcome !== "pending";
}
