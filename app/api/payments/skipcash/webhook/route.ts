import { NextResponse, type NextRequest } from "next/server";
import { skipcashEnabled, syncPayment, validWebhookSignature } from "@/lib/skipcash";

export const dynamic = "force-dynamic";

// SkipCash calls this when a payment changes (set as "Webhook URL" in the SkipCash portal).
// It still works if the customer closes the browser before returning to the shop.
export async function POST(req: NextRequest) {
  if (!skipcashEnabled) return NextResponse.json({ ok: false }, { status: 404 });
  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const paymentId = String(payload?.PaymentId ?? payload?.paymentId ?? "");
  if (!payload || !paymentId) return NextResponse.json({ ok: false }, { status: 400 });

  if (!validWebhookSignature(payload, req.headers.get("authorization"))) {
    // Not fatal: the status is always confirmed with SkipCash itself below, so a forged call can't mark anything paid.
    console.warn("SkipCash webhook signature did not match; verifying with SkipCash directly", paymentId);
  }
  try {
    const { outcome, orderNo } = await syncPayment(paymentId);
    return NextResponse.json({ ok: true, orderNo, outcome });
  } catch (e) {
    console.error("SkipCash webhook failed", e);
    return NextResponse.json({ ok: false }, { status: 500 }); // SkipCash will retry
  }
}
