"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChipInput, resizeImage } from "@/components/admin";
import { BUNDLES, CATEGORIES, PRODUCTS, Product, asset, isCustom, money, productHref, unitPrice } from "@/lib/data";
import { components, isRevenue, useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Draft = {
  name: string; kind: string; size: string; category: string; price: string; sale: string; stock: string; short: string;
  image: string; actives: string[]; ingredients: string[]; usage: string; precautions: string;
};

function draftOf(p?: Product): Draft {
  return p
    ? { name: p.name, kind: p.kind, size: p.size, category: p.category, price: String(p.price), sale: String(p.sale ?? ""), stock: "", short: p.short,
        image: p.image, actives: [...p.actives], ingredients: list(p.ingredients), usage: p.usage, precautions: p.precautions }
    : { name: "", kind: "Serum", size: "30 ml", category: CATEGORIES[0], price: "", sale: "", stock: "24", short: "",
        image: "", actives: [], ingredients: [], usage: "", precautions: "For external use only. Patch test before first use and stop if irritation occurs." };
}

function Editor({ p, onClose }: { p?: Product; onClose: () => void }) {
  const S = useStore();
  const [f, setF] = useState<Draft>(() => draftOf(p));
  const file = useRef<HTMLInputElement>(null);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try { setF({ ...f, image: await resizeImage(file) }); }
    catch { ui.toast("That file is not a picture"); }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(f.price), sale = f.sale ? Number(f.sale) : undefined;
    if (!f.name.trim()) return ui.toast("Give the product a name");
    if (!price || price < 1) return ui.toast("Enter the regular price");
    if (sale && sale >= price) return ui.toast("Sale price must be lower than the regular price");
    if (!p && !f.image) return ui.toast("Add a product picture");

    const fields = {
      name: f.name.trim(), kind: f.kind.trim() || "Skincare", size: f.size.trim(), category: f.category, price, sale, short: f.short.trim(),
      image: f.image, actives: f.actives, ingredients: f.ingredients.join(", "), usage: f.usage.trim(), precautions: f.precautions.trim(),
    };
    if (p) {
      S.updateProduct(p.id, fields);
      ui.toast("Saved · the store shows the change now");
    } else {
      let id = slug(f.name) || "product";
      while (PRODUCTS.some((x) => x.id === id)) id += "-2";
      const code = id.replace(/-/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
      S.addProduct({ ...fields, id, stock: 0, focus: "50% 50%", sku: `LC-${code}-${String(PRODUCTS.length + 1).padStart(3, "0")}`, weight: 100,
        benefits: [], reviews: [] }, Math.max(0, Math.floor(Number(f.stock)) || 0));
      ui.toast(`${fields.name} added · it is live in the store`);
    }
    onClose();
  }

  const title = p ? "Edit product" : "Add product";
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="editor" onSubmit={save} role="dialog" aria-modal="true" aria-label={title}>
        <div className="panel-head"><h2>{title}</h2><button type="button" className="textbtn" onClick={onClose}>Close</button></div>
        <div className="editor-body">
          <div className="imgfield">
            <div className="imgprev">{f.image ? <img src={asset(f.image)} alt="Product" /> : <span>No picture yet</span>}</div>
            <div>
              <b>Product picture</b>
              <p className="muted small">JPG or PNG. It is resized automatically and shown across the store.</p>
              <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
              <div className="acts" style={{ justifyContent: "flex-start" }}>
                <button type="button" className="btn sm" onClick={() => file.current?.click()}>{f.image ? "Replace picture" : "Upload picture"}</button>
                {p && f.image !== p.image && <button type="button" className="btn sm ghost" onClick={() => setF({ ...f, image: p.image })}>Undo</button>}
              </div>
            </div>
          </div>

          <label className="field"><span>Name</span><input value={f.name} onChange={set("name")} placeholder="e.g. Brightening Face Mask" /></label>
          <div className="row2">
            <label className="field"><span>Category</span><select value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="field"><span>Type</span><input value={f.kind} onChange={set("kind")} placeholder="Serum, Cleanser…" /></label>
          </div>
          <div className="row2">
            <label className="field"><span>Regular price (Rs)</span><input inputMode="numeric" value={f.price} onChange={set("price")} /></label>
            <label className="field"><span>Sale price (Rs)</span><input inputMode="numeric" value={f.sale} onChange={set("sale")} placeholder="No sale" /></label>
          </div>
          <div className="row2">
            <label className="field"><span>Size</span><input value={f.size} onChange={set("size")} placeholder="50 g" /></label>
            {!p && <label className="field"><span>Opening stock (units)</span><input inputMode="numeric" value={f.stock} onChange={set("stock")} /></label>}
          </div>
          <label className="field"><span>Short description</span><input value={f.short} onChange={set("short")} /></label>
          <ChipInput label="Key actives" value={f.actives} onChange={(actives) => setF({ ...f, actives })} placeholder="e.g. Vitamin C, Niacinamide" />
          <ChipInput label="Full ingredient list" value={f.ingredients} onChange={(ingredients) => setF({ ...f, ingredients })} placeholder="e.g. Aqua, Glycerin, Shea Butter" />
          <label className="field"><span>How to use</span><textarea rows={2} value={f.usage} onChange={set("usage")} /></label>
          <label className="field"><span>Precautions</span><textarea rows={2} value={f.precautions} onChange={set("precautions")} /></label>
        </div>
        <div className="editor-foot">
          {p && S.edited(p.id) && <button type="button" className="textbtn" onClick={() => { S.resetProduct(p.id); ui.toast("Restored the original details"); onClose(); }}>Restore original</button>}
          {p && <Link className="btn sm ghost" href={productHref(p.id)} target="_blank">Preview in store</Link>}
          <button className="btn sm">{p ? "Save changes" : "Add to store"}</button>
        </div>
      </form>
    </div>
  );
}

