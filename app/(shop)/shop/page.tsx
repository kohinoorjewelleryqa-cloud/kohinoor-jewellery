import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: "All Jewellery", description: "Browse every Kohinoor silver design: rings, earrings, necklaces, bracelets, anklets and sets." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/shop" sp={await searchParams} title="All Jewellery" intro="Every Kohinoor design in one place. Filter by metal, karat, stone, occasion and price, or search by name or SKU." />;
}
