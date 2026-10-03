"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BUNDLES, CATEGORIES, liveBundles, PRODUCTS, Product, asset, bundleSaving, money, productHref, rating, bundleHref } from "@/lib/data";
import { components, isRevenue, useStore } from "@/lib/store";
import { ui } from "@/lib/ui";
import { Mosaic, SetCard, Stars } from "./cards";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "best", label: "Best selling" },
  { id: "rating", label: "Top rated" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
] as const;
type Sort = (typeof SORTS)[number]["id"];

const price = (p: Product) => p.sale ?? p.price;

function ShopCard({ p, badge }: { p: Product; badge?: string }) {
  const S = useStore();
  const out = S.stock(p.id) <= 0;
  const add = () => { if (S.add("product", p.id, 1)) ui.openCart(); else ui.toast("Not enough stock"); };
  return (
    <article className="scard2">
      <Link className="scard2-img" href={productHref(p.id)} aria-label={p.name}>
        <img src={asset(p.image)} alt={p.name} style={{ objectPosition: p.focus }} loading="lazy" />
        {out ? <span className="tag dark">Sold out</span> : badge ? <span className="tag">{badge}</span> : null}
      </Link>
      <div className="scard2-body">
        <h3><Link href={productHref(p.id)}>{p.name}</Link></h3>
        <p className="scard2-sub">{p.short}</p>
        <div className="scard2-rate">
          {p.reviews.length ? <><Stars value={rating(p)} /><span>{rating(p).toFixed(1)} ({p.reviews.length})</span></> : <span>New · no reviews yet</span>}
          <span className="scard2-size">{p.size}</span>
        </div>
        <div className="scard2-foot">
          <span className="price">
            {p.sale ? <><span className="sale">{money(p.sale)}</span><s>{money(p.price)}</s></> : money(p.price)}
          </span>
          <button className="add" onClick={add} disabled={out} aria-label={`Add ${p.name} to bag`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
            {out ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ShopView() {
  const S = useStore();
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<Sort>("featured");

  // Units sold in the last 14 days, bundles counted through their products.
  const units = useMemo(() => {
    const since = Date.now() - 14 * 86400000, u: Record<string, number> = {};
    S.orders().filter((o) => o.at >= since && isRevenue(o)).forEach((o) =>
      o.lines.forEach((l) => components(l).forEach((c) => { u[c.id] = (u[c.id] || 0) + c.qty * l.qty; })));
    return u;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S.orders()]);
  const top = [...PRODUCTS].sort((a, b) => (units[b.id] || 0) - (units[a.id] || 0))[0]?.id;

  const badge = (p: Product) =>
    p.id === top && (units[p.id] || 0) > 0 ? "Bestseller"
    : p.sale ? `${Math.round((1 - p.sale / p.price) * 100)}% off`
    : p.reviews.length === 0 ? "New" : undefined;

  const showProducts = cat !== "Bundles";
  const showBundles = cat === "All" || cat === "Bundles";
  const list = PRODUCTS.filter((p) => cat === "All" || cat === "Bundles" || p.category === cat);
  const sorted = [...list].sort((a, b) =>
    sort === "low" ? price(a) - price(b) : sort === "high" ? price(b) - price(a)
    : sort === "rating" ? rating(b) - rating(a) : sort === "best" ? (units[b.id] || 0) - (units[a.id] || 0) : 0);
  const tabs = ["All", ...CATEGORIES, "Bundles"];
  const count = (c: string) => (c === "All" ? PRODUCTS.length : c === "Bundles" ? liveBundles().length : PRODUCTS.filter((p) => p.category === c).length);
  const first = liveBundles()[0];

  return (
    <div className="wrap page">
      <div className="page-head">
        <span className="eyebrow">{PRODUCTS.length} products · {liveBundles().length} bundles</span>
        <h1>The collection</h1>
        <p>Everything we make. Each product can be bought on its own or as part of a bundle.</p>
      </div>

      <div className="shop-bar">
        <div className="chips-row" role="tablist" aria-label="Categories">
          {tabs.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={"fchip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>
              {c}<em>{count(c)}</em>
            </button>
          ))}
        </div>
        {showProducts && (
          <label className="sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort products">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        )}
      </div>

      {showProducts && (
        <>
          <p className="shop-count" aria-live="polite">{sorted.length} {sorted.length === 1 ? "product" : "products"}{cat !== "All" ? ` in ${cat}` : ""}</p>
          {sorted.length === 0
            ? <p className="muted">No products in this category yet.</p>
            : <div className="grid shop-grid">{sorted.map((p) => <ShopCard key={p.id} p={p} badge={badge(p)} />)}</div>}
        </>
      )}

      {cat === "All" && first && (
        <Link className="routine-banner" href={bundleHref(first.id)}>
          <div>
            <span className="eyebrow">Build your routine</span>
            <h2>Start with one product or save with a complete bundle.</h2>
            <p>{first.name}: {first.items.length} products, save {money(bundleSaving(first))}.</p>
            <span className="btn sm ghost">Explore the bundles →</span>
          </div>
          <div className="routine-art"><Mosaic b={first} /></div>
        </Link>
      )}

      {showBundles && (
        <>
          <div className="sec-head" style={{ marginTop: cat === "Bundles" ? 0 : 64 }}>
            <h2>Bundles</h2>
            <span className="muted">Bought together, priced lower.</span>
          </div>
          <div className="sets">{liveBundles().map((b) => <SetCard key={b.id} b={b} />)}</div>
        </>
      )}
    </div>
  );
}
