import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: 'Gold Jewellery', description: "22K, 21K and 18K gold jewellery priced at today's gold rate." };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/gold" sp={await searchParams} preset={{ metal: ["yg24", "yg22", "yg21", "yg18", "wg18", "rg18"] }} title='Gold Jewellery' intro="22K, 21K and 18K gold jewellery priced at today's gold rate." />;
}
