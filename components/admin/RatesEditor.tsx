"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop, fmtDate } from "@/lib/admin";
import { METALS, DEFAULT_RATES } from "@/lib/constants";

/** Daily gold-rate box. Saving reprices every product on the shop. */
export default function RatesEditor() {
  const [rates, setRates] = useState<Record<string, string>>({});
  const [updated, setUpdated] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabaseBrowser().from("settings").select("rates,rates_updated_at").eq("id", 1).maybeSingle().then(({ data }) => {
      const r = { ...DEFAULT_RATES, ...(data?.rates ?? {}) };
      setRates(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)])));
      setUpdated(data?.rates_updated_at ?? null);
    });
  }, []);

  const save = async () => {
    const parsed: Record<string, number> = {};
    for (const m of METALS) {
      const n = parseFloat(rates[m.id]);
      if (!(n > 0)) { setMsg({ t: "err", m: `Enter a valid rate for ${m.label}.` }); return; }
      parsed[m.id] = n;
    }
    setSaving(true); setMsg(null);
    const now = new Date().toISOString();
    const { error } = await supabaseBrowser().from("settings").update({ rates: parsed, rates_updated_at: now }).eq("id", 1);
    if (!error) await refreshShop();
    setSaving(false);
    if (error) setMsg({ t: "err", m: error.message });
    else { setUpdated(now); setMsg({ t: "ok", m: "Rates saved. All shop prices now use the new rates." }); }
  };

  return (
    <div className="panel">
      <h2>Today&apos;s gold rate <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--f-body)" }}>(QAR per gram)</span></h2>
      <p className="sub" style={{ marginBottom: 12 }}>{updated ? `Last updated ${fmtDate(updated)}` : "Not updated yet"}. Update every morning; white and rose gold usually match 18K.</p>
      {msg && <div className={`notice ${msg.t}`}>{msg.m}</div>}
      <div className="form" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
        {METALS.map((m) => (
          <div className="field" key={m.id}><label htmlFor={`r-${m.id}`}>{m.short}</label><input id={`r-${m.id}`} inputMode="decimal" value={rates[m.id] ?? ""} onChange={(e) => setRates({ ...rates, [m.id]: e.target.value })} /></div>
        ))}
      </div>
      <button className="btn p" style={{ marginTop: 14 }} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save rates"}</button>
    </div>
  );
}
