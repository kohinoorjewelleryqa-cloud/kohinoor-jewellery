"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop } from "@/lib/admin";
import { skipcashStatus } from "@/app/admin/(panel)/settings/actions";

/** Admin switch for the "Pay online (card / Apple Pay)" option at checkout. */
export default function OnlinePayments() {
  const [on, setOn] = useState<boolean | null>(null);
  const [missing, setMissing] = useState(false);
  const [keys, setKeys] = useState<{ configured: boolean; live: boolean } | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabaseBrowser().from("settings").select("online_payments").eq("id", 1).maybeSingle().then(({ data, error }) => {
      if (error) { setMissing(true); return; }
      setOn(data?.online_payments !== false);
    });
    skipcashStatus().then(setKeys).catch(() => setKeys({ configured: false, live: false }));
  }, []);

  const toggle = async () => {
    if (on === null) return;
    setBusy(true); setMsg(null);
    const next = !on;
    const { error } = await supabaseBrowser().from("settings").update({ online_payments: next }).eq("id", 1);
    if (!error) { setOn(next); await refreshShop(); }
    setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: next ? "Online payment is switched on." : "Online payment is switched off. Customers can still pay on delivery." });
    setBusy(false);
  };

  const showing = Boolean(on && keys?.configured);
  return (
    <div className="panel"><h2>Online payment (SkipCash)</h2>
      {msg && <div className={`notice ${msg.t}`}>{msg.m}</div>}
      {missing ? (
        <p className="sub" style={{ margin: 0 }}>Run <b>supabase/add-online-payments.sql</b> in the Supabase SQL Editor to enable this setting.</p>
      ) : (
        <>
          <label className="switch-row">
            <span>
              <b>Show &ldquo;Pay online (card / Apple Pay)&rdquo; at checkout</b>
              <small>Turn this off any time, for example if SkipCash has a problem. Cash and card on delivery always stay available.</small>
            </span>
            <button type="button" role="switch" aria-checked={Boolean(on)} className={`switch${on ? " on" : ""}`} onClick={toggle} disabled={busy || on === null}><span /></button>
          </label>
          <p className={`pay-state ${showing ? "ok" : ""}`}>
            {keys === null ? "Checking…" : !keys.configured
              ? "Not active yet: SkipCash keys haven't been added in Vercel. Customers don't see the option."
              : !on ? "Keys are set, but the switch is off. Customers don't see the option."
              : keys.live ? "Live: customers can pay online now." : "Test mode: payments go to SkipCash's test system. Add SKIPCASH_LIVE = yes in Vercel to take real payments."}
          </p>
        </>
      )}
    </div>
  );
}
