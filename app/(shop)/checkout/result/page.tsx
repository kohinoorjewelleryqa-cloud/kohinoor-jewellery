import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { serviceClient, supabaseConfigured } from "@/lib/supabase-server";
import ResultActions from "./ResultActions";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };
export const dynamic = "force-dynamic";

const ORDER_NO = /^KJ-\d{6}-\d{4}$/;

export default async function PaymentResult({ searchParams }: { searchParams: Promise<{ order?: string; s?: string }> }) {
  const { order = "" } = await searchParams;
  const { settings } = await getCatalog();

  // The status shown always comes from our database (updated after checking with SkipCash), never from the URL.
  let status = "unknown";
  let total: number | null = null;
  if (supabaseConfigured && ORDER_NO.test(order)) {
    const { data } = await serviceClient().from("orders").select("payment_status,total").eq("order_no", order).maybeSingle();
    if (data) { status = String(data.payment_status); total = Number(data.total); }
  }
  const amount = total !== null ? `QAR ${total.toLocaleString("en-US")}` : "";
  const wa = (text: string) => `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <main className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Payment</span></nav>
      <div className="steps" style={{ marginTop: 18 }}><span>Bag</span>›<span>Delivery &amp; payment</span>›<b>Confirmation</b></div>
      <div className="panel confirm">
        {status === "paid" || status === "review" ? (
          <>
            <span className="pay-ico ok" aria-hidden="true">✓</span>
            <b className="big">Payment received</b>
            <span className="num">Thank you. Your order <b>{order}</b> for {amount} is paid. Our team will call you to confirm the delivery time.</span>
            <ResultActions mode="paid" order={order} />
            <a className="btn wa-btn" href={wa(`Hello Kohinoor Jewellery, I have paid online for order ${order}.`)} target="_blank" rel="noopener">Message us on WhatsApp</a>
            <Link className="btn o" href="/shop">Continue shopping</Link>
          </>
        ) : status === "pending" ? (
          <>
            <span className="pay-ico" aria-hidden="true">…</span>
            <b className="big">Confirming your payment</b>
            <span className="num">We&apos;re waiting for confirmation from the bank for order <b>{order}</b>. This usually takes a few seconds.</span>
            <ResultActions mode="pending" order={order} />
          </>
        ) : status === "failed" ? (
          <>
            <span className="pay-ico bad" aria-hidden="true">!</span>
            <b className="big">Payment not completed</b>
            <span className="num">Your card was not charged. Your order <b>{order}</b> is saved. You can try the payment again or pay on delivery instead.</span>
            <ResultActions mode="failed" order={order} />
          </>
        ) : status === "unpaid" ? (
          <>
            <b className="big">Order confirmed</b>
            <span className="num">Your order <b>{order}</b> for {amount} will be paid on delivery. Our team will call you to confirm the delivery time.</span>
            <ResultActions mode="paid" order={order} />
            <Link className="btn o" href="/shop">Continue shopping</Link>
          </>
        ) : (
          <>
            <b className="big">We couldn&apos;t confirm this payment</b>
            <span>If money was taken from your account, don&apos;t worry: message us with your order number and we&apos;ll check it straight away.</span>
            <a className="btn wa-btn" href={wa(`Hello Kohinoor Jewellery, I need help with the payment for my order ${order}.`)} target="_blank" rel="noopener">Message us on WhatsApp</a>
            <Link className="btn o" href="/cart">Back to bag</Link>
          </>
        )}
      </div>
    </main>
  );
}
