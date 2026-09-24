# House of Vivian Exotica

Static fragrance showcase. Existing product names, prices, notes, crest and brand story are retained. No checkout, cart, order processing or enquiry backend is implemented.

## Local preview

Run `npm install`, then `node server.js` and open http://localhost:8080. Alternatively use `npm run dev` (Vite on port 5173) or `npm start` (port 5000).

## Editing

- `index.html`: content, product selection links, metadata and FAQs.
- `css/main.css`: responsive burgundy/gold visual design.
- `js/site.js`: accessible navigation, demo enquiry preview and device-aware 3D loading.
- `js/bottles.js`: editable Three.js model. Run `npm run build:3d` after changes to regenerate `js/bottle-scene.min.js`, which is served directly by the static site.
- `assets/bottle-*.webp`: approximately 20 KB still renders of the same model. These remain the small concept-bottle thumbnails in the collection.
- `sitemap.xml`: only the confirmed public homepage. Section anchors are navigation targets, not separate indexable pages. The older `perfume-3d.html` experiment is not in the site map.

The hero defaults to a compressed editorial bottle portrait on every device. Live 3D loads only after selecting �Explore in 3D�; �Back to portrait� disposes the renderer. Generated concept imagery is in `assets/noir-portrait*.webp` (26/65 KB) and `assets/notes-*.webp` (29�55 KB). Reduced motion, Save-Data and detected slow connections retain still images without downloading Three.js. The live scene uses capped resolution, a small oscillation and a roughly 30 fps rendering cap. It stops when paused, hidden or outside the viewport. Images remain usable if loading or WebGL fails.

## Verification

Start a local Chromium browser with remote debugging, set `EXOTICA_CDP` to its endpoint, then run `npm run test:browser`. `EXOTICA_URL` optionally overrides the local origin. The script checks seven widths, navigation, selection, form validation and fallback policies, then records three simulated mobile performance runs in `reports/verification.json`.

`scripts/render-posters.mjs` captures PNG posters from the scene through the same browser endpoint. Convert those to WebP after changing the model. `scripts/final-visual.mjs` verifies pause, off-screen suspension and mobile WebGL context loss, and captures final screenshots.

Before enabling real customer enquiries, confirm a public contact address and delivery/returns terms. The user confirmed that the supplied email is GitHub-only; it is not displayed publicly.
