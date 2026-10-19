import Link from "next/link";
import type { Category, Collection, Settings } from "@/lib/types";
import { COMPANY } from "@/lib/company";

export default function Footer({ settings, categories, collections }: { settings: Settings; categories: Category[]; collections: Collection[] }) {
  return (
    <footer className="site"><div className="wrap">
      <div className="fgrid">
        <div className="fbrand">
          <img src="/logo.webp" alt="Kohinoor Jewellery" width={51} height={76} />
          <p>925 sterling silver jewellery for Qatar. Hallmarked, hand-finished and fairly priced.</p>
          <p className="num" style={{ opacity: 0.9 }}>{settings.address}<br />Phone / WhatsApp: {settings.phone}<br />{settings.email}<br />{settings.hours}</p>
        </div>
        <div><h4>Shop</h4><ul>{categories.slice(0, 7).map((c) => <li key={c.slug}><Link href={`/jewellery/${c.slug}`}>{c.name}</Link></li>)}</ul></div>
        <div><h4>Collections</h4><ul>{collections.map((c) => <li key={c.slug}><Link href={`/collections/${c.slug}`}>{c.name}</Link></li>)}</ul></div>
        <div><h4>Help</h4><ul>
          <li><Link href="/silver-rate">Today&apos;s silver rate</Link></li><li><Link href="/delivery-returns">Delivery &amp; returns</Link></li>
          <li><Link href="/faq">FAQs &amp; size guide</Link></li><li><Link href="/about">About us</Link></li><li><Link href="/contact">Contact us</Link></li>
          <li><Link href="/privacy">Privacy policy</Link></li><li><Link href="/terms">Terms &amp; conditions</Link></li>
        </ul></div>
      </div>
      <div className="fbot"><span>© {new Date().getFullYear()} {COMPANY.legalName}, Qatar · C.R. No. {COMPANY.crNumber}. All rights reserved.</span>
        <div className="pay"><span>VISA</span><span>MASTERCARD</span><span>APPLE PAY</span><span>COD</span></div></div>
    </div></footer>
  );
}
