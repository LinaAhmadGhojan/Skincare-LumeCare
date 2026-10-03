"use client";

import Link from "next/link";
import { Stepper } from "@/components/cards";
import { SHIPPING, asset, money } from "@/lib/data";
import { lineInfo, linePrice, useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

export default function Cart() {
  const S = useStore();
  const lines = S.cart(), t = S.totals(false);

  if (!lines.length) {
    return (
      <div className="wrap page empty">
        <span className="eyebrow">Your bag</span>
        <h2>Your bag is empty.</h2>
        <Link className="btn" href="/shop/">Shop the collection</Link>
      </div>
    );
  }
  return (
    <div className="wrap page">
      <div className="page-head"><h1>Your bag</h1></div>
      {!S.cartFits() && <p className="alert">Some items are no longer available in this quantity. Please reduce the quantity.</p>}
      <div className="cols">
        <div>
          {lines.map((l, i) => {
            const x = lineInfo(l);
            return (
              <div className="line" key={l.type + l.id}>
                <Link href={x.href}><img src={asset(x.image)} alt="" style={{ objectPosition: x.focus }} /></Link>
                <div>
                  <h3><Link href={x.href}>{x.name}</Link></h3>
                  <div className="sub">{x.sub}</div>
                  <Stepper small value={l.qty} onChange={(q) => { if (!S.setQty(i, q)) ui.toast("No more stock available"); }} />
                </div>
                <div className="line-end">
                  <span>{money(linePrice(l) * l.qty)}</span>
                  <button className="textbtn" onClick={() => S.setQty(i, 0)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="summary">
          <h2>Summary</h2>
          <div className="sum"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
          <div className="sum"><span>Shipping</span><span>{t.shipping ? money(t.shipping) : "Free"}</span></div>
          <div className="sum total"><span>Total</span><span>{money(t.total)}</span></div>
          {t.shipping > 0 && <p className="muted small" style={{ marginTop: 10 }}>Add {money(SHIPPING.freeOver - t.subtotal)} more for free shipping.</p>}
          <Link className="btn block" href="/checkout/" style={{ marginTop: 18 }}>Checkout</Link>
        </div>
      </div>
    </div>
  );
}
