"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useStore } from "@/lib/store";
import { when } from "@/lib/ui";

function Track() {
  const S = useStore(), router = useRouter();
  const q = useSearchParams().get("q") ?? "";
  const o = q ? S.find(q) : undefined;

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Track your order</h1>
        <p>Enter your order number or the courier tracking number.</p>
      </div>
      <div className="narrow">
        <form className="track-form" key={q} onSubmit={(e) => {
          e.preventDefault();
          const v = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
          router.push(`/track/?q=${encodeURIComponent(v)}`);
        }}>
          <input name="q" defaultValue={q} placeholder="SL-1001" aria-label="Order or tracking number" required />
          <button className="btn">Track</button>
        </form>

        {q && !o && <p className="alert">No order found for “{q}”.</p>}
        {o && (
          <div className="card">
            <div className="orow"><h2 style={{ margin: 0 }}>{o.id}</h2><span className={`pill ${o.status.toLowerCase()}`}>{o.status}</span></div>
            <hr className="rule" />
            {o.shipment ? (
              <>
                <div className="sum"><span className="muted">Courier</span><span>{o.shipment.courier}</span></div>
                <div className="sum"><span className="muted">Tracking number</span><span>{o.shipment.tracking}</span></div>
                <ol className="timeline">
                  {[...o.shipment.events].reverse().map((e, i) => (
                    <li key={e.label} className={i === 0 ? "now" : ""}><b>{e.label}</b><span>{when(e.at)}</span></li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                {o.status === "Cancelled" ? "This order was cancelled." : "Your order is being prepared. A tracking number appears here when the courier is booked."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><Track /></Suspense>;
}
