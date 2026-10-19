import type { Metadata } from "next";
import Link from "next/link";
import SimplePage from "@/components/SimplePage";
export const metadata: Metadata = { title: "Delivery & Returns", description: "Delivery times, exchange and return policy." };
export default function Page() {
  return (
    <SimplePage title="Delivery & returns" crumb="Delivery & returns"><div className="prose">
      <h2>Delivery in Qatar</h2><p>Free, insured delivery on every order. In-stock pieces ordered before 4 pm reach Doha, Lusail and Al Wakrah the same evening; other areas next day. Every delivery needs a signature and a valid QID or passport.</p>
      <h2>Made-to-order pieces</h2><p>Custom and made-to-order pieces take 7–14 days. We will call you before dispatch.</p>
      <h2>Exchange</h2><p>Unworn pieces can be exchanged within 14 days for another design of equal or higher value.</p>
      <h2>Returns</h2><p>Unworn pieces with tags and invoice can be returned within 7 days, except customised, engraved and resized items, earrings (for hygiene) and 999 fine silver.</p>
      <p>Full details are in our <Link href="/terms">Terms &amp; conditions</Link>.</p>
    </div></SimplePage>
  );
}
