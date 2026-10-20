import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { onlinePaymentsOn } from "@/lib/skipcash";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { settings } = await getCatalog();
  return <CheckoutClient online={onlinePaymentsOn(settings)} />;
}
