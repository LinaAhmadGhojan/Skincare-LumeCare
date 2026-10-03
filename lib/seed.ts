// Sample order history so the admin dashboard has something to show on first visit.
// Deterministic (same orders on every reset), spread over the last 14 days.
import { BUNDLES, COURIERS, PRODUCTS, SHIPPING, unitPrice } from "./data";
import type { Line, Order, OrderStatus } from "./store";

const NAMES = ["Ayesha Khan", "Bilal Ahmed", "Hira Malik", "Usman Tariq", "Sana Rafiq", "Zainab Shah", "Omar Farooq", "Maryam Iqbal",
  "Fatima Noor", "Ali Raza", "Mahnoor Butt", "Hamza Siddiqui", "Areeba Javed", "Saad Qureshi", "Iqra Aslam", "Nimra Yousaf",
  "Hassan Ali", "Kiran Abbas", "Danish Mirza", "Rabia Anwar"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Sialkot", "Gujranwala", "Peshawar", "Daska"];
const PAY = ["cod", "cod", "cod", "cod", "jazzcash", "easypaisa", "card"];

function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function seedOrders(now: number, count = 36): Order[] {
  const r = rng(7), pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const DAY = 86400000, out: Order[] = [];
  for (let i = 0; i < count; i++) {
    const age = (1 - i / count) * 13.5 * DAY + r() * DAY * 0.4;
    const at = now - age, days = age / DAY;
    const lines: Line[] = r() < 0.38
      ? [{ type: "bundle", id: pick(BUNDLES).id, qty: 1 }]
      : [{ type: "product", id: PRODUCTS[(i * 3 + Math.floor(r() * 2)) % PRODUCTS.length].id, qty: r() < 0.2 ? 2 : 1 },
        ...(r() < 0.35 ? [{ type: "product" as const, id: PRODUCTS[(i + 1) % PRODUCTS.length].id, qty: 1 }] : [])];
    const merged: Line[] = [];
    lines.forEach((l) => { const m = merged.find((x) => x.type === l.type && x.id === l.id); if (m) m.qty += l.qty; else merged.push({ ...l }); });
    const subtotal = merged.reduce((a, l) => a + (l.type === "bundle" ? BUNDLES.find((b) => b.id === l.id)!.price : unitPrice(PRODUCTS.find((p) => p.id === l.id)!)) * l.qty, 0);
    const shipping = subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.flat;
    const payment = pick(PAY), name = NAMES[i % NAMES.length], city = pick(CITIES);

    let status: OrderStatus;
    const x = r();
    if (days > 5) status = x < 0.8 ? "Delivered" : x < 0.92 ? "Returned" : "Cancelled";
    else if (days > 2) status = x < 0.45 ? "Delivered" : x < 0.85 ? "Shipped" : "Returned";
    else status = x < 0.35 ? "Pending" : x < 0.65 ? "Confirmed" : "Shipped";
    if (status === "Returned" && payment !== "cod") status = "Delivered";

    const c = pick(COURIERS);
    const steps = ["Shipment booked", "In transit", "Out for delivery", "Delivered"];
    let shipment = null;
    if (status === "Shipped" || status === "Delivered" || status === "Returned") {
      const n = status === "Shipped" ? 1 + Math.floor(r() * 2) : status === "Delivered" ? 4 : 2;
      const events = steps.slice(0, n).map((label, k) => ({ label, at: at + (k + 1) * DAY * 0.6 }));
      if (status === "Returned") events.push({ label: "Returned to sender", at: at + 3 * DAY });
      shipment = { courier: c.name, tracking: c.prefix + String(Math.floor(100000000 + r() * 900000000)), events };
    }
    const digits = String(Math.floor(1000000 + r() * 8999999));
    out.push({
      id: `SL-${1001 + i}`, at, seed: true, lines: merged,
      customer: { name, phone: `03${10 + Math.floor(r() * 39)}-${digits}`, email: "", address: "Sample address", city, payment },
      subtotal, discount: 0, pointsUsed: 0, codeDiscount: 0, shipping, total: subtotal + shipping,
      payment, paid: payment !== "cod" || status === "Delivered", status, shipment, pointsEarned: 0,
    });
  }
  return out.reverse();
}
