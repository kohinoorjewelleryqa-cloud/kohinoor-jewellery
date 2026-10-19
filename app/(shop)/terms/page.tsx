import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
export const metadata: Metadata = { title: "Terms & Conditions" };
export default function Page() {
  return <SimplePage title="Terms & conditions" crumb="Terms"><div className="prose"><p>Prices are calculated at the gold rate in force when the order is placed and confirmed by our team. Product weights may vary by up to 3% from the listed weight; the final invoice reflects the actual weight.</p><p className="placeholder">Final legal text to be supplied by the client.</p></div></SimplePage>;
}
