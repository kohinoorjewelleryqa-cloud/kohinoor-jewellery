import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: "Men's Jewellery", description: 'Chains, signet rings, bracelets and cufflinks for men.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/men" sp={await searchParams} preset={{ for: ["Men"] }} title="Men's Jewellery" intro='Chains, signet rings, bracelets and cufflinks for men.' />;
}
