import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: 'New Arrivals', description: 'The latest designs added to the Kohinoor collection.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/new-arrivals" sp={await searchParams} preset={{ new: true }} title='New Arrivals' intro='The latest designs added to the Kohinoor collection.' />;
}
