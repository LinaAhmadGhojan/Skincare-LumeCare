"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Barcode } from "@/components/barcode";
import { BRAND, money, product } from "@/lib/data";
import { components, lineInfo, useStore } from "@/lib/store";
import { when } from "@/lib/ui";

function Label() {
  const S = useStore();
  const o = S.order(useSearchParams().get("id") ?? "");
  if (!o || !o.shipment) {
    return <div className="adm-empty">No booked shipment for this order. <Link className="ulink" href="/admin/orders/">Back to orders</Link></div>;
  }
  const units = o.lines.reduce((a, l) => a + components(l).reduce((b, c) => b + c.qty, 0) * l.qty, 0);
  const grams = o.lines.reduce((a, l) => a + components(l).reduce((b, c) => b + product(c.id).weight * c.qty, 0) * l.qty, 0) + 120;
  const cod = o.payment === "cod" && !o.paid ? o.total : 0;

  return (
    <>
      <header className="adm-head no-print">
        <div>
          <Link className="back" href={`/admin/orders/?id=${o.id}`}>← {o.id}</Link>
          <h1>Shipping label</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>4 × 6 inch label. Print it and stick it on the parcel.</p>
        </div>
        <button className="btn sm" onClick={() => window.print()}>Print label</button>
      </header>

      <div className="label-sheet">
        <article className="label">
          <div className="label-top">
            <b className="label-courier">{o.shipment.courier}</b>
            <span>{cod ? <>COD<strong>{money(cod)}</strong></> : <>PREPAID<strong>Rs 0</strong></>}</span>
          </div>
          <div className="label-code">
            <Barcode value={o.shipment.tracking} height={70} />
            <span>{o.shipment.tracking}</span>
          </div>
          <div className="label-grid">
            <div className="label-to">
              <small>Deliver to</small>
              <b>{o.customer.name}</b>
              <span>{o.customer.address}</span>
              <span className="label-city">{o.customer.city.toUpperCase()}</span>
              <span>{o.customer.phone}</span>
            </div>
            <div className="label-from">
              <small>From</small>
              <b>{BRAND}</b>
              <span>OneWorld, Block A, Pasrur Road</span>
              <span>Daska, Pakistan</span>
            </div>
          </div>
          <div className="label-meta">
            <div><small>Order</small><b>{o.id}</b></div>
            <div><small>Pieces</small><b>{units}</b></div>
            <div><small>Weight</small><b>{(grams / 1000).toFixed(2)} kg</b></div>
            <div><small>Booked</small><b>{when(o.shipment.events[0].at)}</b></div>
          </div>
          <div className="label-items">
            <small>Contents</small>
            <span>{o.lines.map((l) => `${lineInfo(l).name} × ${l.qty}`).join(", ")}</span>
          </div>
          <div className="label-order">
            <Barcode value={o.id} height={36} />
            <span>{o.id} · {cod ? "Collect cash on delivery" : "Paid online, do not collect cash"}</span>
          </div>
        </article>
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense><Label /></Suspense>;
}
