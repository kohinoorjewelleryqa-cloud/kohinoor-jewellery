import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: 'Diamond Jewellery', description: 'Certified diamond rings, earrings, pendants and bracelets in 18K gold and platinum.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/diamond" sp={await searchParams} preset={{ stone: ["diamond"] }} title='Diamond Jewellery' intro='Certified diamond rings, earrings, pendants and bracelets in 18K gold and platinum.' />;
}
