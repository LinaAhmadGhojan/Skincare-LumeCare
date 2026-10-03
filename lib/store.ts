"use client";

// Demo state: stock, cart, orders, discount codes, loyalty points and settings.
// Everything lives in the visitor's browser. Nothing is sent to a server.
import { useSyncExternalStore } from "react";
import { BUNDLES, COURIERS, LOYALTY, PAYMENTS, PRODUCTS, SHIPPING, Bundle, BundleDef, BundleEdit, Product, ProductEdit, bundle, bundleHref, product, productHref, syncBundles, syncCatalog, unitPrice } from "./data";
import { seedOrders } from "./seed";

export type Line = { type: "product" | "bundle"; id: string; qty: number };
export type Customer = { name: string; phone: string; email: string; address: string; city: string; payment: string };
export type Shipment = { courier: string; tracking: string; events: { label: string; at: number }[] };
export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Returned" | "Cancelled";
export type Order = {
  id: string; at: number; customer: Customer; lines: Line[];
  subtotal: number; discount: number; pointsUsed: number; codeDiscount: number; code?: string; shipping: number; total: number;
  payment: string; paid: boolean; status: OrderStatus; shipment: Shipment | null; pointsEarned: number;
  bookingError?: string; seed?: boolean; notes?: string[];
};
export type Discount = { code: string; type: "percent" | "fixed"; value: number; min: number; limit: number; uses: number; active: boolean };
export type TrackEvent = { at: number; pixel: string; ga: string; data: Record<string, string | number> };
export type StockMove = { at: number; product: string; delta: number; reason: string };
export type Receipt = { id: string; at: number; supplier: string; product: string; qty: number; cost: number; batch: string; expiry: string };

type State = {
  stock: Record<string, number>; cart: Line[]; orders: Order[];
  payments: Record<string, boolean>; couriers: Record<string, boolean>;
  events: TrackEvent[]; fired: Record<string, boolean>; seq: number;
  points: number; pointsLog: { at: number; text: string; pts: number }[];
  discounts: Discount[]; stockLog: StockMove[]; tracking: { pixel: string; ga: string };
  edits: Record<string, ProductEdit>; receipts: Receipt[]; custom: Product[]; customBundles: BundleDef[]; bundleEdits: Record<string, BundleEdit>;
};

const KEY = "lumecare_demo_v3";

function fresh(): State {
  const orders = seedOrders(Date.now());
  return {
    stock: Object.fromEntries(PRODUCTS.map((p) => [p.id, p.stock])),
    cart: [], orders,
    payments: Object.fromEntries(PAYMENTS.map((p) => [p.id, true])),
    couriers: Object.fromEntries(COURIERS.map((c) => [c.id, true])),
    events: [], fired: {}, seq: 1001 + orders.length,
    points: LOYALTY.startPoints,
    pointsLog: [{ at: 0, text: "Welcome bonus", pts: LOYALTY.startPoints }],
    discounts: [
      { code: "WELCOME10", type: "percent", value: 10, min: 0, limit: 500, uses: 37, active: true },
      { code: "ROUTINE300", type: "fixed", value: 300, min: 3000, limit: 200, uses: 12, active: true },
      { code: "EID20", type: "percent", value: 20, min: 2500, limit: 100, uses: 100, active: false },
    ],
    stockLog: [],
    tracking: { pixel: "", ga: "" },
    edits: {}, custom: [], customBundles: [], bundleEdits: {},
    receipts: [
      { id: "GRN-0012", at: Date.now() - 9 * 86400000, supplier: "LumeCare production unit, Daska", product: "serum", qty: 60, cost: 520, batch: "SER-2609-A", expiry: "2028-09" },
      { id: "GRN-0011", at: Date.now() - 12 * 86400000, supplier: "LumeCare production unit, Daska", product: "cleanser", qty: 120, cost: 310, batch: "CLN-2609-B", expiry: "2028-08" },
    ],
  };
}

// The server render and the first client render both use fresh(); saved data is
// loaded right after hydration so the two renders always match.
let st = fresh();
let version = 0;
const listeners = new Set<() => void>();

