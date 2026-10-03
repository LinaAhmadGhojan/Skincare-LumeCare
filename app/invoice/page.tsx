"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Barcode } from "@/components/barcode";
import { BRAND, PAYMENTS, money, product } from "@/lib/data";
import { Order, components, lineInfo, linePrice, useStore } from "@/lib/store";
import { when } from "@/lib/ui";

const SELLER = { address: "OneWorld, Block A (Commercial), Pasrur Road, Daska, Pakistan", phone: "+92 315 7616578", email: "thelumecare@gmail.com" };

function payInfo(o: Order) {
  const name = PAYMENTS.find((p) => p.id === o.payment)?.name ?? o.payment;
  const status = o.status === "Cancelled" ? "Cancelled" : o.paid ? "Paid" : o.payment === "cod" ? "Due on delivery" : "Awaiting payment";
  return { name, status };
}

// Formal A4 invoice.
function A4({ o }: { o: Order }) {
  const pay = payInfo(o);
  return (
    <article className="invoice">
      <header className="inv-head">
        <div>
          <span className="logo"><i aria-hidden="true" />{BRAND}</span>
          <p>{SELLER.address}<br />{SELLER.phone} · {SELLER.email}</p>
        </div>
        <div className="inv-title">
          <h1>INVOICE</h1>
          <table className="inv-kv"><tbody>
            <tr><th>Invoice no.</th><td>{o.id.replace("SL", "INV")}</td></tr>
            <tr><th>Invoice date</th><td>{new Date(o.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
            <tr><th>Order no.</th><td>{o.id}</td></tr>
            <tr><th>Status</th><td><b className={o.paid ? "okc" : "low"}>{pay.status}</b></td></tr>
          </tbody></table>
        </div>
      </header>

      <div className="inv-parties">
        <div><small>Bill to</small><b>{o.customer.name}</b><span>{o.customer.phone}</span>{o.customer.email && <span>{o.customer.email}</span>}</div>
        <div><small>Ship to</small><b>{o.customer.name}</b><span>{o.customer.address}</span><span>{o.customer.city}, Pakistan</span></div>
        <div><small>Payment method</small><b>{pay.name}</b>{o.shipment && <span>{o.shipment.courier} · {o.shipment.tracking}</span>}</div>
      </div>

      <table className="inv-table">
        <thead><tr><th style={{ width: 36 }}>#</th><th>Description</th><th>SKU</th><th className="r">Qty</th><th className="r">Unit price</th><th className="r">Amount</th></tr></thead>
        <tbody>
          {o.lines.map((l, i) => (
            <tr key={l.type + l.id}>
              <td>{i + 1}</td>
              <td><b>{lineInfo(l).name}</b>{l.type === "bundle" && <div className="muted small">Bundle: {components(l).map((c) => product(c.id).name).join(", ")}</div>}</td>
              <td className="muted">{l.type === "product" ? product(l.id).sku : "BUNDLE"}</td>
              <td className="r">{l.qty}</td>
              <td className="r">{money(linePrice(l))}</td>
              <td className="r">{money(linePrice(l) * l.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-bottom">
        <div className="inv-notes">
          <small>Notes</small>
          <p>Thank you for shopping with {BRAND}. Please keep this invoice for returns and exchanges. Questions about this order: WhatsApp {SELLER.phone} with your order number.</p>
          {o.payment === "cod" && !o.paid && <p className="inv-due">Amount due to the courier on delivery: <b>{money(o.total)}</b></p>}
        </div>
        <table className="inv-totals"><tbody>
          <tr><th>Subtotal</th><td>{money(o.subtotal)}</td></tr>
          {o.codeDiscount > 0 && <tr><th>Discount ({o.code})</th><td>− {money(o.codeDiscount)}</td></tr>}
          {o.discount > 0 && <tr><th>Loyalty points</th><td>− {money(o.discount)}</td></tr>}
          <tr><th>Delivery</th><td>{o.shipping ? money(o.shipping) : "Free"}</td></tr>
          <tr className="grand"><th>Total (PKR)</th><td>{money(o.total)}</td></tr>
          <tr><th>Paid</th><td>{money(o.paid ? o.total : 0)}</td></tr>
          <tr className="due"><th>Balance due</th><td>{money(o.paid || o.status === "Cancelled" ? 0 : o.total)}</td></tr>
        </tbody></table>
      </div>

      <footer className="inv-foot">
        <div className="inv-sign"><span />Authorised signature</div>
        <p className="muted small">Concept demo prepared by AtlasDev · sample invoice, not a tax document.</p>
      </footer>
    </article>
  );
}

// 80 mm receipt, like a till slip.
function Receipt({ o }: { o: Order }) {
  const pay = payInfo(o);
  return (
    <article className="receipt-slip">
      <div className="rc-c"><b className="rc-brand">{BRAND}</b><span>Daska, Pakistan</span><span>{SELLER.phone}</span></div>
      <div className="rc-rule" />
      <div className="rc-row"><span>Receipt</span><span>{o.id.replace("SL", "INV")}</span></div>
      <div className="rc-row"><span>Order</span><span>{o.id}</span></div>
      <div className="rc-row"><span>Date</span><span>{when(o.at)}</span></div>
      <div className="rc-row"><span>Customer</span><span>{o.customer.name}</span></div>
      <div className="rc-rule" />
      {o.lines.map((l) => (
        <div key={l.type + l.id}>
          <div>{lineInfo(l).name}</div>
          <div className="rc-row"><span>{l.qty} × {money(linePrice(l))}</span><span>{money(linePrice(l) * l.qty)}</span></div>
        </div>
      ))}
      <div className="rc-rule" />
      <div className="rc-row"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
      {o.codeDiscount > 0 && <div className="rc-row"><span>Discount {o.code}</span><span>-{money(o.codeDiscount)}</span></div>}
      {o.discount > 0 && <div className="rc-row"><span>Points</span><span>-{money(o.discount)}</span></div>}
      <div className="rc-row"><span>Delivery</span><span>{o.shipping ? money(o.shipping) : "Free"}</span></div>
      <div className="rc-row rc-total"><span>TOTAL</span><span>{money(o.total)}</span></div>
      <div className="rc-row"><span>{pay.name}</span><span>{pay.status}</span></div>
      <div className="rc-rule" />
      <div className="rc-code"><Barcode value={o.id} height={40} /><span>{o.id}</span></div>
      <div className="rc-c"><span>Thank you for shopping with {BRAND}</span><span className="muted">Sample receipt · AtlasDev demo</span></div>
    </article>
  );
}

function Invoice() {
  const S = useStore();
  const [mode, setMode] = useState<"a4" | "receipt">("a4");
  const o = S.order(useSearchParams().get("id") ?? "");
  if (!o) {
    return (
      <div className="wrap page empty">
        <h2>We could not find this invoice.</h2>
        <Link className="btn" href="/track/">Track an order</Link>
      </div>
    );
  }
  return (
    <div className={`wrap page doc-page ${mode}`}>
      <div className="inv-actions no-print">
        <Link className="back" href={`/order/?id=${o.id}`}>← Order {o.id}</Link>
        <div className="tabs" style={{ margin: 0 }}>
          <button aria-selected={mode === "a4"} onClick={() => setMode("a4")}>A4 invoice</button>
          <button aria-selected={mode === "receipt"} onClick={() => setMode("receipt")}>Receipt</button>
        </div>
        <button className="btn sm" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      {mode === "a4" ? <A4 o={o} /> : <Receipt o={o} />}
    </div>
  );
}

export default function Page() {
  return <Suspense><Invoice /></Suspense>;
}
