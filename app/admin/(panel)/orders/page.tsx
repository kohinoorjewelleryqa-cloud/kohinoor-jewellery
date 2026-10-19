"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { fmtDate } from "@/lib/admin";
import { qar } from "@/lib/pricing";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/constants";
import type { OrderItem } from "@/lib/types";

type Order = { id: string; order_no: string; customer_name: string; phone: string; email: string | null; area: string; zone: string; street: string; building: string; delivery_slot: string; payment_method: string; notes: string | null; items: OrderItem[]; total: number; status: string; created_at: string };

const waNumber = (phone: string) => { const d = phone.replace(/\D/g, ""); return d.length === 8 ? `974${d}` : d; };

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("active");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabaseBrowser().from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (status === "active") query = query.not("status", "in", "(delivered,cancelled)");
    else if (status !== "all") query = query.eq("status", status);
    if (q.trim()) query = query.or(`order_no.ilike.%${q.trim()}%,customer_name.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`);
    const { data } = await query;
    setOrders((data as Order[]) ?? []); setLoading(false);
  }, [status, q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  // Live updates: new orders appear without refreshing.
  useEffect(() => {
    const db = supabaseBrowser();
    const ch = db.channel("orders-live").on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => load()).subscribe();
    return () => { db.removeChannel(ch); };
  }, [load]);

  const setOrderStatus = async (o: Order, s: string) => {
    await supabaseBrowser().from("orders").update({ status: s }).eq("id", o.id);
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: s } : x)));
  };

  return (
    <>
      <h1>Orders</h1><p className="sub">Bag and checkout orders from the shop. WhatsApp orders arrive in your WhatsApp directly.</p>
      <div className="bar">
        <input className="grow" placeholder="Search order no., name or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="active">Open orders</option><option value="all">All orders</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
      </div>
      <div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Order</th><th>Customer</th><th>Area</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <Fragment key={o.id}>
              <tr onClick={() => setOpen(open === o.id ? null : o.id)} style={{ cursor: "pointer" }}>
                <td className="num"><b>{o.order_no}</b></td><td>{o.customer_name}<br /><small className="num" style={{ color: "var(--muted)" }}>{o.phone}</small></td><td>{o.area}</td>
                <td className="num">{qar(o.total)}</td><td>{o.payment_method}</td>
                <td onClick={(e) => e.stopPropagation()}><select value={o.status} onChange={(e) => setOrderStatus(o, e.target.value)} aria-label="Order status" style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "5px 8px", background: o.status === "new" ? "var(--maroon)" : "var(--surface)", color: o.status === "new" ? "var(--maroon-ink)" : "inherit" }}>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></td>
                <td>{fmtDate(o.created_at)}</td>
              </tr>
              {open === o.id && (
                <tr><td colSpan={7} style={{ whiteSpace: "normal", background: "var(--bg)" }}>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
                    <div className="order-items">{o.items.map((i, k) => <span key={k} className="num">{i.qty} × {i.name} ({i.sku}){i.size ? ` · size ${i.size}` : ""} · {i.weight_g} g @ {i.rate}/g — <b>{qar(i.unit_price * i.qty)}</b></span>)}</div>
                    <div className="order-items">
                      <span><b>Address:</b> {o.area}, Zone {o.zone}, Street {o.street}, Building {o.building}</span>
                      <span><b>Delivery:</b> {o.delivery_slot}</span>
                      {o.email && <span><b>Email:</b> {o.email}</span>}
                      {o.notes && <span><b>Notes:</b> {o.notes}</span>}
                      <span style={{ marginTop: 6 }}><a className="btn wa-btn" style={{ padding: "7px 14px", fontSize: 13 }} href={`https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(`Hello ${o.customer_name}, thank you for your Kohinoor Jewellery order ${o.order_no}.`)}`} target="_blank" rel="noopener">WhatsApp customer</a></span>
                    </div>
                  </div>
                </td></tr>
              )}
            </Fragment>
          ))}
          {!orders.length && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>{loading ? "Loading…" : "No orders here yet."}</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