function commit() {
  syncCatalog(st.custom || [], st.edits || {});
  syncBundles(st.customBundles || [], st.bundleEdits || {});
  version++;
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* demo still works in memory */ }
  listeners.forEach((l) => l());
}

let hydrated = false;
export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.stock && saved.orders && saved.discounts) st = { ...fresh(), ...saved };
    else st = fresh();
    syncCatalog(st.custom || [], st.edits || {});
    syncBundles(st.customBundles || [], st.bundleEdits || {});
    version++; listeners.forEach((l) => l());
  } catch { /* keep defaults */ }
}

// A cart line is either one product or one bundle. A bundle expands to its components.
export const components = (l: Pick<Line, "type" | "id">) => (l.type === "bundle" ? bundle(l.id).items : [{ id: l.id, qty: 1 }]);
function demand(lines: Line[]) {
  const d: Record<string, number> = {};
  lines.forEach((l) => components(l).forEach((c) => { d[c.id] = (d[c.id] || 0) + c.qty * l.qty; }));
  return d;
}
const fits = (lines: Line[]) => Object.entries(demand(lines)).every(([id, n]) => n <= st.stock[id]);
const moves = (d: Record<string, number>, sign: number, reason: string): StockMove[] =>
  Object.entries(d).map(([id, n]) => ({ at: Date.now(), product: id, delta: sign * n, reason }));

export const linePrice = (l: Pick<Line, "type" | "id">) =>
  l.type === "bundle" ? bundle(l.id).price : unitPrice(product(l.id));

export function lineInfo(l: Line) {
  if (l.type === "bundle") {
    const b = bundle(l.id);
    return { name: b.name, href: bundleHref(b.id), image: product(b.items[0].id).image, focus: product(b.items[0].id).focus,
      sub: b.items.map((it) => product(it.id).name).join(" + ") };
  }
  const p = product(l.id);
  return { name: p.name, href: productHref(p.id), image: p.image, focus: p.focus, sub: p.size };
}

export const isRevenue = (o: Order) => o.status !== "Cancelled" && o.status !== "Returned";
const STEPS = ["Shipment booked", "In transit", "Out for delivery", "Delivered"];

