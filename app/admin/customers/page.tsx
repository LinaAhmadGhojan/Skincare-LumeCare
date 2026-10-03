"use client";

import Link from "next/link";
import { useState } from "react";
import { Empty } from "@/components/admin";
import { money } from "@/lib/data";
import { isRevenue, useStore } from "@/lib/store";
import { when } from "@/lib/ui";

export default function Customers() {
  const S = useStore();
  const [q, setQ] = useState("");
  const map = new Map<string, { name: string; phone: string; city: string; orders: number; spent: number; last: number; lastId: string; cod: number }>();
  S.orders().forEach((o) => {
    const c = map.get(o.customer.phone) ?? { name: o.customer.name, phone: o.customer.phone, city: o.customer.city, orders: 0, spent: 0, last: 0, lastId: o.id, cod: 0 };
    c.orders++;
    if (isRevenue(o)) c.spent += o.total;
    if (o.payment === "cod") c.cod++;
    if (o.at > c.last) { c.last = o.at; c.lastId = o.id; }
    map.set(o.customer.phone, c);
  });
  const all = [...map.values()].sort((a, b) => b.spent - a.spent);
  const repeat = all.filter((c) => c.orders > 1).length;
  const s = q.trim().toLowerCase();
  const list = all.filter((c) => !s || [c.name, c.phone, c.city].some((v) => v.toLowerCase().includes(s)));

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">Grouped by mobile number</span><h1>Customers</h1></div>
        <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or city" aria-label="Search customers" />
      </header>
      <div className="kpi-row three">
        <div className="kpi"><span>Customers</span><b>{all.length}</b><small>Guests and account holders</small></div>
        <div className="kpi"><span>Repeat customers</span><b>{repeat}</b><small>{all.length ? Math.round((repeat / all.length) * 100) : 0}% ordered more than once</small></div>
        <div className="kpi"><span>Loyalty points issued</span><b>{S.points()}</b><small>Balance of the demo account</small></div>
      </div>
      <section className="panel flush">
        {list.length === 0 ? <Empty>No customers match.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Customer</th><th>City</th><th>Orders</th><th>Spent</th><th>Prefers</th><th className="r">Last order</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.phone}>
                  <td><div className="prow"><span className="avatar">{c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span><span><b>{c.name}</b><br /><span className="muted small">{c.phone}</span></span></div></td>
                  <td data-l="City">{c.city}</td>
                  <td data-l="Orders">{c.orders}{c.orders > 1 && <span className="chip new">Repeat</span>}</td>
                  <td data-l="Spent"><b>{money(c.spent)}</b></td>
                  <td data-l="Prefers">{c.cod >= c.orders / 2 ? "Cash on Delivery" : "Online payment"}</td>
                  <td className="r"><Link className="olink" href={`/admin/orders/?id=${c.lastId}`}>{c.lastId}</Link><br /><span className="muted small">{when(c.last)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
