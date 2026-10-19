"use client";
import { useState } from "react";
import { qar } from "@/lib/pricing";

export default function RateCalculator({ rates }: { rates: Record<string, number> }) {
  const [k, setK] = useState("ag925"), [w, setW] = useState("10"), [m, setM] = useState("120"), [s, setS] = useState("0");
  const mv = (parseFloat(w) || 0) * (rates[k] || 0), mc = (mv * (parseFloat(m) || 0)) / 100, st = parseFloat(s) || 0;
  return (
    <div className="calc">
      <div className="field"><label htmlFor="cK">Silver</label><select id="cK" value={k} onChange={(e) => setK(e.target.value)}><option value="ag925">925 sterling silver</option><option value="ag999">999 fine silver</option></select></div>
      <div className="field"><label htmlFor="cW">Weight (grams)</label><input id="cW" inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} /></div>
      <div className="field"><label htmlFor="cM">Making charge (%)</label><input id="cM" inputMode="decimal" value={m} onChange={(e) => setM(e.target.value)} /></div>
      <div className="field"><label htmlFor="cS">Stone value (QAR, optional)</label><input id="cS" inputMode="decimal" value={s} onChange={(e) => setS(e.target.value)} /></div>
      <div className="out"><span>Estimated price</span><b className="num">{qar(mv + mc + st)}</b><span className="num" style={{ fontSize: 13, opacity: 0.85 }}>Silver {qar(mv)} + making {qar(mc)}{st ? ` + stones ${qar(st)}` : ""}</span></div>
    </div>
  );
}
