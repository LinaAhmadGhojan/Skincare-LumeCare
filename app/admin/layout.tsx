"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/data";
import { hydrate, useStore } from "@/lib/store";
import { ui } from "@/lib/ui";

const NAV = [
  { href: "/admin/", label: "Dashboard", icon: "M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z" },
  { href: "/admin/orders/", label: "Orders", icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" },
  { href: "/admin/products/", label: "Products", icon: "M20 7h-9M14 17H5M17 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { href: "/admin/bundles/", label: "Bundles", icon: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5" },
  { href: "/admin/inventory/", label: "Inventory", icon: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" },
  { href: "/admin/customers/", label: "Customers", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" },
  { href: "/admin/discounts/", label: "Discount codes", icon: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01" },
  { href: "/admin/settings/", label: "Payments & couriers", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
];

function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const S = useStore(), path = usePathname();
  // Order history is created in the browser, so the back office renders after the page loads.
  const [ready, setReady] = useState(false);
  useEffect(() => { hydrate(); setReady(true); }, []);
  const toConfirm = ready ? S.orders().filter((o) => o.status === "Pending").length : 0;
  const active = (href: string) => (href === "/admin/" ? path === "/admin" || path === "/admin/" : path.startsWith(href.slice(0, -1)));

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link className="adm-logo" href="/admin/"><i aria-hidden="true" />{BRAND}<small>Back office</small></Link>
        <nav aria-label="Back office">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={active(n.href) ? "on" : ""}>
              <Icon d={n.icon} /><span>{n.label}</span>
              {n.label === "Orders" && toConfirm > 0 && <b>{toConfirm}</b>}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link href="/">← View store</Link>
          <Link href="/brief/">Your brief, answered</Link>
          <button onClick={() => { S.reset(); ui.toast("Demo data reset"); }}>Reset demo data</button>
          <p>Concept demo by AtlasDev. Orders are sample data.</p>
        </div>
      </aside>
      <div className="adm-main">
        {ready ? children : <div className="adm-loading">Loading back office…</div>}
      </div>
    </div>
  );
}
