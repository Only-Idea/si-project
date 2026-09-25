# SI 3D PROJECT

Multi-page website for the masonry line holder, built with Vite and vanilla JavaScript. The selected direction is Studio Blue on white. Later user choices supersede the original dark proposal in `docs/plan.md` and `docs/design_spec.md`.

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

- Home introduces the product with the owner's CAD screenshot (`assets/images/line-holder/cad-design.jpeg`), features and color carousel. Its Order button opens the dedicated product page, preserving the selected color.
- The product page contains its own carousel, in-use photograph, specifications, package contents, setup guidance and color-specific purchase links. The About page tells Iza and Sebastian’s story in four chapters, with chapter reveals, reading progress and subtle desktop parallax. All three pages are available in Polish, English and German.
- Fixed Studio Blue branding, independent of the five product finishes: green `#00AE42`, blue `#489FDF`, red `#D32941` black `#000000`, and original orange (UI swatch `#FF7900`).
- Five carousel photos per color: studio, front, rear, left and right. Arrows, position dots, swipe and keyboard navigation replace named side selectors. Text and controls retain their position when photos change.
- The home and product galleries’ **3D · 360°** button opens the supplied upright model on demand. Drag to rotate, scroll or pinch to zoom, or use the rotation, zoom and reset buttons. The selected finish colors the body while the black knob and metal hardware retain their materials.
- Contact links open `mailto:studio@example.com`; no enquiry forms or catalogue.
- `products.html` and `about.html` are real subpages, linked from the shared navigation.

## Implementation

### Languages

Polish is the default, including the static HTML fallback. The header language selector switches between Polski, English and Deutsch. Polish pages use `index.html`, `products.html` and `about.html`; English and German use corresponding `.en.html` and `.de.html` files. The build renders their translated HTML before JavaScript runs. Legacy `?lang=pl`, `?lang=en` and `?lang=de` links still work and redirect to these static URLs, retaining color and fragment. Explicit language choices take precedence over the saved `si-language` preference. An invalid language falls back to Polish. Page links and product order links carry the current language, and switching languages retains the selected product color and URL fragment. Language selection still works when browser storage is unavailable.

Copy lives in `src/data/translations.json`, with natural wording for each language. `src/js/i18n.js` applies the `data-i18n` text and attribute keys before galleries and motion initialize; interactive controls use the same dictionary. When changing default Polish copy, keep its static HTML fallback in sync. Product IDs, color IDs and image mappings remain language-independent. `tests/languages.spec.js` covers all pages, responsive navigation, metadata, galleries, preferences and the Polish no-JavaScript fallback.

`index.html`, `products.html` and `about.html` contain Home, Product and About. `src/css/` holds styling and design tokens. `src/js/main.js` initializes navigation and the product carousel. `catalogue.js` resolves Vite-managed image URLs, `product-colors.js` handles decoded image switching and loading failures, and `color-viewer-template.js` provides carousel markup. Product facts and variant mappings live in `src/data/products.json`.

The build includes 25 live color/view images, the two professional installation photos, the five-color campaign image and the owner's CAD screenshot in the home hero. The five studio views are rendered directly from the supplied OBJ; their geometry matches the interactive model. The other carousel angles and campaign image remain earlier generated illustrations. The installation photos are professional AI-assisted edits of the owner’s original photographs, which are no longer kept in the repository.

### Studio product images

`npm run render:products` renders five 1536 × 1024 WebP images to `test-results/product-renders/`. Add `-- --preview` for a faster orange-only lighting check in its `preview/` subfolder, or `-- --apply` to replace the five catalogue studio assets after the full batch finishes. The offline renderer starts its own server on port 5180 and uses the same local Chrome/Playwright browser setup as the tests.

`scripts/render-product-scene.js` used the supplied OBJ/MTL (no longer in the repo; restore `public/models/line-holder/` to re-render) without reshaping or simplifying triangles. It rotates the product upright, applies a uniform scale, and adds studio area lights, a neutral pedestal, steel hardware, and procedural ABS surface shading. Surface texture and finish are illustrative; the supplied geometry remains authoritative. All finishes share one camera and scene. Final images use 512 path-traced samples at 1.5× resolution, edge-preserving noise reduction, then downsampling to the website size.

