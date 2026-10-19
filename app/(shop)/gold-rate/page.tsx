import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import RateCalculator from "@/components/RateCalculator";
import { getCatalog } from "@/lib/catalog";
import { METAL } from "@/lib/constants";

export const metadata: Metadata = { title: "Today's Gold Rate in Qatar", description: "Today's gold rate in Qatar for 24K, 22K, 21K and 18K gold, with a jewellery price calculator." };
export const revalidate = 600;

export default async function GoldRate() {
  const { settings } = await getCatalog();
  const rows: [string, string][] = [["yg24", "24K · 999.9"], ["yg22", "22K · 916"], ["yg21", "21K · 875"], ["yg18", "18K · 750"], ["pt", "Platinum 950"], ["ag", "Silver 925"]];
  const updated = settings.rates_updated_at ? new Date(settings.rates_updated_at).toLocaleString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium", timeStyle: "short" }) : null;
  return (
    <SimplePage title="Today's gold rate in Qatar" crumb="Gold rate">
      <div className="two">
        <div className="panel"><h2>Rates in QAR</h2>
          <div style={{ overflowX: "auto" }}><table className="rtable"><thead><tr><th>Metal</th><th>1 g</th><th>8 g</th><th>10 g</th><th>Tola (11.66 g)</th></tr></thead><tbody>
            {rows.map(([id, l]) => { const r = settings.rates[id] ?? 0, c = METAL[id].colors; return <tr key={id}><td><span className="sw" style={{ background: `linear-gradient(135deg,${c[0]},${c[1]} 55%,${c[2]})` }} />{l}</td><td>{r.toFixed(2)}</td><td>{(r * 8).toFixed(2)}</td><td>{(r * 10).toFixed(2)}</td><td>{(r * 11.664).toFixed(2)}</td></tr>; })}
          </tbody></table></div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "10px 0 0" }}>{updated ? `Last updated ${updated} (Doha time).` : "Rates are updated every morning."} Jewellery prices on this site use these rates.</p>
        </div>
        <aside className="panel summary"><h2>Price calculator</h2><RateCalculator rates={settings.rates} /></aside>
      </div>
    </SimplePage>
  );
}
