import type { Metadata } from "next";
import Link from "next/link";
import SimplePage from "@/components/SimplePage";
import { getCatalog } from "@/lib/catalog";
import { COMPANY, LEGAL_UPDATED } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Kohinoor Jewellery W.L.L. collects, uses and protects your personal data, in line with Qatar Law No. 13 of 2016.",
};

export default async function Page() {
  const { settings: s } = await getCatalog();
  return (
    <SimplePage title="Privacy policy" crumb="Privacy">
      <div className="prose legal">
        <p className="updated">Last updated: {LEGAL_UPDATED}</p>
        <div className="legal-box">
          <b>{COMPANY.legalName}</b>
          <span>Commercial Registration No. {COMPANY.crNumber} · {COMPANY.country}</span>
        </div>
        <p>This policy explains how {COMPANY.legalName} (&ldquo;Kohinoor Jewellery&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses and protects your personal data when you visit this website, place an order or contact us. We handle personal data in line with Qatar&apos;s Law No. 13 of 2016 on the Protection of Personal Data Privacy.</p>

        <h2>1. Who is responsible for your data</h2>
        <p>{COMPANY.legalName}, {COMPANY.legalForm} under Commercial Registration No. {COMPANY.crNumber}, is responsible for your personal data. Our contact details are at the end of this policy.</p>

        <h2>2. What we collect</h2>
        <ul>
          <li><b>Order details:</b> your name, mobile number, email address (optional), delivery address (area, zone, street and building), preferred delivery time, payment method, any notes you add, and the pieces you order.</li>
          <li><b>Messages:</b> what you send us on WhatsApp, by phone or by email, for example questions about a product or an order.</li>
          <li><b>Delivery checks:</b> our delivery staff may ask to see your QID or passport to make sure the order reaches the right person. We do not keep a copy of it.</li>
          <li><b>Technical data:</b> like any website, our hosting provider automatically processes basic technical information such as your IP address and browser type to deliver pages securely.</li>
        </ul>
        <p>We do not collect card numbers on this website, and we do not ask for sensitive personal data. If you pay online, we keep the payment reference and status that SkipCash sends us.</p>

        <h2>3. Data stored on your own device</h2>
        <p>Your shopping bag, wishlist, recently viewed pieces and light/dark display setting are saved in your own browser so they are there when you return. This information stays on your device and is not sent to us until you place an order. We do not use advertising or tracking cookies.</p>

        <h2>4. Why we use your data</h2>
        <ul>
          <li>To confirm, prepare, deliver and support your order, including exchanges, returns, resizing and polishing.</li>
          <li>To contact you about your order by phone, WhatsApp or email.</li>
          <li>To keep sales and accounting records required by Qatari law.</li>
          <li>To prevent fraud and keep the website secure.</li>
          <li>To send you news of new collections or offers, only if you have agreed to it. You can opt out at any time.</li>
        </ul>

        <h2>5. Who we share it with</h2>
        <p>We never sell your personal data. We share it only where needed:</p>
        <ul>
          <li>With our staff and delivery team, to fulfil your order.</li>
          <li>With the technical providers that host this website and store our order database. Their servers may be located outside Qatar; we use reputable providers that protect data with encryption and access controls.</li>
          <li>With WhatsApp (Meta), when you choose to contact us or order through WhatsApp. Their own privacy policy applies to that service.</li>
          <li>With SkipCash, our online payment provider, when you choose to pay online: your name, mobile number, email address, order number and amount, so it can process the payment. You enter your card details directly on SkipCash&apos;s secure page; we never receive them.</li>
          <li>With government authorities, courts or regulators in Qatar, when the law requires it.</li>
        </ul>

        <h2>6. How long we keep it</h2>
        <p>We keep order records for as long as Qatari commercial and accounting laws require. Other messages and details are deleted when they are no longer needed for the purpose they were collected for.</p>

        <h2>7. How we protect it</h2>
        <p>The website uses an encrypted (HTTPS) connection. Order data is stored in a secured database that only authorised Kohinoor Jewellery staff can access, with individual logins.</p>

        <h2>8. Your rights</h2>
        <p>Under Law No. 13 of 2016 you can ask us to:</p>
        <ul>
          <li>tell you what personal data we hold about you and give you a copy;</li>
          <li>correct data that is wrong or incomplete;</li>
          <li>delete your data when we no longer need it, unless we must keep it by law;</li>
          <li>stop using your data for marketing, or withdraw a consent you gave.</li>
        </ul>
        <p>To make a request, contact us using the details below. We will reply within 30 days. If you are not satisfied with our answer, you can complain to the competent data protection authority in Qatar.</p>

        <h2>9. Children</h2>
        <p>This website is not intended for children under 18, and we do not knowingly collect their personal data. A parent or guardian can contact us to have a child&apos;s data removed.</p>

        <h2>10. Changes to this policy</h2>
        <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>

        <h2>11. Contact us</h2>
        <p>
          {COMPANY.legalName} (C.R. No. {COMPANY.crNumber})<br />
          {s.address}<br />
          Phone / WhatsApp: {s.phone}<br />
          Email: {s.email}
        </p>
        <p>See also our <Link href="/terms">Terms &amp; conditions</Link>.</p>
      </div>
    </SimplePage>
  );
}
