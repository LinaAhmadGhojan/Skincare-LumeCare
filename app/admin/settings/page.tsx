"use client";

import { useState } from "react";
import { COURIERS, PAYMENTS, SHIPPING, money } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ui, when } from "@/lib/ui";

export default function Settings() {
  const S = useStore();
  const ids = S.trackingIds();
  const [pixel, setPixel] = useState(ids.pixel);
  const [ga, setGa] = useState(ids.ga);
  const events = S.events();

  return (
    <>
      <header className="adm-head">
        <div><span className="eyebrow">Each one is a separate module</span><h1>Payments &amp; couriers</h1></div>
      </header>
      <div className="adm-grid">
        <section className="panel">
          <div className="panel-head"><h2>Payment methods</h2></div>
          {PAYMENTS.map((m) => (
            <div className="setting" key={m.id}>
              <div><b>{m.name}</b><span className="muted small">{m.id === "cod" ? "Confirmed by phone before shipping" : "Merchant account · sandbox connected"}</span></div>
              <label className="switch"><input type="checkbox" checked={S.enabled("payments", m.id)} onChange={() => S.toggle("payments", m.id)} aria-label={`${m.name} on or off`} /><i /></label>
            </div>
          ))}
          <p className="note">An online order is marked paid only after the gateway confirms it. Switching a method off removes it from checkout straight away.</p>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Couriers</h2></div>
          {COURIERS.map((c) => (
            <div className="setting" key={c.id}>
              <div><b>{c.name}</b><span className="muted small">API connected · {c.noService.length ? `no service to ${c.noService.join(", ")}` : "all listed cities"}</span></div>
              <label className="switch"><input type="checkbox" checked={S.enabled("couriers", c.id)} onChange={() => S.toggle("couriers", c.id)} aria-label={`${c.name} on or off`} /><i /></label>
            </div>
          ))}
          <p className="note">Try a rejected booking: order to Quetta or Sukkur and book with PostEx. The order keeps the reason and can be retried with another courier.</p>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Shipping rules</h2></div>
          <div className="sum"><span className="muted">Flat delivery fee</span><span>{money(SHIPPING.flat)}</span></div>
          <div className="sum"><span className="muted">Free delivery from</span><span>{money(SHIPPING.freeOver)}</span></div>
          <div className="sum"><span className="muted">COD confirmation</span><span>Phone or WhatsApp</span></div>
          <p className="muted small" style={{ marginTop: 10 }}>Editable from the back office in the live system.</p>
        </section>

        <section className="panel span2">
          <div className="panel-head"><h2>Marketing tracking</h2><span className="muted small">Meta Pixel and Google Analytics 4</span></div>
          <form className="row2" onSubmit={(e) => { e.preventDefault(); S.setTracking({ pixel: pixel.trim(), ga: ga.trim() }); ui.toast("Tracking IDs saved"); }}>
            <label className="field"><span>Meta Pixel ID</span><input value={pixel} onChange={(e) => setPixel(e.target.value)} placeholder="e.g. 1234567890" /></label>
            <label className="field"><span>GA4 Measurement ID</span><input value={ga} onChange={(e) => setGa(e.target.value)} placeholder="e.g. G-XXXXXXX" /></label>
            <div><button className="btn sm">Save IDs</button></div>
          </form>
          <div className="panel-head" style={{ marginTop: 18 }}><h2>Latest events</h2><span className="muted small">{events.length} sent from this browser</span></div>
          {events.length === 0 ? <p className="muted" style={{ margin: 0 }}>Browse the store to send events.</p> : (
            <table className="tbl plain">
              <thead><tr><th>When</th><th>Meta Pixel</th><th>GA4</th><th>Details</th></tr></thead>
              <tbody>
                {events.slice(0, 8).map((e, i) => (
                  <tr key={i}>
                    <td className="muted">{when(e.at)}</td>
                    <td data-l="Meta Pixel"><b>{e.pixel}</b></td>
                    <td data-l="GA4">{e.ga}</td>
                    <td data-l="Details" className="muted small">{Object.entries(e.data).map(([k, v]) => `${k}: ${v}`).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
