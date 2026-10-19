import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { getCatalog } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCatalog()).categories.find((x) => x.slug === slug);
  return c ? { title: c.name, description: c.intro ?? undefined, alternates: { canonical: `/jewellery/${slug}` } } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = (await getCatalog()).categories.find((x) => x.slug === slug);
  if (!c) notFound();
  return <Listing base={`/jewellery/${slug}`} sp={await searchParams} preset={{ cat: [slug] }} title={c.name} intro={c.intro} crumbMid={["All Jewellery", "/shop"]} />;
}
