import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
export const metadata: Metadata = { title: "Delivery & Returns", description: "Delivery times, exchange and return policy." };
export default function Page() {
  return (
    <SimplePage title="Delivery & returns" crumb="Delivery & returns"><div className="prose">
      <h2>Delivery in Qatar</h2><p>Free, insured delivery on every order. In-stock pieces ordered before 4 pm reach Doha, Lusail and Al Wakrah the same evening; other areas next day. Every delivery needs a signature and a valid QID or passport.</p>
      <h2>Made-to-order pieces</h2><p>Bridal and custom pieces take 7–14 days. We will call you before dispatch.</p>
      <h2>Exchange</h2><p>Lifetime exchange on Kohinoor gold at the prevailing gold rate.</p>
      <h2>Returns</h2><p>Unworn pieces with tags and certificate can be returned within 7 days, except customised, engraved and resized items, and gold coins and bars.</p>
    </div></SimplePage>
  );
}
