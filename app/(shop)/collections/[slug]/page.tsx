import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { getCatalog } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCatalog()).collections.find((x) => x.slug === slug);
  return c ? { title: `${c.name} Collection`, description: c.description ?? undefined } : {};
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = (await getCatalog()).collections.find((x) => x.slug === slug);
  if (!c) notFound();
  return <Listing base={`/collections/${slug}`} sp={await searchParams} preset={{ col: [slug] }} title={c.name} intro={c.description} crumbMid={["All Jewellery", "/shop"]} />;
}
