"use client";

import Link from "next/link";
import { Bars, Empty, Meter, OrderLink, Status, ViewOrder } from "@/components/admin";
import { COURIERS, PAYMENTS, PRODUCTS, asset, money } from "@/lib/data";
import { components, isRevenue, lineInfo, useStore } from "@/lib/store";

const DAY = 86400000;

export default function Dashboard() {
  const S = useStore();
  const orders = S.orders();
  const now = Date.now(), from = now - 14 * DAY, prevFrom = now - 28 * DAY;
  const recent = orders.filter((o) => o.at >= from);
  const prev = orders.filter((o) => o.at >= prevFrom && o.at < from);
  const sales = recent.filter(isRevenue);
  const revenue = sales.reduce((a, o) => a + o.total, 0);
  const aov = sales.length ? revenue / sales.length : 0;
  const shipped = recent.filter((o) => o.shipment);
  const returned = recent.filter((o) => o.status === "Returned").length;
  const returnRate = shipped.length ? Math.round((returned / shipped.length) * 100) : 0;
  const prevRevenue = prev.filter(isRevenue).reduce((a, o) => a + o.total, 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(now - (13 - i) * DAY); start.setHours(0, 0, 0, 0);
    const end = start.getTime() + DAY;
    const dayOrders = sales.filter((o) => o.at >= start.getTime() && o.at < end);
    return {
      label: start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      value: dayOrders.reduce((a, o) => a + o.total, 0),
      sub: `${dayOrders.length} orders`,
    };
  });

  const units: Record<string, number> = {};
  sales.forEach((o) => o.lines.forEach((l) => components(l).forEach((c) => { units[c.id] = (units[c.id] || 0) + c.qty * l.qty; })));
  const top = PRODUCTS.map((p) => ({ p, n: units[p.id] || 0 })).sort((a, b) => b.n - a.n);
  const topMax = Math.max(1, ...top.map((t) => t.n));

  const courierCount = COURIERS.map((c) => ({ c, n: shipped.filter((o) => o.shipment!.courier === c.name).length }));
  const cod = recent.filter((o) => o.payment === "cod").length;

  const toConfirm = orders.filter((o) => o.status === "Pending");
  const toBook = orders.filter((o) => o.status === "Confirmed");
  const rejected = orders.filter((o) => o.bookingError);
  const low = PRODUCTS.filter((p) => S.stock(p.id) <= 8);

  return (
    <>
      <header className="adm-head">
        <div>
          <span className="eyebrow">Last 14 days</span>
          <h1>Good day, team.</h1>
        </div>
        <Link className="btn sm ghost" href="/admin/orders/">All orders →</Link>
      </header>

      <div className="kpi-row">
        <div className="kpi dark"><span>Revenue</span><b>{money(revenue)}</b>
          <small>{prevRevenue ? `${revenue >= prevRevenue ? "▲" : "▼"} vs previous 14 days` : "Delivered, shipped and open orders"}</small></div>
        <div className="kpi"><span>Orders</span><b>{recent.length}</b><small>{sales.length} counted in revenue</small></div>
        <div className="kpi"><span>Average order</span><b>{money(aov)}</b><small>Bundles raise this number</small></div>
        <div className="kpi"><span>Return rate</span><b>{returnRate}%</b><small>{returned} of {shipped.length} shipped parcels</small></div>
      </div>

      <div className="adm-grid">
        <section className="panel span2">
          <div className="panel-head"><h2>Revenue per day</h2><span className="muted small">Hover a bar for the order count</span></div>
          <Bars data={days} format={money} />
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Needs attention</h2></div>
          <ul className="todo">
            <li><Link href="/admin/orders/?status=Pending"><b>{toConfirm.length}</b><span>COD orders to confirm by phone or WhatsApp</span></Link></li>
            <li><Link href="/admin/orders/?status=Confirmed"><b>{toBook.length}</b><span>Confirmed orders waiting for a courier</span></Link></li>
            <li className={rejected.length ? "warn" : ""}><Link href="/admin/orders/?status=Confirmed"><b>{rejected.length}</b><span>Bookings rejected by a courier</span></Link></li>
            <li className={low.length ? "warn" : ""}><Link href="/admin/inventory/"><b>{low.length}</b><span>Products running low on stock</span></Link></li>
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Best sellers</h2><span className="muted small">Units, bundles included</span></div>
          {top.map(({ p, n }) => (
            <div className="best" key={p.id}>
              <img src={asset(p.image)} alt="" style={{ objectPosition: p.focus }} />
              <div><b>{p.name}</b><div className="meter-track"><i style={{ width: `${(n / topMax) * 100}%` }} /></div></div>
              <span>{n}</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Couriers</h2><span className="muted small">{shipped.length} parcels</span></div>
          {courierCount.map(({ c, n }) => <Meter key={c.id} label={c.name} value={n} total={shipped.length} />)}
          <div className="panel-head" style={{ marginTop: 22 }}><h2>Payment mix</h2></div>
          <Meter label="Cash on Delivery" value={cod} total={recent.length} />
          <Meter label="Online (JazzCash, Easypaisa, card)" value={recent.length - cod} total={recent.length} />
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Stock</h2><Link className="ulink" href="/admin/inventory/">Manage</Link></div>
          {PRODUCTS.map((p) => {
            const n = S.stock(p.id);
            return <Meter key={p.id} label={p.name} value={n} total={60} note={n <= 0 ? "Sold out" : n <= 8 ? `${n} left · low` : `${n} in stock`} />;
          })}
        </section>

        <section className="panel span3">
          <div className="panel-head"><h2>Latest orders</h2><Link className="ulink" href="/admin/orders/">View all</Link></div>
          {orders.length === 0 ? <Empty>No orders yet.</Empty> : (
            <table className="tbl">
              <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="r">Total</th><th className="r"><span className="sr">Open</span></th></tr></thead>
              <tbody>
                {orders.slice(0, 7).map((o) => (
                  <tr key={o.id}>
                    <td><OrderLink o={o} />{!o.seed && <span className="chip new">New</span>}</td>
                    <td data-l="Customer">{o.customer.name}<br /><span className="muted small">{o.customer.city}</span></td>
                    <td data-l="Items">{o.lines.map((l) => `${lineInfo(l).name} × ${l.qty}`).join(", ")}</td>
                    <td data-l="Payment">{PAYMENTS.find((p) => p.id === o.payment)?.name}</td>
                    <td data-l="Status"><Status s={o.status} /></td>
                    <td className="r"><b>{money(o.total)}</b></td>
                    <td className="r"><ViewOrder o={o} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
