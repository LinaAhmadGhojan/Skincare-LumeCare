"use client";

import Link from "next/link";
import { Bundle, Product, asset, bundleSaving, money, product, productHref, bundleHref } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(full)}<i>{"★".repeat(5 - full)}</i>
    </span>
  );
}

export function Price({ p }: { p: Product }) {
  if (!p.sale) return <span className="price">{money(p.price)}</span>;
  return <span className="price"><span className="sale">{money(p.sale)}</span><s>{money(p.price)}</s></span>;
}

export function Stepper({ value, onChange, max, small }: { value: number; onChange: (n: number) => void; max?: number; small?: boolean }) {
  return (
    <span className={"stepper" + (small ? " sm" : "")}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1 && !small} aria-label="Decrease quantity">−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={max !== undefined && value >= max} aria-label="Increase quantity">+</button>
    </span>
  );
}

export function StockLine({ n, label }: { n: number; label?: string }) {
  if (n <= 0) return <span className="stock out">Sold out</span>;
  if (n <= 8) return <span className="stock low">Only {n} left</span>;
  return <span className="stock">{label ?? "In stock"}</span>;
}

export function ProductCard({ p }: { p: Product }) {
  const S = useStore();
  const out = S.stock(p.id) <= 0;
  const add = () => { if (S.add("product", p.id, 1)) ui.openCart(); else ui.toast("Not enough stock"); };
  return (
    <article className="pcard">
      <div className="pcard-img">
        <Link href={productHref(p.id)} aria-label={p.name}>
          <img src={asset(p.image)} alt={p.name} style={{ objectPosition: p.focus }} loading="lazy" />
        </Link>
        {out ? <span className="tag dark">Sold out</span> : p.sale ? <span className="tag">Offer</span> : null}
        <button className="pcard-add" onClick={add} disabled={out}>{out ? "Sold out" : "+ Add"}</button>
      </div>
      <div className="pcard-meta">
        <span className="eyebrow">{p.kind}</span>
        <h3><Link href={productHref(p.id)}>{p.name}</Link></h3>
        <div className="pcard-row"><Price p={p} /><span className="muted">{p.size}</span></div>
      </div>
    </article>
  );
}

export function Mosaic({ b }: { b: Bundle }) {
  return (
    <div className="mosaic">
      {b.items.map((it) => {
        const p = product(it.id);
        return <img key={p.id} src={asset(p.image)} alt={p.name} style={{ objectPosition: p.focus }} loading="lazy" />;
      })}
    </div>
  );
}

export function SetCard({ b }: { b: Bundle }) {
  const S = useStore();
  const out = S.bundleAvail(b.id).qty <= 0;
  return (
    <Link className="scard" href={bundleHref(b.id)}>
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <Mosaic b={b} />
        <span className={"tag" + (out ? " dark" : "")}>{out ? "Sold out" : `Save ${money(bundleSaving(b))}`}</span>
      </div>
      <div className="scard-meta">
        <div>
          <h3>{b.name}</h3>
          <span className="muted">{b.items.length} products · {b.steps.join(", ")}</span>
        </div>
        <span>{money(b.price)}</span>
      </div>
    </Link>
  );
}
