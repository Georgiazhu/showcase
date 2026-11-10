# Showcase · Cyndi Global

The **product proposal showcase** for Cyndi Global, built on the Kotis Design showcase framework
(category groups + product cards + colour swatches + lightbox + tiered pricing).

Live URL: <https://www.cyndiglobal.com/showcase/>

> **Sign-in required.** The showcase is gated — visitors must sign in before any product content loads.
> It uses the main site's customer accounts (email or username + password); an account needs
> "Showcase access", which admins grant in `/admin/customers.html` on the main site. The server
> validates the session too, so the data cannot be fetched by hitting the API directly.

**Ordering.** The cart lives in `localStorage` until the buyer confirms. "Confirm order" asks for
contact details (name and email required) and posts only product / colour / size / quantity to
`POST /api/showcase/orders` on the main site, which checks the session, enforces MOQ, prices every
line from the product's tier pricing on the server and stores a real `SC-YYYYMMDD-XXXXXX` order in
the shared `orders` table. The order page and "Previous orders" are loaded from
`GET /api/showcase/orders`. The "Orders" button in the header lists the orders placed with your own
account with their status, and "Find an order" looks one up by its `SC-` number; the
order page shows a status progress bar (Pending → Processing → Shipped → In transit → Delivered, or
Cancelled) and a Refresh action that picks up status changes made in the admin Orders module.

---

## Quick start

```bash
npm install
npm run dev      # local dev on http://localhost:5174/showcase/
npm run build    # output to dist/
npm run preview  # preview the build
```

---

## Layout

```
showcase/
├── index.html                 entry HTML
├── vite.config.js             build config (base = /showcase/)
├── public/
│   ├── favicon.svg
│   └── images/products/       ← product images live here
│       ├── canvas-totes/
│       ├── squeeze-bottles/
│       └── drinkware/
└── src/
    ├── main.jsx
    ├── App.jsx                page assembly + sign-in gate
    ├── index.css              brand tokens + Kotis-flavoured component styles
    ├── data/
    │   ├── showcase.json       ← content source (seed data)
    │   ├── schema.json        field reference
    │   ├── loadShowcase.js    API loader (falls back to the local JSON)
    │   └── session.js         sign-in / sign-out / session check
    └── components/
        ├── ShowcaseNav.jsx     top navigation + category anchors
        ├── ShowcaseHeader.jsx  SHOWCASE header + project intro
        ├── ShowcaseLogin.jsx   sign-in page
        ├── ProductCard.jsx     product card (Kotis quote-detail-wrapper)
        ├── ProductImage.jsx    image with placeholder fallback
        ├── ColorSwatches.jsx   colour swatches + "show more"
        └── GalleryModal.jsx    image lightbox
```

---

## Adding products

Two steps — no component code to touch.

### 1. Add the images

Drop them into `public/images/products/<category-id>/`:

```
public/images/products/canvas-totes/legacy-tote.jpg
```

### 2. Update the data file

Edit `src/data/showcase.json` and append an entry to the relevant category's `products` array:

```json
{
  "id": "cy-tote-003",
  "sku": "T3265272",
  "name": "Heritage Supply Co. Weekender Tote",
  "description": "One-line product description.",
  "features": ["Feature one", "Feature two"],
  "materials": "210D rPET/PU Canvas",
  "image": "/showcase/images/products/canvas-totes/weekender.jpg",
  "gallery": ["/showcase/images/products/canvas-totes/weekender.jpg"],
  "colors": [
    { "name": "Black", "hex": "#1c1917", "image": "/showcase/images/products/canvas-totes/weekender.jpg" }
  ],
  "sizes": ["15\"L x 16\"H x 5\"W"],
  "pricing": [
    { "quantity": 300, "price": 42.5 },
    { "quantity": 500, "price": 39.8 }
  ],
  "priceIncludes": "1-color heat transfer imprint, 1 location.",
  "priceNotes": ["Pre tax. Pre shipping"],
  "currency": "$"
}
```

Note the `/showcase/` prefix on image paths — the site is served from that sub-path.

**New category:** append `{ "id": "category-id", "name": "Category Name", "products": [...] }` to
`categories`, and create the matching folder under `public/images/products/`.

---

## Field reference

| Field | Notes | Required |
|---|---|---|
| `id` | Unique product id | ✅ |
| `sku` | SKU / item number | ✅ |
| `name` | Product name | ✅ |
| `description` | Product description | |
| `features[]` | Feature bullets | |
| `materials` | Materials | |
| `image` | Main image URL | ✅ |
| `gallery[]` | Gallery URLs — the main image opens the lightbox | |
| `colors[]` | `{name, hex, image}` — beyond 8 they collapse behind "show more" | |
| `sizes[]` | Sizes | |
| `pricing[]` | `{quantity, price}` — a single tier renders as Quantity/Price rows | ✅ |
| `priceIncludes` | Decoration included in the price | |
| `priceNotes[]` | Price notes | |
| `currency` | `$` / `¥` / `€` | |

Full details also live in `src/data/schema.json`.

---

## Editing without touching code

Everything above is also editable in the admin console:

**<https://www.cyndiglobal.com/admin/showcase.html>** — categories, products, images, colours,
sizes, tiered pricing and the page header. Saves take effect immediately; no rebuild needed.

That console uses the main site's admin account (`admin`), separate from the showcase sign-in account.

---

## Interaction notes (mirrors Kotis)

- **Category groups** — each with an `<h2>` and a 2px underline; the top nav jumps between them
- **Product cards** — 1/2/3/4 column responsive grid
- **Start a Project** — fades in under the thumbnail on hover and opens a pre-filled enquiry email
- **Colour swatches** — clicking one swaps the main image; more than 8 collapse behind "show more"
- **Lightbox** — click the main image; ← → to navigate, Esc to close
- **Tiered pricing** — multiple tiers render as a table, a single tier as Quantity / Price rows
- **Image placeholder** — shows "Image pending" instead of an empty block when art is missing

---

## Deployment

The build output is static and is published to `www.cyndiglobal.com/showcase/`.

The main site repository `HRT/cyndi-global-website` pulls this repo during its own build and
copies the result into `product-showcase/dist/showcase/`. See `SHOWCASE_DEPLOY.md`.
