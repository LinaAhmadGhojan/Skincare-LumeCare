"use client";

import Link from "next/link";
import { LOYALTY, money } from "@/lib/data";
import { useStore } from "@/lib/store";
import { when } from "@/lib/ui";
import { orderItems } from "@/lib/orders";

export default function Account() {
  const S = useStore();
  const orders = S.myOrders(), points = S.points();
  return (
    <div className="wrap page">
      <div className="page-head">
        <span className="eyebrow">Signed in as a demo customer</span>
        <h1>My account</h1>
        <p>Customers can create an account to see their orders and points. Guest checkout stays available.</p>
      </div>
      <div className="cols">
        <div>
          <h2 className="step-title">My orders</h2>
          {orders.length === 0 && <p className="muted">No orders yet. <Link className="ulink" href="/shop/">Shop the collection</Link></p>}
          <div className="olist">
            {orders.map((o) => (
              <div key={o.id}>
                <div className="orow"><b style={{ fontWeight: 400 }}>{o.id}</b><span className={`pill ${o.status.toLowerCase()}`}>{o.status}</span></div>
                <div className="muted small">{when(o.at)} · {orderItems(o)}</div>
                <div className="orow"><span>{money(o.total)}</span><Link className="ulink" href={`/track/?q=${o.id}`}>Track</Link></div>
              </div>
            ))}
          </div>
        </div>
        <div className="summary">
          <span className="eyebrow">Loyalty points</span>
          <div className="points">{points}</div>
          <p className="muted">Worth {money(points * LOYALTY.pointValue)} at checkout.</p>
          <p className="muted small">
            Earn {LOYALTY.earnPer100} points for every Rs 100 spent. Points are added when an order is delivered.
          </p>
          <hr className="rule" />
          {S.pointsLog().map((x, i) => (
            <div className="sum" key={i}>
              <span>{x.text}{x.at > 0 && <><br /><small className="muted">{when(x.at)}</small></>}</span>
              <span className={x.pts > 0 ? "okc" : ""}>{x.pts > 0 ? "+" : ""}{x.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
