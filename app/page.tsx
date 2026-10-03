import Link from "next/link";
import { Stars } from "@/components/cards";
import { BundleGrid, Count, ProductGrid, QuickRow } from "@/components/lists";
import { BUNDLES, PRODUCTS, SHIPPING, asset, bundleSaving, money, productHref, bundleHref } from "@/lib/data";

const GUIDE = [
  { n: "01", title: "Bundles with real stock", text: "A bundle reduces the stock of every product inside it and stops selling when one runs out.", href: "/set/complete-routine/", cta: "Open a bundle" },
  { n: "02", title: "Several payment methods", text: "Cash on Delivery, JazzCash, Easypaisa and cards. Each one can be switched on or off.", href: "/shop/", cta: "Start an order" },
  { n: "03", title: "Courier booking", text: "Book TCS, Leopards or PostEx from the order. The tracking number comes back automatically.", href: "/admin/orders/", cta: "Open the back office" },
  { n: "04", title: "Accounts and points", text: "Customers see their orders, earn points on delivery and use them at checkout.", href: "/account/", cta: "Open account" },
  { n: "05", title: "Pixel and Analytics", text: "View, add to bag, checkout and purchase events, with the order value in PKR.", href: "/product/serum/", cta: "Send an event" },
];

export default function Home() {
  const quotes = PRODUCTS.slice(0, 3).map((p) => ({ p, r: p.reviews[0] }));
  return (
    <>
      <section className="wrap hero">
        <div className="hero-copy">
          <span className="eyebrow">Made in Pakistan · Everyday skincare</span>
          <h1>A routine that fits <span className="hl">every day.</span></h1>
          <p>Four products, one clear role each. Start with one step or take the complete routine, delivered to your door with Cash on Delivery.</p>
          <div className="hero-actions">
            <Link className="btn" href="/shop/">Shop the collection →</Link>
            <Link className="btn ghost" href="/brief/">See how it works</Link>
          </div>
          <div className="hero-stats">
            <div><b>48h</b><span>Fast delivery</span></div>
            <div><b><Count /></b><span>Core products</span></div>
            <div><b>COD</b><span>Cash on delivery</span></div>
          </div>
        </div>
        <div className="hero-media">
          <img src={asset("/img/hero.jpg")} alt="" />
          <span className="hero-badge">Free shipping over {money(SHIPPING.freeOver)}</span>
          <Link className="hero-float" href={bundleHref(BUNDLES[0].id)}>
            <img src={asset("/img/serum.jpg")} alt="" style={{ objectPosition: "70% 50%" }} />
            <span><b>{BUNDLES[0].name}</b><small>{BUNDLES[0].items.length} products · save {money(bundleSaving(BUNDLES[0]))}</small></span>
            <i>→</i>
          </Link>
        </div>
      </section>

      <QuickRow />

      <section className="section wrap">
        <div className="sec-head">
          <h2>The essentials</h2>
          <Link className="ulink" href="/shop/">View all</Link>
        </div>
        <ProductGrid />
      </section>

      <section className="split">
        <div className="split-img"><img src={asset("/img/texture.jpg")} alt="" loading="lazy" /></div>
        <div className="split-copy">
          <span className="eyebrow">Our approach</span>
          <h2>Fewer products. Clear ingredients.</h2>
          <p>Every product page lists what is inside, how much of each active it contains and how to use it. Nothing is hidden behind a marketing name.</p>
          <ul className="facts">
            <li><span>AHA · Vitamin B3</span><span>Hydrating Cleanser</span></li>
            <li><span>Vitamin C · Retinol</span><span>Radiant Renewal Serum</span></li>
            <li><span>Glutathione · Alpha-Arbutin</span><span>Radiance Cream</span></li>
          </ul>
          <div><Link className="ulink" href="/product/serum/">Read a product page</Link></div>
        </div>
      </section>

      <section className="section wrap">
        <div className="sec-head">
          <h2>Routine sets</h2>
          <span className="muted">Bought together, priced lower.</span>
        </div>
        <BundleGrid />
      </section>

      <section className="guide" id="guide">
        <div className="wrap">
          <span className="eyebrow">About this demo</span>
          <h2>Five things you can try on this store.</h2>
          <div className="guide-grid">
            {GUIDE.map((g) => (
              <Link href={g.href} key={g.n}>
                <b>{g.n}</b>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
                <span>{g.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="sec-head"><h2>In their words</h2></div>
        <div className="quotes">
          {quotes.map(({ p, r }) => (
            <blockquote className="quote" key={p.id}>
              <Stars value={r.rating} />
              <p>“{r.text}”</p>
              <footer>{r.name} · {p.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
