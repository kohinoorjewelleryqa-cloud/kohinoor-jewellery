import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function Page() {
  return <SimplePage title="Privacy policy" crumb="Privacy"><div className="prose"><p>We collect your name, phone number, email and delivery address only to process your orders and provide support. We do not sell your data. You can ask us to delete your details at any time by contacting the showroom.</p><p className="placeholder">Final legal text to be supplied by the client, in line with Qatar Law No. 13 of 2016 on personal data protection.</p></div></SimplePage>;
}
