"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Empty, OrderActions, OrderLink, STATUSES, Status, ViewOrder, waLink } from "@/components/admin";
import { BRAND, PAYMENTS, asset, money, product } from "@/lib/data";
import { Order, OrderStatus, lineInfo, linePrice, useStore } from "@/lib/store";
import { when } from "@/lib/ui";

const payName = (id: string) => PAYMENTS.find((p) => p.id === id)?.name ?? id;

function Detail({ o }: { o: Order }) {
  const S = useStore();
  const [note, setNote] = useState("");
  const payState = o.status === "Cancelled" ? "Not charged" : o.status === "Returned" && o.payment === "cod" ? "Not collected (returned)"
    : o.paid ? "Paid" : o.payment === "cod" ? "To collect on delivery" : "Awaiting gateway";

  return (
    <>
      <div className="print-only invoice-head">
        <b>{BRAND}</b><span>Invoice {o.id} · {when(o.at)}</span>
      </div>
      <header className="adm-head">
        <div>
          <Link className="back no-print" href="/admin/orders/">← Orders</Link>
          <h1 style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>{o.id} <Status s={o.status} /></h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>Placed {when(o.at)} · {payName(o.payment)}{o.seed ? " · sample order" : ""}</p>
        </div>
        <div className="acts no-print">
          {o.shipment && <Link className="btn sm" href={`/admin/label/?id=${o.id}`}>Shipping label</Link>}
          <Link className="btn sm ghost" href={`/invoice/?id=${o.id}`}>Invoice</Link>
        </div>
      </header>

      {o.bookingError && <p className="alert no-print">{o.bookingError}</p>}
      <div className="panel no-print next-step">
        <div><b>Next step</b><span className="muted small">
          {o.status === "Pending" ? "Confirm the order with the customer before booking a courier."
            : o.status === "Confirmed" ? "Choose a courier and book the shipment. The tracking number comes back automatically."
            : o.status === "Shipped" ? "The courier is moving the parcel. Status updates arrive on their own in the live system."
            : "Nothing to do. This order is closed."}
        </span></div>
        <OrderActions o={o} />
      </div>

      <div className="adm-grid detail">
        <section className="panel span2">
          <div className="panel-head"><h2>Items</h2></div>
          {o.lines.map((l) => {
            const x = lineInfo(l);
            return (
              <div className="oline" key={l.type + l.id}>
                <img src={asset(x.image)} alt="" style={{ objectPosition: x.focus }} />
                <div>
                  <b>{x.name}</b>
                  <span className="muted small">{l.type === "bundle" ? `Bundle · ${x.sub}` : x.sub}</span>
                </div>
                <span className="muted">× {l.qty}</span>
                <b>{money(linePrice(l) * l.qty)}</b>
              </div>
            );
          })}
          <div className="sums">
            <div className="sum"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
            {o.codeDiscount > 0 && <div className="sum ok"><span>Code {o.code}</span><span>− {money(o.codeDiscount)}</span></div>}
            {o.discount > 0 && <div className="sum ok"><span>Loyalty points ({o.pointsUsed})</span><span>− {money(o.discount)}</span></div>}
            <div className="sum"><span>Shipping</span><span>{o.shipping ? money(o.shipping) : "Free"}</span></div>
            <div className="sum total"><span>Total</span><span>{money(o.total)}</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Customer</h2></div>
          <p style={{ margin: 0 }}><b>{o.customer.name}</b></p>
          <p className="muted" style={{ margin: "4px 0 0" }}>{o.customer.phone}{o.customer.email ? ` · ${o.customer.email}` : ""}</p>
          <p className="muted" style={{ margin: "4px 0 14px" }}>{o.customer.address}, {o.customer.city}</p>
          <a className="btn sm ghost no-print" href={waLink(o)} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
          <div className="panel-head" style={{ marginTop: 24 }}><h2>Payment</h2></div>
          <div className="sum"><span className="muted">Method</span><span>{payName(o.payment)}</span></div>
          <div className="sum"><span className="muted">Status</span><span>{payState}</span></div>
        </section>

        <section className="panel span2">
          <div className="panel-head"><h2>Shipment</h2>{o.shipment && <span className="muted small">{o.shipment.courier} · {o.shipment.tracking}</span>}</div>
          {o.shipment ? (
            <ol className="timeline">
              {[...o.shipment.events].reverse().map((e, i) => (
                <li key={e.label} className={i === 0 ? "now" : ""}><b>{e.label}</b><span>{when(e.at)}</span></li>
              ))}
            </ol>
          ) : <p className="muted" style={{ margin: 0 }}>Not booked yet.</p>}
        </section>

        <section className="panel no-print">
          <div className="panel-head"><h2>Internal notes</h2></div>
          {(o.notes || []).map((n, i) => <p className="note-item" key={i}>{n}</p>)}
          <form className="note-form" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { S.addNote(o.id, note.trim()); setNote(""); } }}>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer asked for evening delivery" />
            <button className="btn sm">Add</button>
          </form>
        </section>
      </div>
    </>
  );
}

function Orders() {
  const S = useStore(), router = useRouter(), params = useSearchParams();
  const id = params.get("id"), status = (params.get("status") || "All") as OrderStatus | "All";
  const [q, setQ] = useState("");
  const orders = S.orders();

  const open = id ? S.order(id) : undefined;
  if (open) return <Detail o={open} />;

  const counts = Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]));
  const s = q.trim().toLowerCase();
  const list = orders.filter((o) => (status === "All" || o.status === status) && (!s || [o.id, o.customer.name, o.customer.phone, o.customer.city, o.shipment?.tracking ?? ""].some((v) => v.toLowerCase().includes(s))));
  const setStatus = (v: string) => router.push(v === "All" ? "/admin/orders/" : `/admin/orders/?status=${v}`);

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">{orders.length} orders</span><h1>Orders</h1></div>
        <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, name, phone, city or tracking" aria-label="Search orders" />
      </header>
      <div className="tabs">
        {(["All", ...STATUSES] as const).map((t) => (
          <button key={t} aria-selected={status === t} onClick={() => setStatus(t)}>
            {t === "Pending" ? "To confirm" : t} <em>{t === "All" ? orders.length : counts[t]}</em>
          </button>
        ))}
      </div>
      <section className="panel flush">
        {list.length === 0 ? <Empty>No orders match.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="r">Total</th><th className="r">Action</th><th className="r"><span className="sr">Open</span></th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="rowlink" onClick={(e) => { if (!(e.target as HTMLElement).closest("a,button,select")) router.push(`/admin/orders/?id=${o.id}`); }}>
                  <td className="nowrap"><OrderLink o={o} />{!o.seed && <span className="chip new">New</span>}<br /><span className="muted small">{when(o.at)}</span></td>
                  <td data-l="Customer">{o.customer.name}<br /><span className="muted small">{o.customer.phone} · {o.customer.city}</span></td>
                  <td data-l="Items">{o.lines.map((l) => `${l.type === "bundle" ? lineInfo(l).name : product(l.id).name} × ${l.qty}`).join(", ")}</td>
                  <td data-l="Payment">{payName(o.payment)}<br /><span className="muted small">{o.code ? `Code ${o.code}` : o.paid ? "Paid" : "COD"}</span></td>
                  <td data-l="Status"><Status s={o.status} />{o.bookingError && <div className="err">Booking rejected</div>}{o.shipment && <div className="muted small">{o.shipment.courier}</div>}</td>
                  <td className="r"><b>{money(o.total)}</b></td>
                  <td className="r"><OrderActions o={o} compact /></td>
                  <td className="r"><ViewOrder o={o} docs /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense><Orders /></Suspense>;
}
