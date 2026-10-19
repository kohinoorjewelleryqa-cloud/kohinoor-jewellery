import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "About Us", description: "The story of Kohinoor Jewellery in Doha." };
export default async function About() {
  const { settings } = await getCatalog();
  return (
    <SimplePage title="About Kohinoor Jewellery" crumb="About us">
      <div className="prose">
        <p>Named after the most famous diamond in history, Kohinoor Jewellery brings hallmarked 925 sterling silver jewellery to families across Qatar, from everyday studs to oxidised heritage pieces.</p>
        <h2>What we stand for</h2>
        <ul><li>925 hallmark on every sterling silver piece</li><li>Transparent pricing: weight, rate and making charge shown separately</li><li>Nickel-free, skin-friendly silver</li><li>Free cleaning and polishing for life</li></ul>
        <h2>Visit the showroom</h2><p>{settings.address}<br />{settings.hours}</p>
      </div>
    </SimplePage>
  );
}
