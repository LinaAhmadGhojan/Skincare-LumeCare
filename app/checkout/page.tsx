"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CITIES, PAYMENTS, money } from "@/lib/data";
import { Customer, lineInfo, linePrice, useStore } from "@/lib/store";

export default function Checkout() {
  const S = useStore(), router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [payment, setPayment] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const sent = useRef(false);

  const lines = S.cart(), t = S.totals(usePoints, code), points = S.points();
  const methods = PAYMENTS.filter((m) => S.enabled("payments", m.id));
  const method = methods.find((m) => m.id === payment) ?? methods[0];

  useEffect(() => {
    if (sent.current || !lines.length) return;
    sent.current = true;
    S.track("InitiateCheckout", "begin_checkout", { value: S.totals(false).subtotal, currency: "PKR" });
  }, [S, lines.length]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  function finish(paid: boolean) {
    const customer: Customer = { ...f, name: f.name.trim(), phone: f.phone.trim(), payment: method.id };
    const o = S.placeOrder(customer, paid, usePoints, t.codeDiscount ? code : "");
    setPaying(false);
    if (!o) return setError("Some items are no longer in stock. Please review your bag.");
    setDone(true);
    router.push(`/order/?id=${o.id}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!f.name.trim() || !f.address.trim() || !f.city) return setError("Please fill in your name, address and city.");
    if (!/^03\d{2}-?\d{7}$/.test(f.phone.trim())) return setError("Please enter a valid mobile number, for example 0300-1234567.");
    if (!method) return setError("Please choose a payment method.");
    if (method.id === "cod") finish(false); else setPaying(true);
  }

  if (done) return <div className="wrap page" />;
  if (!lines.length) {
    return (
      <div className="wrap page empty">
        <span className="eyebrow">Checkout</span>
        <h2>Your bag is empty.</h2>
        <Link className="btn" href="/shop/">Shop the collection</Link>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <div className="page-head"><h1>Checkout</h1></div>
      <form className="cols" onSubmit={submit} noValidate>
        <div>
          <div className="block">
            <h2 className="step-title"><i>01</i>Delivery</h2>
            <p className="muted" style={{ marginTop: -12, marginBottom: 22 }}>No account needed. You can check out as a guest.</p>
            <label className="field"><span>Full name</span><input value={f.name} onChange={set("name")} autoComplete="name" /></label>
            <div className="row2">
              <label className="field"><span>Mobile number</span><input value={f.phone} onChange={set("phone")} inputMode="numeric" placeholder="03XX-XXXXXXX" /></label>
              <label className="field"><span>Email (optional)</span><input value={f.email} onChange={set("email")} type="email" autoComplete="email" /></label>
            </div>
            <label className="field"><span>Full address</span><textarea value={f.address} onChange={set("address")} rows={2} /></label>
            <label className="field"><span>City</span>
              <select value={f.city} onChange={set("city")}>
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div className="block">
            <h2 className="step-title"><i>02</i>Payment</h2>
            {methods.length === 0 && <p className="alert">All payment methods are switched off in the admin preview.</p>}
            {methods.map((m) => (
              <label className="opt" key={m.id}>
                <input type="radio" name="payment" checked={method?.id === m.id} onChange={() => setPayment(m.id)} />
                <span><b>{m.name}</b><small>{m.note}</small></span>
              </label>
            ))}
          </div>
        </div>

        <div className="summary">
          <h2>Your order</h2>
          {lines.map((l) => (
            <div className="sum" key={l.type + l.id}>
              <span>{lineInfo(l).name} × {l.qty}</span><span>{money(linePrice(l) * l.qty)}</span>
            </div>
          ))}
          <hr className="rule" />
          {points > 0 && (
            <label className="check">
              <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
              <span>Use my {points} loyalty points</span>
            </label>
          )}
          <div className="code-row">
            <input value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Discount code" aria-label="Discount code"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setCode(codeInput); } }} />
            <button type="button" className="btn sm ghost" onClick={() => setCode(codeInput)}>Apply</button>
          </div>
          {code && t.codeError && <p className="err">{t.codeError}</p>}
          {!code && <p className="muted small" style={{ margin: "6px 0 10px" }}>Try WELCOME10 or ROUTINE300</p>}
          <div className="sum"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
          {t.codeDiscount > 0 && <div className="sum ok"><span>Code {code.trim().toUpperCase()}</span><span>− {money(t.codeDiscount)}</span></div>}
          {t.discount > 0 && <div className="sum ok"><span>Points used ({t.pointsUsed})</span><span>− {money(t.discount)}</span></div>}
          <div className="sum"><span>Shipping</span><span>{t.shipping ? money(t.shipping) : "Free"}</span></div>
          <div className="sum total"><span>Total</span><span>{money(t.total)}</span></div>
          {error && <p className="alert" role="alert">{error}</p>}
          <button className="btn block" style={{ marginTop: 18 }} disabled={!method}>Place order</button>
        </div>
      </form>

      {paying && method && (
        <div className="modal">
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Demo payment page">
            <span className="eyebrow">Demo payment page</span>
            <h2>{method.name}</h2>
            <div className="amount">{money(t.total)}</div>
            <p className="muted small">
              No real payment is taken. In the live store the customer is sent to the gateway, and the order is marked as
              paid only after the gateway confirms it.
            </p>
            <button className="btn block" onClick={() => finish(true)}>Simulate successful payment</button>
            <button className="btn ghost block" onClick={() => { setPaying(false); setError("Payment was not completed. You can try again or choose another payment method."); }}>
              Simulate failed payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
