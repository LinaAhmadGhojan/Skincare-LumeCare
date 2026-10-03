"use client";

import Link from "next/link";
import { useState } from "react";
import { BUNDLES, Bundle, PRODUCTS, asset, bundleHref, bundleRegular, bundleSaving, isCustomBundle, money, product, unitPrice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Editor({ b, onClose }: { b?: Bundle; onClose: () => void }) {
  const S = useStore();
  const [name, setName] = useState(b?.name ?? "");
  const [short, setShort] = useState(b?.short ?? "");
  const [extra, setExtra] = useState(String(b?.extra ?? 5));
  const [qty, setQty] = useState<Record<string, number>>(() => Object.fromEntries((b?.items ?? []).map((it) => [it.id, it.qty])));

  const items = PRODUCTS.filter((p) => qty[p.id] > 0).map((p) => ({ id: p.id, qty: qty[p.id] }));
  const pct = Math.min(60, Math.max(0, Number(extra) || 0));
  const regular = items.reduce((a, it) => a + product(it.id).price * it.qty, 0);
  const sale = items.reduce((a, it) => a + unitPrice(product(it.id)) * it.qty, 0);
  const price = Math.ceil(sale * (1 - pct / 100));
  const step = (id: string, d: number) => setQty({ ...qty, [id]: Math.max(0, Math.min(5, (qty[id] || 0) + d)) });

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return ui.toast("Give the bundle a name");
    if (items.length < 2) return ui.toast("Pick at least two products");
    const fields = { name: name.trim(), short: short.trim() || `${items.length} products, priced together.`, extra: pct, items, steps: [] as string[] };
    if (b) {
      S.updateBundle(b.id, b.items.length === items.length && b.items.every((it, i) => it.id === items[i].id) ? { ...fields, steps: b.steps } : fields);
      ui.toast("Saved · the store shows the change now");
    } else {
      let id = slug(name) || "bundle";
      while (BUNDLES.some((x) => x.id === id)) id += "-2";
      S.addBundle({ id, ...fields, active: true });
      ui.toast(`${fields.name} created · it is live in the store`);
    }
    onClose();
  }

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="editor" onSubmit={save} role="dialog" aria-modal="true" aria-label={b ? "Edit bundle" : "Create bundle"}>
        <div className="panel-head"><h2>{b ? "Edit bundle" : "Create bundle"}</h2><button type="button" className="textbtn" onClick={onClose}>Close</button></div>
        <div className="editor-body">
          <label className="field"><span>Bundle name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Glow Pair" /></label>
          <label className="field"><span>Short description</span><input value={short} onChange={(e) => setShort(e.target.value)} placeholder="One line shown on the bundle page" /></label>
          <div className="field">
            <span>Products in the bundle</span>
            <div className="picker">
              {PRODUCTS.map((p) => {
                const n = qty[p.id] || 0;
                return (
                  <div className={"pick" + (n ? " on" : "")} key={p.id}>
                    <img src={asset(p.image)} alt="" style={{ objectPosition: p.focus }} />
                    <div><b>{p.name}</b><small>{p.size} · {money(unitPrice(p))}</small></div>
                    <span className="stepper sm">
                      <button type="button" onClick={() => step(p.id, -1)} disabled={!n} aria-label={`Remove one ${p.name}`}>−</button>
                      <span>{n}</span>
                      <button type="button" onClick={() => step(p.id, 1)} aria-label={`Add one ${p.name}`}>+</button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <label className="field"><span>Extra discount on top of the product sale prices (%)</span><input inputMode="numeric" value={extra} onChange={(e) => setExtra(e.target.value)} /></label>
          <div className="preview">
            <div className="sum"><span>Regular prices</span><span>{money(regular)}</span></div>
            <div className="sum"><span>With each product&apos;s sale price</span><span>{money(sale)}</span></div>
            <div className="sum"><span>Extra {pct}% off</span><span>− {money(Math.round(sale - price))}</span></div>
            <div className="sum total"><span>Bundle price</span><span>{money(price)}</span></div>
            {regular > 0 && <p className="muted small" style={{ margin: "8px 0 0" }}>Customers see: save {money(regular - price)} compared with buying separately.</p>}
          </div>
        </div>
        <div className="editor-foot">
          {b && S.bundleEdited(b.id) && <button type="button" className="textbtn" onClick={() => { S.resetBundle(b.id); ui.toast("Restored the original bundle"); onClose(); }}>Restore original</button>}
          <button className="btn sm">{b ? "Save changes" : "Create bundle"}</button>
        </div>
      </form>
    </div>
  );
}

export default function Bundles() {
  const S = useStore();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const open = editing && editing !== "new" ? BUNDLES.find((b) => b.id === editing) : undefined;

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">Products sold together at a lower price</span><h1>Bundles</h1></div>
        <button className="btn" onClick={() => setEditing("new")}>+ Create bundle</button>
      </header>

      <div className="pgrid">
        {BUNDLES.map((b) => {
          const av = S.bundleAvail(b.id), live = b.active !== false;
          return (
            <article className={"bcard" + (live ? "" : " paused")} key={b.id}>
              <div className="bcard-img">
                {b.items.map((it) => { const p = product(it.id); return <img key={it.id} src={asset(p.image)} alt={p.name} style={{ objectPosition: p.focus }} />; })}
                <span className={"chip " + (live ? "live" : "off")}>{live ? "Live in store" : "Paused"}</span>
                {isCustomBundle(b.id) ? <span className="chip edited">New</span> : S.bundleEdited(b.id) && <span className="chip edited">Edited</span>}
              </div>
              <div className="bcard-body">
                <div className="orow"><b>{b.name}</b><label className="switch" title={live ? "Pause in store" : "Show in store"}>
                  <input type="checkbox" checked={live} onChange={() => { S.updateBundle(b.id, { active: !live }); ui.toast(live ? `${b.name} paused` : `${b.name} is live`); }} aria-label={`${b.name} live in store`} /><i />
                </label></div>
                <p className="muted small" style={{ margin: 0 }}>{b.short}</p>
                {b.items.map((it) => (
                  <div className="comp" key={it.id}>
                    <span>{product(it.id).name} <span className="muted">× {it.qty}</span></span>
                    <span className={av.limiter === it.id ? "lim" : "muted"}>{S.stock(it.id)} in stock{av.limiter === it.id ? " · limits" : ""}</span>
                  </div>
                ))}
                <div className="mini-stats">
                  <div><small>Bundle price</small><b>{money(b.price)}</b><s>{money(bundleRegular(b))}</s></div>
                  <div><small>Customer saves</small><b>{money(bundleSaving(b))}</b></div>
                  <div><small>Can be sold</small><b className={av.qty <= 0 ? "out" : av.qty <= 8 ? "low" : ""}>{av.qty}</b></div>
                </div>
                <div className="acts" style={{ justifyContent: "flex-start" }}>
                  <button className="btn sm" onClick={() => setEditing(b.id)}>Edit bundle</button>
                  <Link className="btn sm ghost" href={bundleHref(b.id)} target="_blank">View in store</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editing === "new" && <Editor onClose={() => setEditing(null)} />}
      {open && <Editor key={open.id} b={open} onClose={() => setEditing(null)} />}
    </>
  );
}
