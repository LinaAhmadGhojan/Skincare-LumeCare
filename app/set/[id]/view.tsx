"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mosaic, Stepper } from "@/components/cards";
import { BUNDLES, asset, bundle, bundleSaving, money, product, productHref, bundleHref } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

export default function SetView({ id }: { id: string }) {
  const S = useStore(), router = useRouter();
  const b = bundle(id);
  const [qty, setQty] = useState(1);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    S.track("ViewContent", "view_item", { item: b.name, value: b.price, currency: "PKR" });
  }, [S, b]);

  const av = S.bundleAvail(b.id), out = av.qty <= 0;
  const add = (then?: () => void) => {
    if (!S.add("bundle", b.id, qty)) return ui.toast("Not enough stock for that quantity");
    if (then) then(); else ui.openCart();
  };
  const other = BUNDLES.find((x) => x.id !== b.id);

  return (
    <div className="wrap page">
      <div className="pdp">
        <div className="pdp-media"><Mosaic b={b} /></div>
        <div className="pdp-info">
          <span className="eyebrow">Routine set · {b.items.length} products</span>
          <h1>{b.name}</h1>
          <div className="pdp-price">
            <span className="price">{money(b.price)}<s>{money(b.price + bundleSaving(b))}</s></span>
            <span className="save">Extra {b.extra}% off · save {money(bundleSaving(b))}</span>
          </div>
          <p>{b.short}</p>
          {out ? <span className="stock out">Sold out</span>
            : <span className={"stock" + (av.qty <= 8 ? " low" : "")}>{av.qty} sets available</span>}
          <div className="buy">
            <Stepper value={qty} onChange={setQty} max={Math.max(1, av.qty)} />
            <button className="btn" onClick={() => add()} disabled={out}>{out ? "Sold out" : `Add bundle to bag · ${money(b.price * qty)}`}</button>
          </div>
          <button className="btn ghost block" onClick={() => add(() => router.push("/checkout/"))} disabled={out}>Buy now</button>

          <div className="inset">
            {b.items.map((it, i) => {
              const p = product(it.id), n = S.stock(it.id);
              return (
                <div className="inset-row" key={p.id}>
                  <Link href={productHref(p.id)}><img src={asset(p.image)} alt="" style={{ objectPosition: p.focus }} /></Link>
                  <div>
                    <span className="eyebrow" style={{ marginBottom: 2 }}>Step {i + 1} · {b.steps[i]}</span>
                    <h3><Link href={productHref(p.id)}>{p.name}</Link></h3>
                    <span className="muted small">{p.size} · × {it.qty}</span>
                  </div>
                  <div className="n">
                    <div className={n <= 0 ? "out" : n <= 8 ? "low" : ""}>{n} in stock</div>
                    {av.limiter === p.id && <span className="chip note">Limits the set</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="note">
            A set has no stock of its own. Selling one set reduces the stock of every product inside it, and the set stops
            selling when any product runs out. Change the stock in the <Link href="/admin/">admin preview</Link> to see it.
          </p>
          {other && (
            <Link className="set-link" href={bundleHref(other.id)}>
              <span><b>{other.name}</b><small>{money(other.price)} · save {money(bundleSaving(other))}</small></span>
              <span className="ulink">View set</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
