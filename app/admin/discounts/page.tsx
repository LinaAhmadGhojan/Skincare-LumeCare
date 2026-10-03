"use client";

import { useState } from "react";
import { money } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

export default function Discounts() {
  const S = useStore();
  const [f, setF] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "15", min: "0", limit: "100" });
  const list = S.discounts();

  function create(e: React.FormEvent) {
    e.preventDefault();
    const code = f.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return ui.toast("Use 3 to 20 letters or numbers");
    if (!S.addDiscount({ code, type: f.type, value: Number(f.value) || 0, min: Number(f.min) || 0, limit: Number(f.limit) || 1 })) return ui.toast("This code already exists");
    ui.toast(`${code} created · try it at checkout`);
    setF({ ...f, code: "" });
  }

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">Works at checkout, on products and bundles</span><h1>Discount codes</h1></div>
      </header>
      <div className="adm-grid">
        <section className="panel flush span2">
          <table className="tbl">
            <thead><tr><th>Code</th><th>Discount</th><th>Minimum order</th><th>Usage</th><th className="r">Status</th></tr></thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.code}>
                  <td><b className="code">{d.code}</b></td>
                  <td data-l="Discount">{d.type === "percent" ? `${d.value}% off` : `${money(d.value)} off`}</td>
                  <td data-l="Minimum order">{d.min ? money(d.min) : "None"}</td>
                  <td data-l="Usage" style={{ minWidth: 150 }}>
                    <div className="orow small"><span>{d.uses} used</span><span className="muted">of {d.limit}</span></div>
                    <div className="meter-track"><i style={{ width: `${Math.min(100, (d.uses / d.limit) * 100)}%` }} /></div>
                  </td>
                  <td className="r">
                    <label className="switch" title={d.active ? "Active" : "Paused"}>
                      <input type="checkbox" checked={d.active} onChange={() => S.toggleDiscount(d.code)} aria-label={`${d.code} active`} /><i />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>New code</h2></div>
          <form onSubmit={create}>
            <label className="field"><span>Code</span><input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="e.g. GLOW15" /></label>
            <div className="row2">
              <label className="field"><span>Type</span>
                <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as "percent" | "fixed" })}>
                  <option value="percent">Percentage</option><option value="fixed">Fixed amount</option>
                </select>
              </label>
              <label className="field"><span>{f.type === "percent" ? "Percent" : "Amount (Rs)"}</span><input inputMode="numeric" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></label>
            </div>
            <div className="row2">
              <label className="field"><span>Minimum order (Rs)</span><input inputMode="numeric" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} /></label>
              <label className="field"><span>Usage limit</span><input inputMode="numeric" value={f.limit} onChange={(e) => setF({ ...f, limit: e.target.value })} /></label>
            </div>
            <button className="btn block">Create code</button>
          </form>
        </section>
      </div>
    </>
  );
}
