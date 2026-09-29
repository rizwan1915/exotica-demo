# Collection pages and campaign revision

## Delivered

- `perfumes.html`: four existing fragrances and their bottle concepts, original prices and notes, campaign, preserved optional Noir Sultana 3D viewer, local enquiry preview.
- `body-sprays.html`: four distinct concept bottles: crimson cylinder, ivory cylinder, black rectangular atomiser, frosted blush bottle.
- `oud.html`: four distinct concept bottles: amber facets, round emerald, black flask, clear crystal.
- Homepage now serves as the entrance to the collections. Its full perfume grid and signature feature moved to the perfume page. Navigation, category cards, footer, per-page titles/descriptions/canonicals and XML sitemap use the three real local page paths.

The new body-spray and oud names describe packaging designs, not verified products. No prices, scent formulas, sizes or stock claims were invented. All enquiry forms explicitly remain previews; nothing is submitted or stored.

## Campaign direction

“Wear what makes you smile” connects the portrait to the product. The woman now visibly smiles with teeth and holds a perfume bottle. The client's red-satin/gold artwork informs the entire photographic setting instead of appearing as a pasted logo tile. Website copy and the house signature are live HTML. Motion is a restrained image zoom, not animated facial movement. Mobile uses an uncrowded image above the copy; desktop uses the negative space inside the campaign composition.

## Generated assets and prompts

Used the built-in image-generation tool. Project assets are in `assets/`, with responsive `-small.webp` versions. Originals remain in Codex's generated-images folder.

- `campaign-smile-v2.webp`: combine the two supplied references into one coherent luxury campaign photograph, not a collage. Preserve the woman's identity, black headscarf and dramatic hat; give her a warm natural smile with clearly visible upper teeth. Woman on right, crimson negative space on left for live website copy. She holds a crimson perfume bottle; deep red silk and restrained gold light integrate the second reference. No pasted square, text or watermark. Landscape 3:2.
- `spray-ivory.webp`: tall matte ivory cylinder, gold nozzle, ivory cap beside it, EXOTICA label, full bottle, cream travertine studio, vertical 4:5.
- `spray-black.webp`: tall slim black rectangular body-mist atomiser with softened corners, slim gold cap and EXOTICA label, matching cream studio photograph, vertical 4:5.
- `spray-blush.webp`: tall frosted blush cylinder, rose-gold pump, clear cap, EXOTICA label, matching studio setting, vertical 4:5.
- `oud-emerald.webp`: compact round emerald flacon, ornate tall gold stopper and EXOTICA label, matching studio setting, vertical 4:5.
- `oud-onyx.webp`: compact flattened round black flask, engraved wide gold collar, spherical gold stopper, EXOTICA label, matching studio setting, vertical 4:5.
- `oud-crystal.webp`: tall small hexagonal crystal flacon, pale gold liquid, elongated crystal stopper, narrow gold collar, EXOTICA label, matching studio setting, vertical 4:5.

All bottle prompts requested photorealistic complete bottles, generous margins and no invented volume, fragrance name or overlay copy. Existing crimson spray and amber oud concepts complete the four-item sets.

## Validation

Run `npm run test:browser` with `EXOTICA_CDP` set to the local test browser endpoint. The current browser test is `scripts/verify-collections.mjs`.

Passed across homepage plus all three collection pages at 320, 390, 430, 768, 1024, 1440 and 1920 pixels: all images decode; no overflow, failed requests or JavaScript errors; exactly four cards per collection; all twelve selections reach the right enquiry option; demo submissions work; page links and fragment targets resolve; mobile navigation works; campaign pause and reduced motion work; optional perfume 3D loads and pauses. Desktop and phone screenshots inspected. Physical-device testing not performed.

The new campaign image is 60 KB desktop / 23 KB small. Catalogue images are lazy-loaded with responsive sources. No new library, video or automatic WebGL load was introduced. Final home performance runs are in `performance-final.json`.

Three cold-cache home runs at 390 × 844, 100 ms latency, 200 KB/s download and 4× CPU throttling: LCP 2.588 / 1.788 / 2.040 seconds (median 2.040 s), resource transfer 207,589 bytes excluding HTML, CLS 0.00936, long-task totals 72 / 0 / 0 ms. Prior revision median was 1.920 s with 184,205 resource bytes; the new campaign adds about 23 KB in this measurement. The timing difference is small and noisy, not a speed improvement.

This revision is local only. No commit, push or deployment.
