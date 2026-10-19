import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { getCatalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "About Us", description: "The story of Kohinoor Jewellery in Doha." };
export default async function About() {
  const { settings } = await getCatalog();
  return (
    <SimplePage title="About Kohinoor Jewellery" crumb="About us">
      <div className="prose">
        <p>Named after the most famous diamond in history, Kohinoor Jewellery brings fine gold, diamond and bridal jewellery to families across Qatar.</p>
        <h2>What we stand for</h2>
        <ul><li>Hallmarked purity on every gold piece</li><li>Transparent pricing: weight, rate and making charge shown separately</li><li>Certified diamonds above 0.30 ct</li><li>Lifetime exchange at the day&apos;s gold rate</li></ul>
        <h2>Visit the showroom</h2><p>{settings.address}<br />{settings.hours}</p>
      </div>
    </SimplePage>
  );
}
