import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { serviceClient, supabaseConfigured } from "./supabase-server";

// SkipCash online payments (Qatar Central Bank licensed gateway).
// Turned on by adding these environment variables in Vercel (from the SkipCash merchant portal):
//   SKIPCASH_CLIENT_ID, SKIPCASH_KEY_ID, SKIPCASH_KEY_SECRET, SKIPCASH_WEBHOOK_KEY
//   SKIPCASH_LIVE=yes   ← only once SkipCash gives you LIVE keys; leave it out while testing.
// In the SkipCash portal set:
//   Return URL  → https://<your-site>/api/payments/skipcash/return
//   Webhook URL → https://<your-site>/api/payments/skipcash/webhook

const env = (k: string) => (process.env[k] ?? "").trim();
const CLIENT_ID = env("SKIPCASH_CLIENT_ID");
const KEY_ID = env("SKIPCASH_KEY_ID");
const KEY_SECRET = env("SKIPCASH_KEY_SECRET");
const WEBHOOK_KEY = env("SKIPCASH_WEBHOOK_KEY");
const BASE = /^(yes|true|1|live)$/i.test(env("SKIPCASH_LIVE")) ? "https://api.skipcash.app" : "https://skipcashtest.azurewebsites.net";

export const skipcashEnabled = Boolean(CLIENT_ID && KEY_ID && KEY_SECRET && supabaseConfigured);
export const skipcashLive = BASE === "https://api.skipcash.app";
/** Online payment is offered only when the keys are set AND the admin switch is on. */
export const onlinePaymentsOn = (settings: { online_payments?: boolean }) => skipcashEnabled && settings.online_payments !== false;
export const ONLINE_METHOD = "Paid online (SkipCash)";

// SkipCash payment status ids.
const PAID = 2;
const FAILED = new Set([3, 4, 5]); // cancelled, failed, rejected
const REFUNDED = new Set([6]);

const sign = (message: string, secret: string) => createHmac("sha256", secret).update(message, "utf8").digest("base64");

// The request signature covers these fields, in this exact order (empty ones are skipped),
// followed by the first optional field (we send Custom1 = order number).
const REQUEST_FIELDS = ["Uid", "KeyId", "Amount", "FirstName", "LastName", "Phone", "Email", "Street", "City", "State", "Country", "PostalCode", "TransactionId"] as const;

export type NewPayment = { orderNo: string; amount: number; name: string; phone: string; email: string };

/** Creates a SkipCash payment and returns the secure page the customer is sent to. */
export async function createSkipcashPayment(p: NewPayment): Promise<{ id: string; payUrl: string }> {
  const [first, ...rest] = p.name.trim().split(/\s+/);
  const body: Record<string, string> = {
    Uid: randomUUID(),
    KeyId: KEY_ID,
    Amount: p.amount.toFixed(2),
    FirstName: first.slice(0, 60),
    LastName: (rest.join(" ") || first).slice(0, 60),
    Phone: p.phone.startsWith("+") ? p.phone : `+974${p.phone.replace(/\D/g, "").slice(-8)}`,
    Email: p.email,
    // A fresh transaction id per attempt, so a customer can retry after a failed card.
    TransactionId: `${p.orderNo}-${randomUUID().slice(0, 4).toUpperCase()}`,
    Custom1: p.orderNo,
  };
  const parts = REQUEST_FIELDS.filter((k) => body[k]).map((k) => `${k}=${body[k]}`);
  parts.push(`Custom1=${body.Custom1}`);
  const res = await fetch(`${BASE}/api/v1/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: sign(parts.join(","), KEY_SECRET) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  const r = json?.resultObj;
  if (!res.ok || !r?.payUrl || !r?.id) {
    console.error("SkipCash create payment failed", res.status, JSON.stringify(json)?.slice(0, 500));
    throw new Error("skipcash_create_failed");
  }
  return { id: String(r.id), payUrl: String(r.payUrl) };
}

type SkipcashPayment = { id: string; statusId: number; amount: number; orderNo: string };

/** Asks SkipCash directly for the payment's real status. This is the source of truth. */
export async function getSkipcashPayment(id: string): Promise<SkipcashPayment | null> {
  if (!/^[\w-]{6,64}$/.test(id)) return null;
  const res = await fetch(`${BASE}/api/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json", Authorization: CLIENT_ID },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  const r = json?.resultObj;
  if (!res.ok || !r) {
    console.error("SkipCash get payment failed", res.status, JSON.stringify(json)?.slice(0, 300));
    return null;
  }
  return { id: String(r.id ?? id), statusId: Number(r.statusId), amount: Number(r.amount), orderNo: orderNoFrom(r.custom1 ?? r.Custom1, r.transactionId) };
}

const orderNoFrom = (custom1: unknown, transactionId: unknown) => {
  const m = String(custom1 || transactionId || "").match(/KJ-\d{6}-\d{4}/);
  return m ? m[0] : "";
};

/** Checks the signature SkipCash puts on webhook calls. */
export function validWebhookSignature(payload: Record<string, unknown>, signature: string | null): boolean {
  if (!WEBHOOK_KEY || !signature) return false;
  const message = ["PaymentId", "Amount", "StatusId", "TransactionId", "Custom1", "VisaId"]
    .filter((k) => payload[k] !== undefined && payload[k] !== null && payload[k] !== "")
    .map((k) => `${k}=${payload[k]}`)
    .join(",");
  const a = Buffer.from(sign(message, WEBHOOK_KEY));
  const b = Buffer.from(signature.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

export type PaymentOutcome = "paid" | "failed" | "pending" | "refunded" | "review" | "unknown";

/** Verifies a payment with SkipCash and records the result on the order. Safe to call more than once. */
export async function syncPayment(paymentId: string): Promise<{ outcome: PaymentOutcome; orderNo: string }> {
  const pay = await getSkipcashPayment(paymentId);
  if (!pay || !pay.orderNo) return { outcome: "unknown", orderNo: pay?.orderNo ?? "" };

  const db = serviceClient();
  const { data: order } = await db.from("orders").select("id,total,payment_status").eq("order_no", pay.orderNo).maybeSingle();
  if (!order) return { outcome: "unknown", orderNo: pay.orderNo };

  let outcome: PaymentOutcome = "pending";
  if (pay.statusId === PAID) outcome = Math.abs(Number(order.total) - pay.amount) < 0.01 ? "paid" : "review";
  else if (FAILED.has(pay.statusId)) outcome = "failed";
  else if (REFUNDED.has(pay.statusId)) outcome = "refunded";

  // Never downgrade a paid order because of an older failed attempt.
  if (order.payment_status === "paid" && outcome === "failed") return { outcome: "paid", orderNo: pay.orderNo };

  const update: Record<string, unknown> = { payment_status: outcome, payment_ref: pay.id };
  if (outcome === "paid" || outcome === "review") {
    update.paid_amount = pay.amount;
    update.paid_at = new Date().toISOString();
    update.payment_method = ONLINE_METHOD;
  }
  if (order.payment_status !== outcome) {
    const { error } = await db.from("orders").update(update).eq("id", order.id);
    if (error) console.error("payment status update failed", error);
  }
  return { outcome, orderNo: pay.orderNo };
}
