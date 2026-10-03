"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { money } from "@/lib/data";
import { orderItems, payLabel } from "@/lib/orders";
import { useStore } from "@/lib/store";

function Confirmation() {
  const S = useStore();
  const id = useSearchParams().get("id") ?? "";
  const o = S.order(id);

  useEffect(() => { if (o) S.firePurchaseOnce(o); }, [S, o]);

  if (!o) {
    return (
      <div className="wrap page empty">
        <span className="eyebrow">Order</span>
        <h2>We could not find this order.</h2>
        <Link className="btn" href="/shop/">Shop the collection</Link>
      </div>
    );
  }
  return (
    <div className="wrap page">
      <div className="narrow center">
        <span className="eyebrow">Order {o.id}</span>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 300 }}>Thank you, {o.customer.name.split(" ")[0]}.</h1>
        <p className="muted" style={{ marginTop: 18 }}>
          {o.payment === "cod" ? "We will call you to confirm the order before it ships." : "Your payment was received. We will ship your order soon."}
        </p>
        <div className="receipt">
          <div className="sum"><span>Items</span><span style={{ whiteSpace: "normal" }}>{orderItems(o)}</span></div>
          <div className="sum"><span>Payment</span><span>{payLabel(o)}</span></div>
          <div className="sum"><span>Deliver to</span><span>{o.customer.city}</span></div>
          {o.codeDiscount > 0 && <div className="sum ok"><span>Code {o.code}</span><span>− {money(o.codeDiscount)}</span></div>}
          {o.discount > 0 && <div className="sum ok"><span>Points used</span><span>− {money(o.discount)}</span></div>}
          <div className="sum total"><span>Total</span><span>{money(o.total)}</span></div>
        </div>
        <div className="actions">
          <Link className="btn" href={`/track/?q=${o.id}`}>Track this order</Link>
          <Link className="btn ghost" href={`/invoice/?id=${o.id}`}>Download invoice</Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><Confirmation /></Suspense>;
}
