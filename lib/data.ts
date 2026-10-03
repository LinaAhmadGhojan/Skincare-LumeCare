// Demo data. Product names, sizes, prices and bundles follow what LumeCare publishes on thelumecare.com.
// Photos are licensed stock images, and reviews and orders are sample data for the demo.

export type Review = { name: string; rating: number; date: string; text: string; verified: boolean };

export type Product = {
  id: string;
  name: string;
  kind: string;
  category: string;
  sku: string;
  weight: number; // grams, used on the shipping label
  size: string;
  price: number;
  sale?: number;
  stock: number;
  image: string;
  focus: string; // object-position for cropped tiles
  short: string;
  benefits: string[];
  actives: string[];
  ingredients: string;
  usage: string;
  precautions: string;
  reviews: Review[];
};

export type Bundle = {
  id: string;
  name: string;
  extra: number; // extra % off on top of each product's own sale price
  short: string;
  steps: string[];
  active?: boolean; // false = hidden from the store
  items: { id: string; qty: number }[];
  price: number;
};

export const BRAND = "LumeCare";
// Who the demo is prepared for. Shown on the brief page and in the top ribbon.
export const CLIENT = "LumeCare";
export const CURRENCY = "Rs";
export const SHIPPING = { flat: 250, freeOver: 3500 };
// 5 points per Rs 100 spent, 1 point = Rs 1 off
export const LOYALTY = { earnPer100: 5, pointValue: 1, startPoints: 150 };

export const PAYMENTS = [
  { id: "cod", name: "Cash on Delivery", note: "Pay the courier when your order arrives." },
  { id: "jazzcash", name: "JazzCash", note: "Pay from your JazzCash wallet." },
  { id: "easypaisa", name: "Easypaisa", note: "Pay from your Easypaisa wallet." },
  { id: "card", name: "Debit / Credit Card", note: "Visa and Mastercard through a local gateway." },
];

export const COURIERS = [
  // noService is demo data: it lets the admin preview show what happens when a courier rejects a booking.
  { id: "tcs", name: "TCS", prefix: "TCS", noService: [] as string[] },
  { id: "leopards", name: "Leopards", prefix: "LP", noService: ["Abbottabad"] },
  { id: "postex", name: "PostEx", prefix: "PX", noService: ["Quetta", "Sukkur"] },
];

export const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta",
  "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Sukkur", "Daska",
];

const INGREDIENTS = "The full ingredient list is managed from the admin panel and shown here for each product.";
const PRECAUTIONS = "For external use only. Patch test before first use and stop if irritation occurs.";

