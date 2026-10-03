"use client";

import Link from "next/link";
import { useState } from "react";
import { COURIERS, money } from "@/lib/data";
import { Order, OrderStatus, useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

export const STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Returned", "Cancelled"];

export function Status({ s }: { s: OrderStatus }) {
  return <span className={`pill ${s.toLowerCase()}`}>{s === "Pending" ? "To confirm" : s}</span>;
}

export function waLink(o: Order) {
  const phone = "92" + o.customer.phone.replace(/\D/g, "").slice(1);
  const text = `Hi ${o.customer.name.split(" ")[0]}, please confirm your LumeCare order ${o.id} (${money(o.total)}, Cash on Delivery).`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function OrderActions({ o, compact }: { o: Order; compact?: boolean }) {
  const S = useStore();
  const couriers = COURIERS.filter((c) => S.enabled("couriers", c.id));
  const [courier, setCourier] = useState("");
  const chosen = couriers.find((c) => c.id === courier) ?? couriers[0];
  const cancel = () => { S.cancel(o.id); ui.toast("Order cancelled · stock returned"); };

  if (o.status === "Pending") return (
    <div className="acts">
      {o.payment === "cod" && !compact && <a className="btn sm ghost" href={waLink(o)} target="_blank" rel="noopener noreferrer">WhatsApp customer</a>}
      <button className="btn sm" onClick={() => { S.confirm(o.id); ui.toast(`${o.id} confirmed`); }}>Confirm</button>
      {!compact && <button className="btn sm ghost" onClick={cancel}>Cancel</button>}
    </div>
  );
  if (o.status === "Confirmed") return (
    <div className="acts">
      {chosen ? (
        <>
          <select value={chosen.id} onChange={(e) => setCourier(e.target.value)} aria-label="Courier">
            {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn sm" onClick={() => ui.toast(S.book(o.id, chosen.id) ? "Shipment booked · tracking number received" : "Courier rejected the booking")}>
            {o.bookingError ? "Retry" : "Book"}
          </button>
        </>
      ) : <span className="muted small">No courier is switched on.</span>}
      {!compact && <button className="btn sm ghost" onClick={cancel}>Cancel</button>}
    </div>
  );
  if (o.status === "Shipped") return (
    <div className="acts">
      <button className="btn sm" onClick={() => S.advance(o.id)}>{compact ? "Update" : "Next courier update"}</button>
      {!compact && <button className="btn sm ghost" onClick={() => { S.markReturned(o.id); ui.toast("Marked as returned · stock restored"); }}>Mark returned</button>}
    </div>
  );
  return null;
}

export function Bars({ data, format }: { data: { label: string; value: number; sub?: string }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bars" role="img" aria-label="Revenue per day">
      {data.map((d, i) => (
        <div className="bar-col" key={i} title={`${d.label}: ${format(d.value)}${d.sub ? ` · ${d.sub}` : ""}`}>
          <span className="bar-val">{d.value ? format(d.value).replace("Rs ", "") : ""}</span>
          <i style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
          <small>{d.label}</small>
        </div>
      ))}
    </div>
  );
}

export function Meter({ label, value, total, note }: { label: string; value: number; total: number; note?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="meter">
      <div className="orow"><span>{label}</span><span className="muted small">{note ?? `${value} · ${pct}%`}</span></div>
      <div className="meter-track"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="adm-empty">{children}</div>;
}

export function OrderLink({ o }: { o: Order }) {
  return <Link className="olink" href={`/admin/orders/?id=${o.id}`}>{o.id}</Link>;
}

// Eye button that opens the order detail page.
const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function ViewOrder({ o, docs }: { o: Order; docs?: boolean }) {
  return (
    <div className="eyes">
      <Link className="eye" href={`/admin/orders/?id=${o.id}`} aria-label={`View order ${o.id}`} title="View details">
        <svg viewBox="0 0 24 24" width="17" height="17" {...ICON} aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
        <span>View</span>
      </Link>
      {docs && (
        <>
          <Link className="eye" href={`/invoice/?id=${o.id}`} aria-label={`Invoice for ${o.id}`} title="Invoice or receipt">
            <svg viewBox="0 0 24 24" width="17" height="17" {...ICON} aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5" /></svg>
            <span>Invoice</span>
          </Link>
          {o.shipment
            ? <Link className="eye" href={`/admin/label/?id=${o.id}`} aria-label={`Shipping label for ${o.id}`} title="Shipping label">
                <svg viewBox="0 0 24 24" width="17" height="17" {...ICON} aria-hidden="true"><path d="M3 5v14M6 5v14M10 5v14M13 5v14M17 5v14M21 5v14" /></svg>
                <span>Label</span>
              </Link>
            : <span className="eye off" title="Book a courier first"><svg viewBox="0 0 24 24" width="17" height="17" {...ICON} aria-hidden="true"><path d="M3 5v14M6 5v14M10 5v14M13 5v14M17 5v14M21 5v14" /></svg><span>Label</span></span>}
        </>
      )}
    </div>
  );
}

// Reads a picture, shrinks it and returns a small data URL so it can be stored in the browser.
export function resizeImage(file: File, max = 1100): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("not an image")); };
    img.src = url;
  });
}

// Type a value and press Enter or comma to add it. Click a chip to remove it.
export function ChipInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const items = raw.split(",").map((x) => x.trim()).filter((x) => x && !value.some((v) => v.toLowerCase() === x.toLowerCase()));
    if (items.length) onChange([...value, ...items]);
    setText("");
  };
  return (
    <div className="field">
      <span>{label}</span>
      <div className="chipbox" onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
        {value.map((v) => (
          <button type="button" className="chip rm" key={v} onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`}>{v}<i>×</i></button>
        ))}
        <input value={text} placeholder={value.length ? "" : placeholder} aria-label={`Add to ${label}`}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(text); }
            else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => text.trim() && add(text)} />
      </div>
      <small className="muted">Press Enter or comma after each one.</small>
    </div>
  );
}
