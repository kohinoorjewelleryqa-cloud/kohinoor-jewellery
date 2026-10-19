import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: 'Best Sellers', description: 'The designs our customers in Qatar love most.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/best-sellers" sp={await searchParams} preset={{ best: true }} title='Best Sellers' intro='The designs our customers in Qatar love most.' />;
}
