# Local redesign verification — 24 September 2026

## Diagnosis and changes

The original homepage downloaded 2.35 MB of resources, including a 1.45 MB looping smoke video and a 663 KB Three.js module. Four large blurred smoke layers animated concurrently with the video. The 3D module referenced a missing `three.core.js`, so the original homepage had zero live bottle canvases. If repaired without redesigning it, the old implementation would create four separate WebGL scenes with refraction, particles and continuous spinning.

The new homepage uses a static burgundy backdrop, one conditionally loaded hero scene, bounded bottle rotation and matching WebP product images. The bundled module resolves its own dependencies; the homepage no longer relies on the incomplete vendor folder. Glass transmission passes, animated particles and shadow maps are removed. Rendering stops when paused, offscreen or in a hidden document. Device pixel ratio is capped at 1.5 and animation updates at approximately 30 fps.

The crest was resized to a 12.5 KB WebP. Product images are about 20–22 KB each and below-fold images lazy-load. Existing videos and original artwork are preserved in the workspace but not requested by the new homepage. No additional fonts or remote libraries load at runtime.

Existing brand, products, prices and scent notes remain. The editorial hero, spacing, collection presentation, FAQs and footer were updated. Product enquiry links now select the matching fragrance. The form can preview more than one enquiry and clearly states that nothing is sent or stored. No cart or checkout existed in the supplied project.

## Performance

Local Chromium, fresh contexts, cache disabled, 390 × 844 viewport, 100 ms network latency, 200 KB/s download, 100 KB/s upload, 4× CPU slowdown. Measurements were collected 12 seconds after navigation. Transfer totals are Resource Timing subresources and exclude the HTML document. Baseline is one run; after is three runs, so these are indicative lab measurements rather than field percentiles.

| Metric | Before | After |
| --- | ---: | ---: |
| Largest contentful paint | 2,796 ms | 1,508 ms median (1,352–1,888 ms) |
| Resource transfer | 2,347,078 bytes | 62,248 bytes |
| Recorded long-task duration | 297 ms | 0 ms in all three runs |
| Layout shift score | 0 | 0.000664 |
| Mobile WebGL canvases at load | 0 (broken import) | 0 (intentional image fallback) |

Approximately 46% faster median LCP and 97.3% less initial mobile resource transfer. The mobile 3D opt-in incurs an additional approximately 560 KB uncompressed module download, excluded from default mobile measurements. No comparison of old and new 3D frame rates is claimed because the original module was broken. A paused scene and an offscreen scene were verified to schedule no further animation callbacks.

## Browser verification

- Widths 320, 390, 430, 768, 1024, 1440 and 1920 px: no horizontal overflow, no missing loaded images or internal anchor targets, one primary heading, zero page exceptions or failed resource responses in the test runs.
- Mobile menu opening, closing after navigation and Escape handling; all four product selections; required email validation; repeat enquiry previews; footer delivery link opening its FAQ.
- Desktop hero renders one canvas. Pause/resume and keyboard rotation work. Changing to reduced motion removes the canvas.
- Fresh reduced-motion, Save-Data and 3G profiles do not fetch the 3D bundle. WebGL unavailable and context loss retain the still image.
- Final visual checks at all seven widths include all lazy-loaded product images and assert that every bottle image stays within its panel.
- Automated axe scan: 50 passes, zero violations. Gradient-background contrast has an incomplete automated result and was inspected visually; this is not a complete accessibility certification.
- Canonical and social metadata use the user-confirmed https://exotica-demo.vercel.app/. XML sitemap lists only this real public page, with no fabricated product URLs. Social image and favicon are local assets.

## Still needs owner input / real-world testing

Public brand contact email is unconfirmed. Delivery areas, fees, dispatch times and return terms were not supplied; the website says so rather than inventing a policy. The original placeholder hello@example.com link was replaced with the enquiry section. The user confirmed that the supplied Gmail address is GitHub-only, so it is not published.

The enquiry remains a demo. Cart, checkout and actual order submission require a separate implementation if desired. Physical iOS/Android GPU performance and public-host field performance have not been measured. The legacy full-screen perfume experiment is retained but not part of the redesigned shopping journey. No files have been pushed or published.


## Smoke refinement

The hero now uses a single 18 KB WebP frame from the existing smoke footage, animated with a slow CSS transform. This adds approximately 18 KB to the resource totals measured above; those measurements predate the smoke addition. No video or animated blur is loaded. Pause/resume, offscreen suspension, reduced-motion fallback and mobile overflow were checked in Chromium. Detected constrained devices keep the smoke still.

### Continuous-smoke follow-up

Replaced the drifting still with an actual 640 × 360, 20 fps, 335 KB smoke film derived from the original asset. The forward/reverse edit matches the loop endpoints, with muted inline playback at 0.75 speed. Reduced motion and Save-Data retain the still without requesting the video. Playback, wraparound, pause/resume, offscreen suspension and overflow were verified at 390 and 1440 px. Earlier page-transfer/performance measurements predate this video addition and should not be treated as current totals.

### Lag correction

The prior 20 fps film played at 0.75 speed, effectively showing only 15 fps. Slow motion is now baked into a 480 × 270, 30 fps clip played at normal speed. The file is 93,797 bytes (down from approximately 343 KB). Tint is baked into the film, replacing screen blending and the radial mask with simple static gradient overlays. The 3D renderer now uses pixel ratio 1, reducing its pixel workload by 56% relative to its former 1.5 cap on high-density screens.

Local desktop profiling before the correction showed approximately 16.8 ms p95 animation-frame intervals with both effects, smoke alone, and still content; it did not reproduce a general scheduling slowdown. The low source-frame cadence was confirmed in code. After the correction, desktop and mobile viewport tests decoded 60–61 video frames over two seconds. Looping, pause/resume, reduced motion and overflow checks passed. This does not guarantee identical performance on the user's device.

### Editorial imagery and optional 3D

The final hero uses a photorealistic generated concept portrait (26 KB small / 65 KB large), preserving the fragrance name and brand text. Three generated ingredient still lifes (29–55 KB) support the existing scent notes. Collection imagery lazy-loads; the existing bottle concepts remain as product thumbnails. The house section now uses the original crest. Outlines were reduced, proportions refined, and brief once-only entrances added with reduced-motion support.

All devices now start with the still portrait. No Three.js bundle or WebGL canvas is loaded before an explicit “Explore in 3D” action. “Back to portrait” disposes the renderer. This mode switch was verified on mobile, along with the full seven-width navigation, selection, form and fallback suite. The lightweight continuous smoke remains.

Latest simulated-mobile results (same 390 × 844 / 4× CPU / 200 KB/s setup): resource transfer 170,130 bytes; LCP 1,936–2,152 ms, median 2,080 ms; CLS 0.000183; long tasks 0, 0 and 52 ms across three runs. These replace earlier estimates for the current design. The deliberate tradeoff is richer image detail and continuous smoke while eliminating automatic 3D work. No field-device performance guarantee is implied.