export const PRODUCTS: Product[] = [
  {
    id: "cleanser", name: "Hydrating Cleanser", kind: "Cleanser", category: "Face care", sku: "LC-CLN-100", weight: 140, size: "100 ml",
    price: 1570, sale: 1099, stock: 40, image: "/img/facewash.jpg", focus: "50% 40%",
    short: "Deep hydration, barrier support, radiant skin.",
    benefits: ["Cleanses without leaving skin tight", "Supports the skin barrier", "For morning and evening use"],
    actives: ["AHA", "Vitamin B3", "Glutathione"],
    ingredients: INGREDIENTS,
    usage: "Massage a small amount onto damp skin for 30 seconds, then rinse. Use morning and evening.",
    precautions: PRECAUTIONS,
    reviews: [
      { name: "Sana R.", rating: 5, date: "03 Sep 2026", text: "Gentle, and my face does not feel dry after washing.", verified: true },
      { name: "Bilal A.", rating: 4, date: "19 Aug 2026", text: "Works well in summer when my skin gets oily.", verified: true },
    ],
  },
  {
    id: "serum", name: "Radiant Renewal Serum", kind: "Serum", category: "Face care", sku: "LC-SER-030", weight: 90, size: "30 ml",
    price: 2426, sale: 1699, stock: 6, image: "/img/serum.jpg", focus: "70% 50%",
    short: "Niacinamide and hyaluronic acid, for tone and hydration.",
    benefits: ["Targets uneven tone and dullness", "Lightweight hydration", "Layers under cream"],
    actives: ["Vitamin C", "Retinol", "Vitamin B3"],
    ingredients: INGREDIENTS,
    usage: "Apply 3 to 4 drops to clean skin before cream. Use sunscreen during the day.",
    precautions: PRECAUTIONS,
    reviews: [
      { name: "Maryam S.", rating: 5, date: "15 Sep 2026", text: "My skin tone looks more even after a few weeks.", verified: true },
      { name: "Zainab T.", rating: 5, date: "01 Sep 2026", text: "Absorbs quickly and has no strong smell.", verified: true },
      { name: "Omar F.", rating: 4, date: "22 Aug 2026", text: "A few drops are enough, so it lasts.", verified: true },
    ],
  },
  {
    id: "radiance-cream", name: "Radiance Cream", kind: "Moisturiser", category: "Face care", sku: "LC-CRM-050", weight: 110, size: "50 g",
    price: 1998, sale: 1399, stock: 24, image: "/img/night-cream.jpg", focus: "72% 60%",
    short: "Comforting moisture for a smooth, polished finish.",
    benefits: ["Comforting daily moisture", "Smooth, polished finish", "The last step of the routine"],
    actives: ["Glutathione", "Alpha-Arbutin", "Vitamin C"],
    ingredients: INGREDIENTS,
    usage: "Smooth over face and neck after serum, morning and evening.",
    precautions: PRECAUTIONS,
    reviews: [
      { name: "Ayesha K.", rating: 5, date: "12 Sep 2026", text: "Soft finish and it does not feel greasy.", verified: true },
      { name: "Hira M.", rating: 4, date: "28 Aug 2026", text: "Good for daily use, the jar lasts a long time.", verified: true },
    ],
  },
  {
    id: "hand-foot", name: "Renewing Hand & Foot Cream", kind: "Body care", category: "Body care", sku: "LC-HFC-050", weight: 95, size: "50 g",
    price: 1426, sale: 999, stock: 18, image: "/img/hand-feet.jpg", focus: "50% 35%",
    short: "For hands and feet — smooth, even skin.",
    benefits: ["Softens rough hands and heels", "Helps even out skin", "Non-greasy finish"],
    actives: ["Glycerin", "Glutathione", "Alpha-Arbutin"],
    ingredients: INGREDIENTS,
    usage: "Massage into hands and feet twice a day. For heels, apply at night.",
    precautions: PRECAUTIONS,
    reviews: [
      { name: "Nadia H.", rating: 5, date: "08 Sep 2026", text: "My heels feel much softer.", verified: true },
      { name: "Farah J.", rating: 4, date: "25 Aug 2026", text: "Nice texture and not sticky.", verified: true },
    ],
  },
];

export const CATEGORIES = ["Face care", "Body care"];
export const SUPPLIERS = ["LumeCare production unit, Daska", "Packaging supplier, Sialkot", "Contract manufacturer, Lahore"];

// Fields the back office can edit. Saved edits are applied on top of the defaults above.
export type ProductEdit = Partial<Pick<Product, "name" | "price" | "sale" | "category" | "short" | "actives" | "ingredients" | "usage" | "precautions" | "image" | "size" | "kind">>;
const DEFAULTS = new Map(PRODUCTS.map((p) => [p.id, { ...p, actives: [...p.actives] }]));
// Products added from the back office are kept in state; this puts them (and the edits) into the live catalogue.
export function syncCatalog(custom: Product[], edits: Record<string, ProductEdit>) {
  for (let i = PRODUCTS.length - 1; i >= 0; i--) if (!DEFAULTS.has(PRODUCTS[i].id)) PRODUCTS.splice(i, 1);
  custom.forEach((c) => PRODUCTS.push({ ...c, actives: [...c.actives], reviews: [...c.reviews] }));
  PRODUCTS.forEach((p) => Object.assign(p, DEFAULTS.get(p.id) || {}, edits[p.id] || {}));
}
export const isCustom = (id: string) => !DEFAULTS.has(id);
// Built-in products have their own page; products added later open through one shared page.
export const productHref = (id: string) => (isCustom(id) ? `/item/?id=${id}` : `/product/${id}/`);