The offline renderer pins Three.js r181 and its path-tracer dependencies separately from the interactive website’s Three.js version. These development dependencies and rendering scripts are not included in the production JavaScript bundle. OBJ meshes with multiple materials are split by existing triangle groups for correct path-tracer material assignment.

### 360° product view

`assets/images/line-holder/model-360.mp4` is a rotating video (H.264, muted, looping; converted from the original 12 MB GIF) of the green holder. `product-model.js` handles the Photos / 360° switch and requests the video (~120 KB) only when the visitor first opens it. It does not change with the selected color.

## Status

Preparation, design, front-end setup and the revised website UI are complete. The GSAP motion layer is active, and basic SEO and social previews are configured. Broader browser QA and deployment remain later work. No remote repository or deployment has been created. See `docs/phase-status.md` and `docs/validation.md` for details.

## Motion

`src/js/motion.js` progressively adds smooth desktop scrolling ([Lenis](https://lenis.darkroom.engineering), driven by the GSAP ticker), masked line-by-line heading reveals (GSAP SplitText), curtain wipes for framed images, in-frame photo parallax and a reading-progress bar. On desktop screens at least 680px tall, About chapters 01-03 share one pinned stage (`data-story-stage`): each chapter's paragraphs arrive with the scroll and the next chapter replaces it in the same spot, so the page only moves on when the product image is reached. Timing and distances are centralized in `gsap-config.js`. The engine loads on demand and is skipped when reduced motion is requested. Mobile uses short reveals with native scrolling, no pinning (chapters stack normally) and no parallax. Preference and breakpoint changes revert the previous effects; keyboard focus finishes any reveal around the focused control. Content remains visible when JavaScript or the animation download is unavailable. `tests/motion.spec.js` exercises these behaviors separately from the static layout suite.

## Product purchase flow

The product page’s color choice updates both purchase buttons and its shareable URL. Green, blue and orange use their individual Allegro offers; black uses Allegro Lokalnie. Per the owner’s instruction, red temporarily opens the orange listing and is explicitly labeled accordingly. All URLs live in `src/data/products.json`. Price, availability and delivery are not duplicated locally.

`installation-gallery.js` presents both approved professional in-use photos with arrow keys, swipe, full-size links and failed-load recovery. Product information includes ABS material, supplied hardware, setup guidance and native FAQ disclosures. The specifications, FAQs and orange purchase link remain available without JavaScript.

## SEO and link previews

`npm run build` generates nine localized pages, `dist/robots.txt` and `dist/sitemap.xml`. Each page contains its own canonical URL, reciprocal `hreflang` alternates, Open Graph metadata and Twitter `summary_large_image` tags. Metadata is present in the HTTP response, including for crawlers without JavaScript. Color and tracking parameters are omitted from canonical URLs.

The two JPEG previews in `public/social/` reuse the site photographs: the five product colors for Home/Product and the shared workbench for About. Each is 1200 × 800 pixels and under 250 KB. Vite serves them locally and copies them unchanged into `dist/social/`.

Before publishing, copy `.env.example` to `.env` and set `SITE_URL` to the real HTTPS address assigned by the hosting service. A custom domain is optional; the hosting provider's public address works too. Then run `npm run build` and publish `dist/`. The build derives canonical URLs, social-image URLs and sitemap entries from that one setting. `SEO_INDEXABLE=false` keeps a public staging build out of the index.

Without `SITE_URL`, the build is a local preview: URLs use `http://127.0.0.1:4173/`, robots disallows crawling and pages remain `noindex`. The development server always disables indexing. Public social preview services cannot fetch localhost; external previews can only be verified after publishing. No deployment is performed by the build.

To check the result, inspect the page source, `/robots.txt`, `/sitemap.xml` and `/social/line-holder.jpg`. `tests/seo.spec.js` checks raw HTML, all nine canonical URLs, metadata, images, language pages without JavaScript, and public-versus-preview indexing settings. Implementation references: [Open Graph protocol](https://ogp.me/), [Google canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions).
