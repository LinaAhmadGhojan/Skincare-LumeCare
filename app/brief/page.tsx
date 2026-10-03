import Link from "next/link";
import { CLIENT } from "@/lib/data";

// The six concerns raised about the first proposal, each matched to something that can be tried in this demo.
const POINTS = [
  {
    n: "01", topic: "Technology and architecture",
    concern: "The stack and approach should fit current and future requirements.",
    answer: "This demo is built with Next.js and TypeScript. Each payment gateway and each courier is a separate module behind one shared interface, so adding one later means adding a module, not rebuilding the store.",
    proof: ["Switch a gateway or courier off and it disappears from the store", "Source code is yours after the final payment"],
    href: "/admin/settings/", cta: "Open payments and couriers",
  },
  {
    n: "02", topic: "Courier integration",
    concern: "TCS, Leopards and PostEx integration is important for daily operations.",
    answer: "Staff book the courier from the order. The tracking number comes back on its own and the status follows the parcel. A rejected booking never loses the order, and a returned parcel puts the stock back.",
    proof: ["Book with TCS, Leopards or PostEx", "Rejected booking stays visible with the reason and a retry", "Mark returned restores stock and skips loyalty points"],
    href: "/admin/orders/", cta: "Book a shipment",
  },
  {
    n: "03", topic: "Bundles and inventory",
    concern: "Bundle offers need component-level inventory management.",
    answer: "A set has no stock of its own. Selling one set reduces every product inside it, the set stops selling when any product runs out, and a cancelled order returns each quantity.",
    proof: ["Set availability is calculated from its products", "The bag suggests switching single products to the set", "Change stock in admin and watch the set react"],
    href: "/set/complete-routine/", cta: "Open a bundle",
  },
  {
    n: "04", topic: "Payments and integrations",
    concern: "One payment gateway is not enough. Flexibility is needed for the future.",
    answer: "Checkout offers Cash on Delivery, JazzCash, Easypaisa and cards. An online order is marked paid only after the gateway confirms it, and a failed payment creates no order.",
    proof: ["Four payment methods at checkout", "Each one can be switched on or off from admin", "Failed and successful payments can both be simulated"],
    href: "/shop/", cta: "Start an order",
  },
  {
    n: "05", topic: "Marketing and customer features",
    concern: "Analytics, Meta Pixel, customer accounts and loyalty should be included.",
    answer: "The store sends view, add to bag, checkout and purchase events with the order value in PKR. Customers can see their orders and earn points when an order is delivered. Guest checkout stays available.",
    proof: ["Open the Pixel events panel, bottom left", "Purchase is sent once, even after a page reload", "Points can be used as a discount at checkout"],
    href: "/account/", cta: "Open the account",
  },
  {
    n: "06", topic: "Scope and additional costs",
    concern: "Important features outside the scope may lead to extra costs later.",
    answer: "Everything shown in this demo is listed inside the scope of the revised proposal. Add-ons you may want later, such as another courier or gateway, get a fixed price in writing before you sign.",
    proof: ["No work starts on a change without written approval", "Hosting, domain and gateway fees are listed separately because they are paid to third parties"],
    href: "/admin/", cta: "Open the back office",
  },
];

export default function Brief() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <span className="eyebrow">Prepared for {CLIENT}</span>
        <h1>Your brief, <span className="hl">answered.</span></h1>
        <p>You raised six concerns about the first proposal. Each one below links to a part of this demo you can try yourself.</p>
      </div>
      <div className="brief">
        {POINTS.map((p) => (
          <article className="brief-card" key={p.n}>
            <div className="brief-top">
              <b>{p.n}</b>
              <h2>{p.topic}</h2>
            </div>
            <p className="brief-concern">“{p.concern}”</p>
            <p>{p.answer}</p>
            <ul className="dash">{p.proof.map((x) => <li key={x}>{x}</li>)}</ul>
            <Link className="btn sm" href={p.href}>{p.cta} →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
