import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
export const metadata: Metadata = { title: "FAQs & Size Guide", description: "Answers about pricing, hallmarking, sizes, ordering, delivery and exchange." };
const FAQ: [string, string, string][] = [
  ["price", "How is the price of gold jewellery calculated?", "Price = gram weight × today's rate for that karat, plus the making charge, plus the value of any stones. The breakdown is shown on every product page."],
  ["hallmark", "Is your gold hallmarked?", "Yes. Every gold piece carries a purity stamp, and diamonds above 0.30 ct come with a lab certificate."],
  ["size", "How do I find my ring or bangle size?", "Ring sizes follow the standard 6–22 scale; bangle sizes follow the Gulf 2.2–2.10 scale. Visit the showroom for a free sizing, or measure the inside diameter of a ring you already wear: size 10 ≈ 16.5 mm, size 14 ≈ 17.5 mm, size 18 ≈ 18.6 mm."],
  ["order", "How do I order?", "Tap “Order on WhatsApp” on any product to message us directly, or add pieces to your bag and check out with cash or card on delivery."],
  ["resize", "Can I resize a ring or bangle?", "Free resizing is included within 30 days of purchase for most plain and diamond rings and bangles."],
  ["delivery", "How long does delivery take?", "Same day in Doha, Lusail and Al Wakrah for in-stock pieces ordered before 4 pm; next day elsewhere in Qatar. Made-to-order pieces take 7–14 days."],
  ["exchange", "Do you offer exchange or buyback?", "Lifetime exchange on Kohinoor gold at the prevailing rate."],
];
export default function Faq() {
  return <SimplePage title="FAQs & size guide" crumb="FAQs"><div className="prose">{FAQ.map(([id, q, a]) => <details id={id} key={id}><summary>{q}</summary><p>{a}</p></details>)}</div></SimplePage>;
}
