import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "Contact Us", description: "Visit, call or WhatsApp Kohinoor Jewellery in Doha." };
export default async function Contact() {
  const { settings } = await getCatalog();
  return (
    <SimplePage title="Contact us" crumb="Contact">
      <div className="prose" style={{ maxWidth: "none" }}>
        <div className="contact-cards">
          <div><b>Showroom</b><span>{settings.address}</span></div>
          <div><b>Phone &amp; WhatsApp</b><span>{settings.phone}</span></div>
          <div><b>Email</b><span>{settings.email}</span></div>
        </div>
        <p>{settings.hours}</p>
        <p><a className="btn wa-btn" href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Hello Kohinoor Jewellery, I have a question.")}`} target="_blank" rel="noopener">Chat on WhatsApp</a> <a className="btn o" href={`tel:${settings.phone.replace(/\s/g, "")}`}>Call the showroom</a> <a className="btn o" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Kohinoor Jewellery, ${settings.address}`)}`} target="_blank" rel="noopener">Get directions</a></p>
      </div>
    </SimplePage>
  );
}
