import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: "Kids' Jewellery", description: 'Light, safe designs for children: small studs, bangles and chains.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/kids" sp={await searchParams} preset={{ for: ["Kids"] }} title="Kids' Jewellery" intro='Light, safe designs for children: small studs, bangles and chains.' />;
}
