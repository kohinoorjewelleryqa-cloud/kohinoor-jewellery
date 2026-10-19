"use server";
import { getCatalog } from "@/lib/catalog";
import { serviceClient, supabaseConfigured } from "@/lib/supabase-server";
import { qar } from "@/lib/pricing";
import type { CartLine, OrderItem } from "@/lib/types";

export type CheckoutInput = {
  lines: CartLine[];
  name: string; phone: string; email: string;
  area: string; zone: string; street: string; building: string;
  slot: string; payment: string; notes: string;
};
export type CheckoutResult = { ok: true; orderNo: string; total: number; whatsappUrl: string; demo: boolean } | { ok: false; error: string };

const clean = (s: unknown, max = 200) => String(s ?? "").trim().slice(0, max);

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = clean(input.name, 80), phone = clean(input.phone, 20).replace(/[^\d+]/g, "");
  const zone = clean(input.zone, 10), street = clean(input.street, 10), building = clean(input.building, 10);
  if (!name || !zone || !street || !building) return { ok: false, error: "Please fill in your name and full address (zone, street and building)." };
  if (phone.replace(/\D/g, "").length < 8) return { ok: false, error: "Please enter a valid mobile number (8 digits for Qatar)." };
  if (!Array.isArray(input.lines) || !input.lines.length) return { ok: false, error: "Your bag is empty." };

  // Re-price every line on the server from today's rates — never trust prices from the browser.
  const cat = await getCatalog();
  const map = new Map(cat.products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  for (const l of input.lines.slice(0, 50)) {
    const p = map.get(l.id);
    if (!p) continue;
    const qty = Math.min(Math.max(1, Math.floor(Number(l.qty) || 1)), 20);
    items.push({ id: p.id, sku: p.sku, name: p.name, metal: p.metal, weight_g: p.weight_g, size: l.size ? clean(l.size, 12) : null, qty, unit_price: p.price, rate: cat.settings.rates[p.metal] ?? 0 });
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
  });
  if (error) { console.error("order insert failed", error); return { ok: false, error: "We couldn't place your order just now. Please try again or order on WhatsApp." }; }

  // Optional email alert to the store (set RESEND_API_KEY and ORDER_NOTIFY_EMAIL).
  if (process.env.RESEND_API_KEY && process.env.ORDER_NOTIFY_EMAIL) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Kohinoor Orders <onboarding@resend.dev>", to: [process.env.ORDER_NOTIFY_EMAIL], subject: `New order ${orderNo} · ${qar(total)}`, text: summary }),
    }).catch((e) => console.error("order email failed", e));
  }
  return { ok: true, orderNo, total, whatsappUrl, demo: false };
}