export default function Products() {
  const S = useStore();
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const since = Date.now() - 14 * 86400000;
  const sold: Record<string, number> = {}, revenue: Record<string, number> = {};
  S.orders().filter((o) => o.at >= since && isRevenue(o)).forEach((o) => o.lines.forEach((l) => components(l).forEach((c) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    if (!p) return;
    sold[c.id] = (sold[c.id] || 0) + c.qty * l.qty;
    revenue[c.id] = (revenue[c.id] || 0) + unitPrice(p) * c.qty * l.qty;
  })));
  const shown = PRODUCTS.filter((p) => cat === "All" || p.category === cat);
  const open = editing && editing !== "new" ? PRODUCTS.find((p) => p.id === editing) : undefined;

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">{PRODUCTS.length} products · {CATEGORIES.length} categories · {BUNDLES.length} bundles</span><h1>Products</h1></div>
        <button className="btn" onClick={() => setEditing("new")}>+ Add product</button>
      </header>
      <div className="tabs">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} aria-selected={cat === c} onClick={() => setCat(c)}>
            {c} <em>{c === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c).length}</em>
          </button>
        ))}
      </div>
      <div className="pgrid">
        {shown.map((p) => {
          const n = S.stock(p.id);
          return (
            <article className="pcard-adm" key={p.id}>
              <div className="pcard-adm-img">
                <img src={asset(p.image)} alt="" style={{ objectPosition: p.focus }} />
                <span className="chip">{p.category}</span>
                {isCustom(p.id) ? <span className="chip edited">New</span> : S.edited(p.id) && <span className="chip edited">Edited</span>}
              </div>
              <div className="pcard-adm-body">
                <div className="orow"><b>{p.name}</b><span className={`stockpill ${n <= 0 ? "out" : n <= 8 ? "low" : ""}`}>{n} in stock</span></div>
                <span className="muted small">{p.sku} · {p.size} · {p.kind}</span>
                <div className="mini-stats">
                  <div><small>Price</small><b>{money(unitPrice(p))}</b>{p.sale && <s>{money(p.price)}</s>}</div>
                  <div><small>Sold · 14d</small><b>{sold[p.id] || 0}</b></div>
                  <div><small>Revenue · 14d</small><b>{money(revenue[p.id] || 0)}</b></div>
                </div>
                <div><small className="muted">Key actives</small>
                  <div className="chips" style={{ marginTop: 6 }}>{p.actives.length ? p.actives.map((a) => <span className="chip" key={a}>{a}</span>) : <span className="muted small">None added</span>}</div>
                </div>
                <div className="acts" style={{ justifyContent: "flex-start", marginTop: 4 }}>
                  <button className="btn sm" onClick={() => setEditing(p.id)}>Edit details</button>
                  <Link className="btn sm ghost" href={productHref(p.id)} target="_blank">View in store</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head"><h2>Bundles</h2><span className="muted small">Priced from each product&apos;s sale price, then an extra discount</span></div>
        {BUNDLES.map((b) => (
          <div className="comp" key={b.id}>
            <span><b>{b.name}</b> <span className="muted">· {b.items.length} products · extra {b.extra}% off</span></span>
            <span>{money(b.price)} · {S.bundleAvail(b.id).qty} can be sold</span>
          </div>
        ))}
      </section>
      {editing === "new" && <Editor onClose={() => setEditing(null)} />}
      {open && <Editor key={open.id} p={open} onClose={() => setEditing(null)} />}
    </>
  );
}
