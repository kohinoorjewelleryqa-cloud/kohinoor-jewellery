import type { Metadata } from "next";
import Listing from "@/components/Listing";

export const metadata: Metadata = { title: 'Gifts', description: 'Gift-ready jewellery for birthdays, Eid and every celebration, delivered across Qatar.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Listing base="/gifts" sp={await searchParams} preset={{ occ: ["Gifting"] }} title='Gifts' intro='Gift-ready jewellery for birthdays, Eid and every celebration, delivered across Qatar.' />;
}
