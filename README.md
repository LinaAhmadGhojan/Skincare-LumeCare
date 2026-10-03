# Solenne – concept skincare store (AtlasDev demo)

A concept demo built with Next.js. The brand, products and reviews are fictional.
There is no backend: stock, orders and points are stored in the visitor's browser.

## Run locally

    npm install
    npm run dev

## Build for hosting

    npm run build

The static site is written to `out/`. Upload the contents of `out/` to the hosting root.

If the site is served from a sub-folder (for example `example.com/demo`), build with the folder name:

    # PowerShell
    $env:NEXT_PUBLIC_BASE_PATH = "/demo"; npm run build

## Where things are

- `lib/data.ts` – brand name, products, sets, payment methods, couriers
- `lib/store.ts` – stock, bag, orders, points (set stock is calculated from the products inside it)
- `app/` – pages: home, shop, product, set, cart, checkout, order, track, account, admin
- `public/img/` – photos from Unsplash (Unsplash License)
