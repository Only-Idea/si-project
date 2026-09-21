# SI 3D PROJECT

Multi-page website for the masonry line holder, built with Vite and vanilla JavaScript. The selected direction is Studio Blue on white. Later user choices supersede the original dark proposal in `plan.md` and `design_spec.md`.

## Run locally

Use Node 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open <http://localhost:5174>.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 5174 |
| `npm run check` | Validate product facts and image mappings |
| `npm run build` | Build into `dist/` |
| `npm run preview` | Production preview on port 4173 |
| `npm test` | Build and run Chromium browser tests |

Tests use installed Google Chrome on macOS when available. Otherwise run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The test runner manages its production preview server; port 4173 must be free.

## Current experience

- Home introduces the product with a CAD-style hero, features and color carousel. Its Order button opens the dedicated product page, preserving the selected color.
- The product page contains its own carousel, in-use photograph, specifications, package contents, setup guidance and color-specific purchase links. A separate Polish About page tells Iza and Sebastian’s story in four chapters, with chapter reveals, reading progress and subtle desktop parallax. A new five-color campaign image with a gold cord appears on Home and About.
- Fixed Studio Blue branding, independent of the five product finishes: green `#00AE42`, blue `#489FDF`, red `#D32941` black `#000000`, and original orange (UI swatch `#FF7900`).
- Five carousel photos per color: studio, front, rear, left and right. Arrows, position dots, swipe and keyboard navigation replace named side selectors. Text and controls retain their position when photos change.
- Cinematic photos are excluded from the live carousel and build, but preserved in the asset archive.
- Contact links open `mailto:studio@example.com`; no enquiry forms or catalogue.
- `products.html` and `about.html` are real subpages, linked from the shared navigation. `style-guide.html` documents the selected direction.

## Implementation

`index.html`, `products.html` and `about.html` contain Home, Product and About. `src/css/` holds styling and design tokens. `src/js/main.js` initializes navigation and the product carousel. `catalogue.js` resolves Vite-managed image URLs, `product-colors.js` handles decoded image switching and loading failures, and `color-viewer-template.js` provides carousel markup. Product facts and variant mappings live in `src/data/products.json`. Older prototype modules remain unused; the entry point defines the active application.

The build includes nine original photographs, 25 live color/view images and the CAD-style hero. The hero is an AI-generated illustration, not a software screenshot or editable CAD model; its prompt is saved beside the asset. Product recolors are visualizations. The two installation photos are professional AI-assisted edits of the retained source photos.

The original [24-image gallery](assets/images/line-holder/generated/colors/index.html), [PNG bundle](assets/images/line-holder/generated/colors/product-colors.zip), generation prompts and metadata remain in the workspace. The earlier static site under `preview/` is a historical design archive. Neither archive is included in the production build.

## Status

Preparation, design, front-end setup and the revised website UI are complete. The GSAP motion layer is active. Performance/SEO, broader browser QA and deployment remain later work. No remote repository or deployment has been created. See `docs/phase-status.md` and `docs/validation.md` for details.

## Motion

`src/js/motion.js` progressively adds entrances, chapter reveals, reading progress and desktop photo parallax. Timing and distances are centralized in `gsap-config.js`. GSAP/ScrollTrigger load on demand and are skipped when reduced motion is requested. Mobile uses short reveals with no parallax. Preference changes and breakpoint changes revert the previous effects; keyboard focus finishes any reveal around the focused control. Content remains visible when JavaScript or the animation download is unavailable. `tests/motion.spec.js` exercises these behaviors separately from the static layout suite.

## Product purchase flow

The product page’s color choice updates both purchase buttons and its shareable URL. Green, blue and orange use their individual Allegro offers; black uses Allegro Lokalnie. Per the owner’s instruction, red temporarily opens the orange listing and is explicitly labeled accordingly. All URLs live in `src/data/products.json`. Price, availability and delivery are not duplicated locally.

`installation-gallery.js` presents both approved professional in-use photos with arrow keys, swipe, full-size links and failed-load recovery. Product information includes ABS material, supplied hardware, setup guidance and native FAQ disclosures. The specifications, FAQs and orange purchase link remain available without JavaScript.
