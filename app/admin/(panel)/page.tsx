"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import RatesEditor from "@/components/admin/RatesEditor";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { fmtDate } from "@/lib/admin";
import { qar } from "@/lib/pricing";
import { STATUS_LABEL } from "@/lib/constants";

type O = { id: string; order_no: string; customer_name: string; total: number; status: string; created_at: string };

export default function Dashboard() {
  const [s, setS] = useState({ products: 0, outOfStock: 0, newOrders: 0, today: 0 });
  const [orders, setOrders] = useState<O[]>([]);
  useEffect(() => {
    const db = supabaseBrowser();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    Promise.all([
      db.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      db.from("products").select("id", { count: "exact", head: true }).eq("is_active", true).lte("stock", 0),
      db.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("orders").select("id", { count: "exact", head: true }).gte("created_at", start.toISOString()),
      db.from("orders").select("id,order_no,customer_name,total,status,created_at").order("created_at", { ascending: false }).limit(8),
    ]).then(([a, b, c, d, e]) => {
      setS({ products: a.count ?? 0, outOfStock: b.count ?? 0, newOrders: c.count ?? 0, today: d.count ?? 0 });
      setOrders((e.data as O[]) ?? []);
    });
  }, []);
  return (
    <>
      <h1>Dashboard</h1><p className="sub">Update the gold rate each morning, then check new orders.</p>
      <div className="tiles">
        <div className="tile"><small>Live products</small><b className="num">{s.products.toLocaleString()}</b></div>
        <div className="tile"><small>Made to order / no stock</small><b className="num">{s.outOfStock.toLocaleString()}</b></div>
        <div className={`tile${s.newOrders ? " alert" : ""}`}><small>New orders</small><b className="num">{s.newOrders}</b></div>
        <div className="tile"><small>Orders today</small><b className="num">{s.today}</b></div>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        <RatesEditor />
        <div className="panel">
          <div className="sh" style={{ marginBottom: 10 }}><h2 style={{ margin: 0 }}>Latest orders</h2><Link href="/admin/orders" style={{ color: "var(--maroon)", fontWeight: 600 }}>All orders →</Link></div>
          {orders.length ? <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead><tbody>
            {orders.map((o) => <tr key={o.id}><td className="num">{o.order_no}</td><td>{o.customer_name}</td><td className="num">{qar(o.total)}</td><td><span className={`pill${o.status === "new" ? " new" : o.status === "delivered" ? " ok" : ""}`}>{STATUS_LABEL[o.status]}</span></td><td>{fmtDate(o.created_at)}</td></tr>)}
          </tbody></table></div> : <p className="sub">No orders yet. Orders placed on the shop appear here.</p>}
        </div>
      </div>
    </>
  );
}
