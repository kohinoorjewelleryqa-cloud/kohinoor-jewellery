import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import RateCalculator from "@/components/RateCalculator";
import { getCatalog } from "@/lib/catalog";
import { METAL } from "@/lib/constants";

export const metadata: Metadata = { title: "Today's Silver Rate in Qatar", description: "Today's silver rate in Qatar for 999 fine silver and 925 sterling silver, with a silver jewellery price calculator." };
export const revalidate = 600;

export default async function SilverRate() {
  const { settings } = await getCatalog();
  const rows: [string, string][] = [["ag999", "999 Fine Silver"], ["ag925", "925 Sterling Silver"]];
  const updated = settings.rates_updated_at ? new Date(settings.rates_updated_at).toLocaleString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium", timeStyle: "short" }) : null;
  return (
    <SimplePage title="Today's silver rate in Qatar" crumb="Silver rate">
      <div className="two">
        <div className="panel"><h2>Rates in QAR</h2>
          <div style={{ overflowX: "auto" }}><table className="rtable"><thead><tr><th>Silver</th><th>1 g</th><th>10 g</th><th className="hide-xs">100 g</th><th>1 kg</th></tr></thead><tbody>
            {rows.map(([id, l]) => { const r = settings.rates[id] ?? 0, c = METAL[id].colors; return <tr key={id}><td><span className="sw" style={{ background: `linear-gradient(135deg,${c[0]},${c[1]} 55%,${c[2]})` }} />{l}</td><td>{r.toFixed(2)}</td><td>{(r * 10).toFixed(2)}</td><td className="hide-xs">{(r * 100).toFixed(2)}</td><td>{Math.round(r * 1000).toLocaleString("en-US")}</td></tr>; })}
          </tbody></table></div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "10px 0 0" }}>{updated ? `Last updated ${updated} (Doha time).` : "Rates are updated every morning."} Sterling, oxidised and plated pieces use the 925 rate.</p>
        </div>
        <aside className="panel summary"><h2>Price calculator</h2><RateCalculator rates={settings.rates} /></aside>
      </div>
    </SimplePage>
  );
}
