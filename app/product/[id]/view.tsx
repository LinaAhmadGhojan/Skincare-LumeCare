"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Price, Stars, Stepper, StockLine } from "@/components/cards";
import { BUNDLES, asset, bundleSaving, money, product, rating, unitPrice, bundleHref } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

export default function ProductView({ id }: { id: string }) {
  const S = useStore(), router = useRouter();
  const p = product(id);
  const [qty, setQty] = useState(1);
  const [reviewSent, setReviewSent] = useState(false);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    S.track("ViewContent", "view_item", { item: p.name, value: unitPrice(p), currency: "PKR" });
  }, [S, p]);

  const n = S.stock(p.id), out = n <= 0;
  const sets = BUNDLES.filter((b) => b.items.some((it) => it.id === p.id));
  const add = (then?: () => void) => {
    if (!S.add("product", p.id, qty)) return ui.toast("Not enough stock for that quantity");
    if (then) then(); else ui.openCart();
  };

  return (
    <div className="wrap page">
      <div className="pdp">
        <div className="pdp-media">
          <div className="main"><img src={asset(p.image)} alt={p.name} style={{ objectPosition: p.focus }} /></div>
        </div>
        <div className="pdp-info">
          <span className="eyebrow">{p.kind} · {p.size}</span>
          <h1>{p.name}</h1>
          <div className="pdp-rating">{p.reviews.length ? <><Stars value={rating(p)} /><span>{rating(p).toFixed(1)} · {p.reviews.length} reviews</span></> : <span>New · no reviews yet</span>}</div>
          <div className="pdp-price">
            <Price p={p} />
            {p.sale && <span className="save">Save {Math.round((1 - p.sale / p.price) * 100)}%</span>}
          </div>
          <p>{p.short}</p>
          <ul className="dash">{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
          <StockLine n={n} />
          <div className="buy">
            <Stepper value={qty} onChange={setQty} max={Math.max(1, n)} />
            <button className="btn" onClick={() => add()} disabled={out}>{out ? "Sold out" : `Add to bag · ${money(unitPrice(p) * qty)}`}</button>
          </div>
          <button className="btn ghost block" onClick={() => add(() => router.push("/checkout/"))} disabled={out}>Buy now</button>

          {sets.map((b) => (
            <Link className="set-link" href={bundleHref(b.id)} key={b.id}>
              <span><b>Part of {b.name}</b><small>Buy the set and save {money(bundleSaving(b))}</small></span>
              <span className="ulink">View set</span>
            </Link>
          ))}

          <div className="acc">
            <details open>
              <summary>Key ingredients</summary>
              <div className="chips">{p.actives.map((a) => <span className="chip" key={a}>{a}</span>)}</div>
            </details>
            <details><summary>Full ingredients list</summary><div>{p.ingredients}</div></details>
            <details><summary>How to use</summary><div>{p.usage}</div></details>
            <details><summary>Precautions</summary><div>{p.precautions}</div></details>
            <details><summary>Delivery and payment</summary><div>Delivered across Pakistan by tracked courier. Pay by Cash on Delivery, JazzCash, Easypaisa or card.</div></details>
          </div>
        </div>
      </div>

      <div className="sticky-buy">
        <span><b>{p.name}</b><small>{money(unitPrice(p))}</small></span>
        <button className="btn sm" onClick={() => add()} disabled={out}>{out ? "Sold out" : "Add to bag"}</button>
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="reviews">
          <div>
            <span className="eyebrow">Customer reviews</span>
            <div className="rev-score">{rating(p).toFixed(1)}</div>
            <Stars value={rating(p)} />
            <p className="muted small" style={{ marginTop: 8 }}>Based on {p.reviews.length} reviews</p>
            <form className="rev-form" onSubmit={(e) => { e.preventDefault(); e.currentTarget.reset(); setReviewSent(true); }}>
              <label className="field"><span>Your name</span><input name="name" required /></label>
              <label className="field"><span>Rating</span>
                <select name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((r) => <option key={r}>{r}</option>)}</select>
              </label>
              <label className="field"><span>Review</span><textarea name="text" rows={3} required /></label>
              <button className="btn ghost sm">Submit review</button>
              <p className="muted small" style={{ marginTop: 12 }}>
                {reviewSent ? "Thank you. Your review will appear after admin approval." : "Reviews are published after admin approval."}
              </p>
            </form>
          </div>
          <div>
            {p.reviews.map((r) => (
              <div className="review" key={r.name}>
                <div className="review-head">
                  <span><Stars value={r.rating} /> &nbsp;{r.name}{r.verified && <span className="verified">Verified buyer</span>}</span>
                  <span className="muted">{r.date}</span>
                </div>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
