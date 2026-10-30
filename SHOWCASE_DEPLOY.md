# Showcase deployment notes

This repo (`HRT/showcase`) is the **standalone source** for the Cyndi Global product showcase.
Live URL: <https://www.cyndiglobal.com/showcase/>

---

## Architecture

```
HRT/showcase                          HRT/cyndi-global-website
(source + content for the showcase) ──▶  (main site — Cloudflare Pages source repo)
                                             │
                                             ├─ product-showcase/  landing page + shop
                                             └─ showcase/          ← build output of this repo
```

The main site's build script pulls this repo, builds it and copies the result into
`product-showcase/dist/showcase/`, so pushing here updates the live site on the next main-site build.

---

## Daily update flow

1. Edit `src/data/showcase.json` and add images under `public/images/products/<category-id>/`
2. `git push origin main`
3. Wait for the main site to rebuild (1–3 minutes)
4. Open <https://www.cyndiglobal.com/showcase/> and sign in to confirm

> If the live site has not picked it up, trigger a rebuild from the Cloudflare dashboard:
> Pages → `cyndiglobal` → Deployments → **Retry deployment**.

Most day-to-day edits do not need a rebuild at all — the admin console
(`/admin/showcase.html`) writes straight to D1 and takes effect immediately.

---

## Main-site build script

`scripts/build_showcase.mjs` in the main site repository:

1. Clones this repo into a temp directory
2. `npm ci && npm run build`
3. Copies the output into `product-showcase/dist/showcase/`
4. If the clone fails (network, repo transfer pending), the main build still succeeds and keeps the
   previous artefact

The clone URL falls back across `HRT/showcase` → `Georgiazhu/showcase`, so a repository transfer
never blocks the build.

---

## Local development

```bash
# terminal 1 — main site
cd cyndi-global-website/product-showcase && npm run dev

# terminal 2 — showcase standalone
cd showcase && npm run dev     # http://localhost:5174/showcase/
```

---

## Notes

- `base: '/showcase/'` in `vite.config.js` **must not change** — every asset path depends on it.
- Product images: prefer `.webp` or `.jpg`, keep each under ~300KB.
- When adding a category, add it to `categories` in `src/data/showcase.json` **and** create the
  matching folder under `public/images/products/`.