export const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;
export const unitPrice = (p: Product) => p.sale ?? p.price;

// Bundle price = each product's sale price, then the bundle's extra % off on top (as on thelumecare.com).
// One place computes a bundle's price: each product's current sale price, then the bundle's extra % off.
export type BundleDef = Omit<Bundle, "price">;
export type BundleEdit = Partial<Pick<Bundle, "name" | "short" | "extra" | "items" | "active" | "steps">>;
const priced = (b: BundleDef): Bundle => {
  const items = b.items.filter((it) => PRODUCTS.some((p) => p.id === it.id));
  return {
    ...b, items,
    steps: b.steps.length === items.length ? b.steps : items.map((it) => product(it.id).kind),
    price: Math.ceil(items.reduce((a, it) => a + unitPrice(product(it.id)) * it.qty, 0) * (1 - b.extra / 100)),
  };
};

export const BUNDLES: Bundle[] = [
  priced({
    id: "complete-routine", name: "The Complete Routine", extra: 8,
    short: "All four products, from the first cleanse to the final layer of cream.",
    steps: ["Cleanse", "Treat", "Moisturise", "Hands & feet"],
    items: [{ id: "cleanser", qty: 1 }, { id: "serum", qty: 1 }, { id: "radiance-cream", qty: 1 }, { id: "hand-foot", qty: 1 }],
  }),
  priced({
    id: "everyday-trio", name: "The Everyday Trio", extra: 5,
    short: "Cleanser, serum and hand & foot cream for an easy daily routine.",
    steps: ["Cleanse", "Treat", "Hands & feet"],
    items: [{ id: "cleanser", qty: 1 }, { id: "serum", qty: 1 }, { id: "hand-foot", qty: 1 }],
  }),
];

const DEF_BUNDLES: BundleDef[] = BUNDLES.map(({ price, ...b }) => ({ ...b, items: b.items.map((i) => ({ ...i })), steps: [...b.steps] }));

// Bundles created in the back office live in state; this rebuilds the live list (and re-prices it) from defaults, custom bundles and edits.
export function syncBundles(custom: BundleDef[], edits: Record<string, BundleEdit>) {
  const base = [...DEF_BUNDLES, ...custom].map((d) => priced({ ...d, items: d.items.map((i) => ({ ...i })), ...(edits[d.id] || {}) }));
  BUNDLES.splice(0, BUNDLES.length, ...base);
}
export const isCustomBundle = (id: string) => !DEF_BUNDLES.some((b) => b.id === id);
// Built-in bundles have their own page; bundles created later open through one shared page.
export const bundleHref = (id: string) => (isCustomBundle(id) ? `/bundle/?id=${id}` : `/set/${id}/`);
export const liveBundles = () => BUNDLES.filter((b) => b.active !== false);

export const bundle = (id: string) => BUNDLES.find((b) => b.id === id)!;
export const rating = (p: Product) => (p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0);
// Saving against the regular (pre-sale) prices, which is how the store presents bundle savings.
export const bundleSaving = (b: Bundle) =>
  b.items.reduce((a, it) => a + product(it.id).price * it.qty, 0) - b.price;
export const bundleRegular = (b: Bundle) => b.items.reduce((a, it) => a + product(it.id).price * it.qty, 0);

export const money = (n: number) => `${CURRENCY} ${Math.round(n).toLocaleString("en-US")}`;
export const asset = (path: string) => (path.startsWith("data:") ? path : (process.env.NEXT_PUBLIC_BASE_PATH || "") + path);
