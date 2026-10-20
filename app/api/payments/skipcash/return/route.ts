import { NextResponse, type NextRequest } from "next/server";
import { skipcashEnabled, syncPayment } from "@/lib/skipcash";

export const dynamic = "force-dynamic";

// SkipCash sends the customer back here after paying (set as "Return URL" in the SkipCash portal).
// We never trust the URL itself: the payment is checked directly with SkipCash.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const back = (orderNo: string, s: string) => NextResponse.redirect(new URL(`/checkout/result?order=${encodeURIComponent(orderNo)}&s=${s}`, req.nextUrl.origin));
  if (!skipcashEnabled || !id) return back("", "unknown");
  try {
    const { outcome, orderNo } = await syncPayment(id);
    return back(orderNo, outcome);
  } catch (e) {
    console.error("SkipCash return failed", e);
    return back("", "unknown");
  }
}
