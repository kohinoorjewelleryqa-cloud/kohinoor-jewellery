import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: 'Bridal Jewellery', description: 'Everything for the wedding: bridal sets, statement necklaces, bangles and engagement rings.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/bridal" sp={await searchParams} preset={{ occ: ["Wedding"] }} title='Bridal Jewellery' intro='Everything for the wedding: bridal sets, statement necklaces, bangles and engagement rings.' />;
}
