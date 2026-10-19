"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser, browserConfigured } from "@/lib/supabase-browser";

const NAV = [
  ["/admin", "Dashboard"], ["/admin/products", "Products"], ["/admin/import", "Import products"], ["/admin/orders", "Orders"],
  ["/admin/catalogue", "Categories & collections"], ["/admin/settings", "Store settings"],
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!browserConfigured) { router.replace("/admin/login"); return; }
    const db = supabaseBrowser();
    db.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/admin/login"); return; }
      setEmail(data.user.email ?? "");
      const { data: a } = await db.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
      setState(a ? "ok" : "denied");
    });
  }, [router]);
  useEffect(() => setOpen(false), [path]);

  const signOut = async () => { await supabaseBrowser().auth.signOut(); router.replace("/admin/login"); };

  if (state === "loading") return <div className="login-wrap"><p style={{ color: "var(--band-ink)" }}>Loading…</p></div>;
  if (state === "denied") return (
    <div className="login-wrap"><div className="login-card"><b>This account isn&apos;t an admin</b><p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>Signed in as {email}. Add this user to the <code>admins</code> table in Supabase (README, step 2), then sign in again.</p><button className="btn o" onClick={signOut}>Sign out</button></div></div>
  );

  return (
    <div className="adm">
      <div className="adm-top"><button type="button" aria-label="Menu" onClick={() => setOpen(true)}>☰</button><b>Kohinoor admin</b></div>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`adm-side${open ? " open" : ""}`}>
        <Link className="logo" href="/admin"><img src="/logo.webp" alt="" /><span><b>KOHINOOR</b><small>STORE ADMIN</small></span></Link>
        {NAV.map(([href, label]) => <Link key={href} className="nav" href={href} aria-current={(href === "/admin" ? path === href : path.startsWith(href)) ? "page" : undefined}>{label}</Link>)}
        <div className="bottom">
          <span style={{ opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis" }}>{email}</span>
          <a href="/" target="_blank" rel="noopener">View shop ↗</a>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
