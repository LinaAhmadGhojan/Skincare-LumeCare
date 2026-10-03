"use client";

import Link from "next/link";
import { PRODUCTS, asset, liveBundles, money, productHref } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard, SetCard } from "./cards";

export function ProductGrid() {
  useStore();
  return <div className="grid">{PRODUCTS.map((p) => <ProductCard key={p.id} p={p} />)}</div>;
}

export function QuickRow() {
  useStore();
  return (
    <div className="wrap quick" aria-label="Products">
      {PRODUCTS.slice(0, 4).map((p) => (
        <Link className="quick-item" href={productHref(p.id)} key={p.id}>
          <img src={asset(p.image)} alt="" style={{ objectPosition: p.focus }} />
          <span><b>{p.name}</b><small>{p.kind} · {money(p.sale ?? p.price)}</small></span>
        </Link>
      ))}
    </div>
  );
}

export function Count() {
  useStore();
  return <>{PRODUCTS.length}</>;
}

export function BundleGrid() {
  useStore();
  return <div className="sets">{liveBundles().map((b) => <SetCard key={b.id} b={b} />)}</div>;
}
