"use client";

import { useState } from "react";
import { Empty } from "@/components/admin";
import { BUNDLES, PRODUCTS, SUPPLIERS, asset, money, product, unitPrice } from "@/lib/data";
import { components, isRevenue, useStore } from "@/lib/store";
import { ui, when } from "@/lib/ui";

function Receive() {
  const S = useStore();
  const [f, setF] = useState({ supplier: SUPPLIERS[0], product: PRODUCTS[0].id, qty: "48", cost: "300", batch: "", expiry: "2028-12" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const receipts = S.receipts();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Math.floor(Number(f.qty));
    if (!qty || qty < 1) return ui.toast("Enter how many units arrived");
    const batch = f.batch.trim() || `${product(f.product).sku.split("-")[1]}-${new Date().toISOString().slice(2, 7).replace("-", "")}-${String.fromCharCode(65 + receipts.length % 26)}`;
    const id = S.receive({ supplier: f.supplier, product: f.product, qty, cost: Number(f.cost) || 0, batch, expiry: f.expiry });
    ui.toast(`${id} received · +${qty} ${product(f.product).name}`);
    setF({ ...f, batch: "" });
  }

  return (
    <div className="adm-grid" style={{ marginTop: 18 }}>
      <section className="panel">
        <div className="panel-head"><h2>Receive stock</h2><span className="muted small">Goods received note</span></div>
        <form onSubmit={submit}>
          <label className="field"><span>Supplier</span><select value={f.supplier} onChange={set("supplier")}>{SUPPLIERS.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label className="field"><span>Product</span><select value={f.product} onChange={set("product")}>{PRODUCTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <div className="row2">
            <label className="field"><span>Units received</span><input inputMode="numeric" value={f.qty} onChange={set("qty")} /></label>
            <label className="field"><span>Cost per unit (Rs)</span><input inputMode="numeric" value={f.cost} onChange={set("cost")} /></label>
          </div>
          <div className="row2">
            <label className="field"><span>Batch number</span><input value={f.batch} onChange={set("batch")} placeholder="Auto" /></label>
            <label className="field"><span>Expiry</span><input type="month" value={f.expiry} onChange={set("expiry")} /></label>
          </div>
          <button className="btn block">Receive into stock</button>
        </form>
      </section>
      <section className="panel flush span2">
        <div className="panel-head" style={{ padding: "22px 22px 0" }}><h2>Recent receipts</h2><span className="muted small">Batch and expiry kept for every delivery</span></div>
        <table className="tbl">
          <thead><tr><th>Receipt</th><th>Product</th><th>Units</th><th>Cost</th><th>Batch · expiry</th></tr></thead>
          <tbody>
            {receipts.slice(0, 8).map((r) => (
              <tr key={r.id}>
                <td className="nowrap"><b>{r.id}</b><br /><span className="muted small">{when(r.at)}</span></td>
                <td data-l="Product">{product(r.product).name}<br /><span className="muted small">{r.supplier}</span></td>
                <td data-l="Units"><b className="okc">+{r.qty}</b></td>
                <td data-l="Cost">{money(r.qty * r.cost)}<br /><span className="muted small">{money(r.cost)} each</span></td>
                <td data-l="Batch · expiry"><span className="code">{r.batch}</span><br /><span className="muted small">Expires {r.expiry}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default function Inventory() {
  const S = useStore();
  const since = Date.now() - 14 * 86400000;
  const sold: Record<string, number> = {};
  S.orders().filter((o) => o.at >= since && isRevenue(o)).forEach((o) =>
    o.lines.forEach((l) => components(l).forEach((c) => { sold[c.id] = (sold[c.id] || 0) + c.qty * l.qty; })));
  const log = S.stockLog();

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">Stock is tracked per product</span><h1>Inventory</h1></div>
      </header>

      <section className="panel flush">
        <table className="tbl">
          <thead><tr><th>Product</th><th>Price</th><th>In stock</th><th>Sold · 14 days</th><th>Used in bundles</th><th className="r">Adjust</th></tr></thead>
          <tbody>
            {PRODUCTS.map((p) => {
              const n = S.stock(p.id);
              const sets = BUNDLES.filter((b) => b.items.some((it) => it.id === p.id));
              return (
                <tr key={p.id}>
                  <td><div className="prow"><img src={asset(p.image)} alt="" style={{ objectPosition: p.focus }} /><span><b>{p.name}</b><br /><span className="muted small">{p.size} · {p.kind}</span></span></div></td>
                  <td data-l="Price">{money(unitPrice(p))}<br /><s className="muted small">{money(p.price)}</s></td>
                  <td data-l="In stock"><span className={`stockpill ${n <= 0 ? "out" : n <= 8 ? "low" : ""}`}>{n <= 0 ? "Sold out" : `${n} units`}</span></td>
                  <td data-l="Sold · 14 days">{sold[p.id] || 0}</td>
                  <td data-l="Used in bundles">{sets.map((b) => <span className="chip" key={b.id}>{b.name}</span>)}</td>
                  <td className="r">
                    <div className="acts">
                      <button className="btn sm ghost" onClick={() => S.adjust(p.id, -1)} disabled={n <= 0} aria-label={`Remove one ${p.name}`}>−1</button>
                      <button className="btn sm ghost" onClick={() => S.adjust(p.id, 1)} aria-label={`Add one ${p.name}`}>+1</button>
                      
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <Receive />

      <div className="adm-grid" style={{ marginTop: 18 }}>
        {BUNDLES.map((b) => {
          const av = S.bundleAvail(b.id);
          return (
            <section className="panel" key={b.id}>
              <div className="panel-head"><h2>{b.name}</h2><span className={`stockpill ${av.qty <= 0 ? "out" : av.qty <= 8 ? "low" : ""}`}>{av.qty <= 0 ? "Sold out" : `${av.qty} can be sold`}</span></div>
              <p className="muted small" style={{ marginTop: -6 }}>No stock of its own. Limited by {product(av.limiter).name}.</p>
              {b.items.map((it) => {
                const p = product(it.id), n = S.stock(it.id);
                return (
                  <div className="comp" key={it.id}>
                    <span>{p.name} <span className="muted">× {it.qty}</span></span>
                    <span className={av.limiter === it.id ? "lim" : "muted"}>{n} in stock{av.limiter === it.id ? " · limits the bundle" : ""}</span>
                  </div>
                );
              })}
            </section>
          );
        })}
        <section className="panel">
          <div className="panel-head"><h2>How it works</h2></div>
          <ul className="dash small">
            <li>Selling a bundle takes one of each product out of stock.</li>
            <li>Cancelled and returned orders put every product back.</li>
            <li>A bundle stops selling the moment one of its products runs out.</li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head"><h2>Stock movements</h2><span className="muted small">Every change is logged with its reason</span></div>
        {log.length === 0 ? <Empty>No movements yet. Place an order in the store or adjust stock above.</Empty> : (
          <table className="tbl plain">
            <thead><tr><th>When</th><th>Product</th><th>Change</th><th>Reason</th></tr></thead>
            <tbody>
              {log.slice(0, 14).map((m, i) => (
                <tr key={i}>
                  <td className="muted">{when(m.at)}</td>
                  <td data-l="Product">{product(m.product).name}</td>
                  <td data-l="Change"><b className={m.delta > 0 ? "okc" : "out"}>{m.delta > 0 ? `+${m.delta}` : m.delta}</b></td>
                  <td data-l="Reason">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
