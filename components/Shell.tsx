"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BRAND, CLIENT, SHIPPING, asset, bundleSaving, money } from "@/lib/data";
import { hydrate, lineInfo, linePrice, useStore } from "@/lib/store";
import { ui, useUi } from "@/lib/ui";
import { Stepper } from "./cards";

function CartDrawer() {
  const S = useStore(), u = useUi();
  const lines = S.cart(), t = S.totals(false), up = S.upsell();
  const progress = Math.min(100, Math.round((t.subtotal / SHIPPING.freeOver) * 100));
  return (
    <>
      <div className={"scrim" + (u.cart ? " on" : "")} onClick={ui.closeAll} />
      <aside className={"drawer" + (u.cart ? " on" : "")} aria-label="Your bag" aria-hidden={!u.cart}>
        <div className="drawer-head">
          <h2>Your bag</h2>
          <button className="textbtn" onClick={ui.closeAll}>Close</button>
        </div>
        <div className="drawer-body">
          {lines.length === 0 && <p className="muted" style={{ padding: "40px 0" }}>Your bag is empty.</p>}
          {lines.map((l, i) => {
            const x = lineInfo(l);
            return (
              <div className="line" key={l.type + l.id}>
                <Link href={x.href}><img src={asset(x.image)} alt="" style={{ objectPosition: x.focus }} /></Link>
                <div>
                  <h3><Link href={x.href}>{x.name}</Link></h3>
                  <div className="sub">{x.sub}</div>
                  <Stepper small value={l.qty} onChange={(q) => { if (!S.setQty(i, q)) ui.toast("No more stock available"); }} />
                </div>
                <div className="line-end">
                  <span>{money(linePrice(l) * l.qty)}</span>
                  <button className="textbtn" onClick={() => S.setQty(i, 0)}>Remove</button>
                </div>
              </div>
            );
          })}
          {up && (
            <div className="upsell">
              <span><b>Complete {up.name}</b><small>Switch to the set and save {money(bundleSaving(up))}</small></span>
              <button className="btn sm" onClick={() => { if (!S.upgrade(up.id)) ui.toast("Not enough stock for the set"); }}>Switch</button>
            </div>
          )}
        </div>
        {lines.length > 0 && (
          <div className="drawer-foot">
            <p className="small" style={{ marginBottom: 8, fontWeight: 500 }}>
              {t.shipping ? `Add ${money(SHIPPING.freeOver - t.subtotal)} more for free shipping` : "You have free shipping on this order"}
            </p>
            <div className="bar"><i style={{ width: `${progress}%` }} /></div>
            <div className="sum" style={{ marginTop: 10 }}><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
            <Link className="btn block" href="/checkout/">Checkout</Link>
            <Link className="btn ghost block" href="/cart/" style={{ marginTop: 8 }}>View bag</Link>
          </div>
        )}
      </aside>
    </>
  );
}

// Demo shortcuts for the client, kept out of the customer navigation.
function DemoDock() {
  return (
    <nav className="dock" aria-label="Demo">
      <span>Demo</span>
      <Link href="/brief/">Your brief</Link>
      <Link href="/admin/">Back office</Link>
    </nav>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const S = useStore(), u = useUi(), path = usePathname();
  useEffect(() => { hydrate(); }, []);
  useEffect(() => { ui.closeAll(); }, [path]);

  // The admin preview has its own layout with a sidebar.
  if (path.startsWith("/admin")) {
    return (
      <>
        {children}
        <div className={"toast" + (u.toast ? " show" : "")} role="status" aria-live="polite">{u.toast}</div>
      </>
    );
  }

  return (
    <>
      <p className="ribbon">Concept demo prepared for {CLIENT} by AtlasDev · Sample data · No real orders or payments</p>
      <header className="top">
        <div className="wrap top-in">
          <div><Link className="logo" href="/"><i aria-hidden="true" />{BRAND}</Link></div>
          <nav className={"nav" + (u.menu ? " open" : "")} aria-label="Main">
            <Link href="/shop/">Shop</Link>
            <Link href="/set/complete-routine/">Bundles</Link>
            <Link href="/track/">Track order</Link>
            <Link href="/account/">Account</Link>
          </nav>
          <div className="top-right">
            <button className="bag" onClick={ui.openCart} aria-label={`Bag, ${S.cartCount()} items`}>Bag <b>{S.cartCount()}</b></button>
            <button className="menu-btn" onClick={ui.toggleMenu} aria-expanded={u.menu} aria-label="Menu"><span /><span /></button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="foot">
        <div className="wrap foot-in">
          <div>
            <span className="logo">{BRAND}</span>
            <p>{BRAND} is a fictional brand created for this demo. The store was built by AtlasDev with Next.js. All data stays in your browser.</p>
          </div>
          <div>
            <h4>Store</h4>
            <ul>
              <li><Link href="/shop/">Shop all</Link></li>
              <li><Link href="/set/complete-routine/">The Complete Routine</Link></li>
              <li><Link href="/track/">Track an order</Link></li>
              <li><Link href="/account/">Account &amp; points</Link></li>
            </ul>
          </div>
          <div>
            <h4>Demo</h4>
            <ul>
              <li><Link href="/admin/">Admin preview</Link></li>
              <li><Link href="/brief/">Your brief, answered</Link></li>
              <li className="muted">Photos: Unsplash</li>
            </ul>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <DemoDock />
      <div className={"toast" + (u.toast ? " show" : "")} role="status" aria-live="polite">{u.toast}</div>
    </>
  );
}
