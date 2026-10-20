"use client";
import { useEffect, useState } from "react";
import RatesEditor from "@/components/admin/RatesEditor";
import OnlinePayments from "@/components/admin/OnlinePayments";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { refreshShop } from "@/lib/admin";

type S = { store_name: string; phone: string; whatsapp: string; email: string; address: string; hours: string };
const EMPTY: S = { store_name: "", phone: "", whatsapp: "", email: "", address: "", hours: "" };

export default function SettingsPage() {
  const [s, setS] = useState<S>(EMPTY);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  useEffect(() => { supabaseBrowser().from("settings").select("store_name,phone,whatsapp,email,address,hours").eq("id", 1).maybeSingle().then(({ data }) => data && setS({ ...EMPTY, ...data })); }, []);
  const f = (k: keyof S) => (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: e.target.value });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const whatsapp = s.whatsapp.replace(/\D/g, "");
    if (whatsapp.length < 10) { setMsg({ t: "err", m: "Enter the WhatsApp number with country code, e.g. 97455551234." }); return; }
    const { error } = await supabaseBrowser().from("settings").update({ ...s, whatsapp }).eq("id", 1);
    if (!error) await refreshShop();
    setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: "Settings saved." });
  };
  return (
    <>
      <h1>Store settings</h1><p className="sub">Contact details shown in the footer, contact page and WhatsApp buttons.</p>
      <div style={{ display: "grid", gap: 16 }}>
        <form className="panel" onSubmit={save}><h2>Store details</h2>
          {msg && <div className={`notice ${msg.t}`}>{msg.m}</div>}
          <div className="form">
            <div className="field"><label htmlFor="sn">Store name</label><input id="sn" value={s.store_name} onChange={f("store_name")} /></div>
            <div className="field"><label htmlFor="ph">Phone (as shown)</label><input id="ph" value={s.phone} onChange={f("phone")} placeholder="+974 5555 1234" /></div>
            <div className="field"><label htmlFor="wa">WhatsApp number <span className="hint">country code + number, digits only</span></label><input id="wa" value={s.whatsapp} onChange={f("whatsapp")} placeholder="97455551234" /></div>
            <div className="field"><label htmlFor="em">Email</label><input id="em" value={s.email} onChange={f("email")} /></div>
            <div className="field full"><label htmlFor="ad">Showroom address</label><input id="ad" value={s.address} onChange={f("address")} /></div>
            <div className="field full"><label htmlFor="hr">Opening hours</label><input id="hr" value={s.hours} onChange={f("hours")} /></div>
          </div>
          <button className="btn p" style={{ marginTop: 14 }} type="submit">Save settings</button>
        </form>
        <RatesEditor />
        <OnlinePayments />
      </div>
    </>
  );
}
