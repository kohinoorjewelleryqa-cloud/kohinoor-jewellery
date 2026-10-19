import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

// Returns priced products by id, for the bag, wishlist and recently viewed.
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 60);
  const { products } = await getCatalog();
  const map = new Map(products.map((p) => [p.id, p]));
  return NextResponse.json(ids.map((id) => map.get(id)).filter(Boolean));
}
