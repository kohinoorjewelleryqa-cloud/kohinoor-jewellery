// Generates supabase/demo-products-2000.csv from the demo catalogue.
// Run: npx tsx scripts/make-demo-csv.ts
import { writeFileSync } from "node:fs";
import Papa from "papaparse";
import { demoProducts } from "../lib/demo";
import { productToCsvRow, CSV_COLUMNS } from "../lib/csv";

const rows = demoProducts().map(productToCsvRow);
writeFileSync("supabase/demo-products-2000.csv", Papa.unparse(rows, { columns: [...CSV_COLUMNS] }));
writeFileSync("public/kohinoor-product-template.csv", Papa.unparse(rows.slice(0, 3).map((r) => ({ ...r, image_urls: "" })), { columns: [...CSV_COLUMNS] }));
console.log(`Wrote ${rows.length} products`);
