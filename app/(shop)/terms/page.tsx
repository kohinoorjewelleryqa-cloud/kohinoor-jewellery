import type { Metadata } from "next";
import Link from "next/link";
import SimplePage from "@/components/SimplePage";
import { getCatalog } from "@/lib/catalog";
import { COMPANY, LEGAL_UPDATED } from "@/lib/company";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for buying 925 sterling silver jewellery from Kohinoor Jewellery W.L.L., Qatar.",
};

export default async function Page() {
  const { settings: s } = await getCatalog();
  return (
    <SimplePage title="Terms & conditions" crumb="Terms">
      <div className="prose legal">
        <p className="updated">Last updated: {LEGAL_UPDATED}</p>
        <div className="legal-box">
          <b>{COMPANY.legalName}</b>
          <span>Commercial Registration No. {COMPANY.crNumber} · {COMPANY.country}</span>
        </div>
        <p>These terms apply when you use this website or buy from {COMPANY.legalName} (&ldquo;Kohinoor Jewellery&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), {COMPANY.legalForm} under Commercial Registration No. {COMPANY.crNumber}. By placing an order on this website or through WhatsApp, you agree to these terms. Please read them together with our <Link href="/privacy">Privacy policy</Link> and <Link href="/delivery-returns">Delivery &amp; returns</Link> page.</p>

        <h2>1. Using this website</h2>
        <p>You must be at least 18 years old to place an order, or order with the consent of a parent or guardian. You agree to give true and complete details when ordering and not to misuse the website, for example by attempting to access the admin area, copying the catalogue in bulk, or placing false orders.</p>

        <h2>2. Our products</h2>
        <ul>
          <li>Our jewellery is made in 925 sterling silver (92.5% pure silver) unless a product is described as 999 fine silver. Each piece is stamped with its purity.</li>
          <li>Gold-plated, rose-gold-plated and oxidised pieces are sterling silver with a surface finish. Plating and oxidised finishes can wear gradually with use, perfume and water; this is normal and is not a defect.</li>
          <li>Photographs are for illustration. Handmade pieces, natural pearls and stones can differ slightly in colour, shape and size from the photo.</li>
          <li>Listed weights are approximate and may vary by up to 3%. Where a piece is priced by weight, your invoice is based on the actual weight of the piece you receive.</li>
        </ul>

        <h2>3. Prices</h2>
        <ul>
          <li>All prices are in Qatari Riyals (QAR).</li>
          <li>Most pieces are priced on the day&apos;s silver rate: weight × silver rate, plus the making charge, plus the value of any stones. We update the silver rate each working day, and the price breakdown is shown on each product page. Some pieces have a fixed price instead.</li>
          <li>The price that applies is the price shown when you place your order, provided we confirm the order the same day. If the silver rate changes before we confirm, we will tell you the updated price and you can choose to continue or cancel at no cost.</li>
          <li>If a price is clearly wrong because of a technical or typing error, we are not required to sell at that price. We will contact you and you may accept the correct price or cancel.</li>
        </ul>

        <h2>4. Orders</h2>
        <p>An order placed on the website or by WhatsApp is a request to buy. A binding sale exists only once our team confirms the order with you by phone, WhatsApp or email. We may decline or cancel an order if a piece is out of stock, if we cannot reach you to confirm, if the delivery details are incomplete, or if we have reasonable grounds to suspect fraud. If you have already paid for a cancelled order, we will refund you in full.</p>

        <h2>5. Payment</h2>
        <p>You can pay by cash on delivery, by card on delivery, or when you collect your order at our showroom. We do not collect card details on this website. Ownership of the jewellery passes to you once it has been paid for in full.</p>

        <h2>6. Delivery</h2>
        <ul>
          <li>We deliver within the State of Qatar only. Delivery times are listed on our <Link href="/delivery-returns">Delivery &amp; returns</Link> page and are estimates, not guarantees.</li>
          <li>For your security, the person receiving the order must sign for it and may be asked to show a valid QID or passport.</li>
          <li>If nobody is available at the agreed time, we will contact you to rearrange. If we cannot deliver after two attempts, we may cancel the order.</li>
          <li>Please check your parcel when it arrives and tell us within 24 hours if anything is missing or damaged.</li>
        </ul>

        <h2>7. Exchanges and returns</h2>
        <ul>
          <li><b>Exchange:</b> unworn pieces can be exchanged within 14 days of delivery for another design of equal or higher value.</li>
          <li><b>Return:</b> unworn pieces in their original condition and packaging, with tags and invoice, can be returned within 7 days of delivery.</li>
          <li>The following cannot be returned or exchanged unless faulty: customised, engraved or resized pieces; made-to-order pieces; earrings (for hygiene reasons); and 999 fine silver.</li>
          <li>Approved refunds are made by the same method you paid with, or in cash at the showroom, within 14 days of us receiving the returned piece.</li>
          <li>If a piece is faulty or not as described, contact us and we will repair, replace or refund it. Nothing in these terms limits your rights under Qatar&apos;s Consumer Protection Law (Law No. 8 of 2008).</li>
        </ul>

        <h2>8. Resizing, care and polishing</h2>
        <p>Free resizing is available within 30 days of purchase for most plain and stone-set silver rings and bangles, where the design allows it. You can bring any piece bought from us to the showroom for free cleaning and polishing. Silver naturally darkens over time with exposure to air, perfume and moisture; this is not a defect.</p>

        <h2>9. Made-to-order and custom pieces</h2>
        <p>Custom and made-to-order pieces usually take 7–14 days. We may ask for an advance payment before work begins. Because they are made to your request, these pieces cannot be cancelled once production has started and cannot be returned unless faulty.</p>

        <h2>10. Content and trademarks</h2>
        <p>The Kohinoor Jewellery name, the KJ crown logo, product photographs, descriptions and the design of this website belong to us or are used with permission. You may not copy or reuse them for commercial purposes without our written consent.</p>

        <h2>11. Our responsibility</h2>
        <p>We take care to keep this website accurate and available, but we cannot guarantee it will always be free of errors or interruptions. To the extent permitted by Qatari law, our liability for any order is limited to the price paid for that order, and we are not responsible for indirect losses. Nothing in these terms limits liability that cannot be limited by law.</p>

        <h2>12. Changes to these terms</h2>
        <p>We may update these terms from time to time. The version shown on this page when you place an order is the one that applies to that order.</p>

        <h2>13. Governing law and language</h2>
        <p>These terms are governed by the laws of the State of Qatar, including the Electronic Commerce and Transactions Law (Decree-Law No. 16 of 2010), and the courts of the State of Qatar have jurisdiction over any dispute. If we publish an Arabic version of these terms and it differs from this English version, the Arabic version prevails.</p>

        <h2>14. Contact us</h2>
        <p>
          {COMPANY.legalName} (C.R. No. {COMPANY.crNumber})<br />
          {s.address}<br />
          Phone / WhatsApp: {s.phone}<br />
          Email: {s.email}<br />
          Showroom hours: {s.hours}
        </p>
      </div>
    </SimplePage>
  );
}