const api = {
  stock: (id: string) => st.stock[id],
  cart: () => st.cart,
  cartCount: () => st.cart.reduce((a, l) => a + l.qty, 0),
  cartFits: () => fits(st.cart),
  orders: () => st.orders,
  myOrders: () => st.orders.filter((o) => !o.seed),
  order: (id: string) => st.orders.find((o) => o.id === id),
  find(q: string) {
    const s = q.trim().toUpperCase();
    return st.orders.find((o) => o.id.toUpperCase() === s || o.shipment?.tracking.toUpperCase() === s);
  },
  points: () => st.points,
  pointsLog: () => st.pointsLog,
  events: () => st.events,
  discounts: () => st.discounts,
  stockLog: () => st.stockLog,
  trackingIds: () => st.tracking,
  receipts: () => st.receipts,
  edited: (id: string) => !!st.edits[id],
  enabled: (kind: "payments" | "couriers", key: string) => !!st[kind][key],

  // A set has no stock of its own: it is limited by the scarcest product inside it.
  bundleAvail(id: string) {
    let min = Infinity, limiter = "";
    bundle(id).items.forEach((it) => {
      const n = Math.floor(st.stock[it.id] / it.qty);
      if (n < min) { min = n; limiter = it.id; }
    });
    return { qty: Math.max(0, min), limiter };
  },

  checkCode(code: string, subtotal: number): { ok: true; d: Discount } | { ok: false; error: string } {
    const d = st.discounts.find((x) => x.code === code.trim().toUpperCase());
    if (!d) return { ok: false, error: "This code does not exist." };
    if (!d.active) return { ok: false, error: "This code is no longer active." };
    if (d.uses >= d.limit) return { ok: false, error: "This code has reached its usage limit." };
    if (subtotal < d.min) return { ok: false, error: `This code needs a minimum order of Rs ${d.min.toLocaleString("en-US")}.` };
    return { ok: true, d };
  },

  totals(usePoints: boolean, code = "") {
    const subtotal = st.cart.reduce((a, l) => a + linePrice(l) * l.qty, 0);
    const chk = code ? api.checkCode(code, subtotal) : null;
    const codeDiscount = chk && chk.ok ? Math.round(chk.d.type === "percent" ? subtotal * chk.d.value / 100 : Math.min(chk.d.value, subtotal)) : 0;
    const after = subtotal - codeDiscount;
    const pointsUsed = usePoints ? Math.min(st.points, Math.floor(after / LOYALTY.pointValue)) : 0;
    const discount = pointsUsed * LOYALTY.pointValue;
    const shipping = subtotal === 0 || subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.flat;
    return { subtotal, codeDiscount, codeError: chk && !chk.ok ? chk.error : "", pointsUsed, discount, shipping, total: after - discount + shipping };
  },

  add(type: Line["type"], id: string, qty: number) {
    const lines = st.cart.map((l) => ({ ...l }));
    const hit = lines.find((l) => l.type === type && l.id === id);
    if (hit) hit.qty += qty; else lines.push({ type, id, qty });
    if (!fits(lines)) return false;
    st = { ...st, cart: lines };
    const name = type === "bundle" ? bundle(id).name : product(id).name;
    api.track("AddToCart", "add_to_cart", { item: name, quantity: qty, value: linePrice({ type, id }) * qty, currency: "PKR" });
    return true;
  },

  setQty(i: number, qty: number) {
    const lines = st.cart.map((l) => ({ ...l }));
    if (!lines[i]) return true;
    if (qty <= 0) lines.splice(i, 1); else lines[i].qty = qty;
    if (!fits(lines)) return false;
    st = { ...st, cart: lines }; commit();
    return true;
  },

  placeOrder(customer: Customer, paid: boolean, usePoints: boolean, code = "") {
    if (!st.cart.length || !fits(st.cart)) return null;
    const t = api.totals(usePoints, code), d = demand(st.cart);
    const stock = { ...st.stock };
    Object.entries(d).forEach(([id, n]) => { stock[id] -= n; });
    const id = `SL-${st.seq}`;
    const order: Order = {
      id, at: Date.now(), customer, lines: st.cart,
      subtotal: t.subtotal, discount: t.discount, pointsUsed: t.pointsUsed, codeDiscount: t.codeDiscount,
      code: t.codeDiscount ? code.trim().toUpperCase() : undefined, shipping: t.shipping, total: t.total,
      payment: customer.payment, paid, status: "Pending", shipment: null, pointsEarned: 0,
    };
    const pointsLog = t.pointsUsed ? [{ at: Date.now(), text: `Redeemed on ${id}`, pts: -t.pointsUsed }, ...st.pointsLog] : st.pointsLog;
    const discounts = order.code ? st.discounts.map((x) => (x.code === order.code ? { ...x, uses: x.uses + 1 } : x)) : st.discounts;
    st = { ...st, stock, cart: [], orders: [order, ...st.orders], seq: st.seq + 1, points: st.points - t.pointsUsed, pointsLog, discounts,
      stockLog: [...moves(d, -1, `Order ${id}`), ...st.stockLog].slice(0, 80) };
    commit();
    return order;
  },

  update(id: string, fn: (o: Order) => void) {
    st = { ...st, orders: st.orders.map((o) => { if (o.id !== id) return o; const c = structuredClone(o); fn(c); return c; }) };
  },

  confirm(id: string) {
    if (api.order(id)?.status !== "Pending") return;
    api.update(id, (o) => { o.status = "Confirmed"; }); commit();
  },

  book(id: string, courierId: string) {
    const c = COURIERS.find((x) => x.id === courierId), cur = api.order(id);
    if (!c || cur?.status !== "Confirmed") return false;
    // A rejected booking keeps the order where it is and records why, so nothing is lost.
    if (c.noService.includes(cur.customer.city)) {
      api.update(id, (o) => { o.bookingError = `${c.name} does not deliver to ${cur.customer.city}. Choose another courier.`; });
      commit();
      return false;
    }
    const n = String(Math.floor(100000000 + Math.random() * 900000000));
    api.update(id, (o) => {
      o.shipment = { courier: c.name, tracking: c.prefix + n, events: [{ label: STEPS[0], at: Date.now() }] };
      o.status = "Shipped"; o.bookingError = undefined;
    });
    commit();
    return true;
  },

  advance(id: string) {
    const cur = api.order(id);
    if (!cur?.shipment || cur.status !== "Shipped") return;
    const next = STEPS[cur.shipment.events.length];
    let earned = 0;
    api.update(id, (o) => {
      o.shipment!.events.push({ label: next, at: Date.now() });
      if (next === "Delivered") {
        o.status = "Delivered"; o.paid = true;
        // Points are added on delivery, not when the order is placed, so returned COD orders earn nothing.
        if (!o.seed) earned = o.pointsEarned = Math.floor((o.subtotal - o.codeDiscount - o.discount) / 100) * LOYALTY.earnPer100;
      }
    });
    if (earned) st = { ...st, points: st.points + earned, pointsLog: [{ at: Date.now(), text: `Earned on ${id}`, pts: earned }, ...st.pointsLog] };
    commit();
  },

  // Parcel refused or undelivered: stock goes back, COD is not collected, no points are earned.
  markReturned(id: string) {
    const o = api.order(id);
    if (!o?.shipment || o.status !== "Shipped") return;
    api.restock(o, `Return ${id}`);
    api.update(id, (x) => { x.status = "Returned"; x.shipment!.events.push({ label: "Returned to sender", at: Date.now() }); });
    commit();
  },

  cancel(id: string) {
    const o = api.order(id);
    if (!o || (o.status !== "Pending" && o.status !== "Confirmed")) return;
    api.restock(o, `Cancelled ${id}`);
    api.update(id, (x) => { x.status = "Cancelled"; }); commit();
  },

  restock(o: Order, reason: string) {
    const d = demand(o.lines), stock = { ...st.stock };
    Object.entries(d).forEach(([pid, n]) => { stock[pid] += n; });
    st = { ...st, stock, stockLog: [...moves(d, 1, reason), ...st.stockLog].slice(0, 80) };
    if (o.pointsUsed) st = { ...st, points: st.points + o.pointsUsed,
      pointsLog: [{ at: Date.now(), text: `Returned from ${o.id}`, pts: o.pointsUsed }, ...st.pointsLog] };
  },

  addNote(id: string, text: string) {
    api.update(id, (o) => { o.notes = [...(o.notes || []), text]; }); commit();
  },

  // First set that the bag already holds part of, as single products.
  upsell() {
    return BUNDLES.find((b) => b.active !== false && api.bundleAvail(b.id).qty > 0 && !st.cart.some((l) => l.type === "bundle" && l.id === b.id)
      && b.items.some((it) => st.cart.some((l) => l.type === "product" && l.id === it.id)));
  },
  // Replace the single products with the set they belong to.
  upgrade(bundleId: string) {
    let lines = st.cart.map((l) => ({ ...l }));
    bundle(bundleId).items.forEach((it) => {
      const l = lines.find((x) => x.type === "product" && x.id === it.id);
      if (l) l.qty -= Math.min(l.qty, it.qty);
    });
    lines = lines.filter((l) => l.qty > 0);
    lines.push({ type: "bundle", id: bundleId, qty: 1 });
    if (!fits(lines)) return false;
    st = { ...st, cart: lines }; commit();
    return true;
  },

  adjust(id: string, delta: number) {
    if (st.stock[id] + delta < 0) return;
    st = { ...st, stock: { ...st.stock, [id]: st.stock[id] + delta },
      stockLog: [{ at: Date.now(), product: id, delta, reason: delta > 0 ? "New stock received" : "Manual correction" }, ...st.stockLog].slice(0, 80) };
    commit();
  },
  toggle(kind: "payments" | "couriers", key: string) {
    st = { ...st, [kind]: { ...st[kind], [key]: !st[kind][key] } }; commit();
  },
  addDiscount(d: Omit<Discount, "uses" | "active">) {
    if (st.discounts.some((x) => x.code === d.code)) return false;
    st = { ...st, discounts: [{ ...d, uses: 0, active: true }, ...st.discounts] }; commit();
    return true;
  },
  toggleDiscount(code: string) {
    st = { ...st, discounts: st.discounts.map((x) => (x.code === code ? { ...x, active: !x.active } : x)) }; commit();
  },
  setTracking(ids: { pixel: string; ga: string }) { st = { ...st, tracking: ids }; commit(); },

  updateProduct(id: string, edit: ProductEdit) {
    st = { ...st, edits: { ...st.edits, [id]: { ...(st.edits[id] || {}), ...edit } } }; commit();
  },
  resetProduct(id: string) {
    const edits = { ...st.edits }; delete edits[id];
    st = { ...st, edits }; commit();
  },

  // Bundles: created, edited and paused from the back office.
  addBundle(d: BundleDef) { st = { ...st, customBundles: [...st.customBundles, d] }; commit(); },
  updateBundle(id: string, edit: BundleEdit) {
    const isNew = st.customBundles.some((b) => b.id === id);
    if (isNew) st = { ...st, customBundles: st.customBundles.map((b) => (b.id === id ? { ...b, ...edit } as BundleDef : b)) };
    else st = { ...st, bundleEdits: { ...st.bundleEdits, [id]: { ...(st.bundleEdits[id] || {}), ...edit } } };
    commit();
  },
  resetBundle(id: string) { const e = { ...st.bundleEdits }; delete e[id]; st = { ...st, bundleEdits: e }; commit(); },
  bundleEdited: (id: string) => !!st.bundleEdits[id],

  // A product created in the back office. It is sold, stocked and edited like the built-in ones.
  addProduct(p: Product, stock: number) {
    st = { ...st, custom: [...st.custom, p], stock: { ...st.stock, [p.id]: stock },
      stockLog: stock ? [{ at: Date.now(), product: p.id, delta: stock, reason: "Opening stock" }, ...st.stockLog].slice(0, 80) : st.stockLog };
    commit();
  },

  // Goods received from a supplier: stock goes up and the batch is recorded.
  receive(r: Omit<Receipt, "id" | "at">) {
    const id = `GRN-${String(13 + st.receipts.length - 2).padStart(4, "0")}`;
    st = { ...st, stock: { ...st.stock, [r.product]: st.stock[r.product] + r.qty },
      receipts: [{ ...r, id, at: Date.now() }, ...st.receipts],
      stockLog: [{ at: Date.now(), product: r.product, delta: r.qty, reason: `${id} from ${r.supplier.split(",")[0]}` }, ...st.stockLog].slice(0, 80) };
    commit();
    return id;
  },

  track(pixel: string, ga: string, data: TrackEvent["data"] = {}) {
    st = { ...st, events: [{ at: Date.now(), pixel, ga, data }, ...st.events].slice(0, 30) }; commit();
  },
  // The purchase event must be sent once per order, even if the confirmation page is reloaded.
  firePurchaseOnce(o: Order) {
    if (st.fired[o.id]) return;
    st = { ...st, fired: { ...st.fired, [o.id]: true } };
    api.track("Purchase", "purchase", { order: o.id, value: o.total, currency: "PKR" });
  },

  reset() { syncCatalog([], {}); syncBundles([], {}); st = fresh(); commit(); },
};

// Every change loads the saved data first, so an early change can never overwrite it.
const MUTATORS = ["add", "setQty", "placeOrder", "confirm", "book", "advance", "markReturned", "cancel", "addNote", "upgrade",
  "adjust", "toggle", "addDiscount", "toggleDiscount", "setTracking", "updateProduct", "resetProduct", "receive", "addProduct", "addBundle", "updateBundle", "resetBundle", "track", "firePurchaseOnce", "reset"] as const;
MUTATORS.forEach((k) => {
  const fn = api[k] as (...a: unknown[]) => unknown;
  (api as Record<string, unknown>)[k] = (...a: unknown[]) => { hydrate(); return fn(...a); };
});

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

// Re-renders the calling component whenever the demo state changes.
export function useStore() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return api;
}
