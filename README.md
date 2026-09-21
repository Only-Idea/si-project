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
- The product page contains its own carousel, in-use photograph, specifications, package contents, setup guidance and color-specific purchase links. The About page tells Iza and Sebastian’s story in four chapters, with chapter reveals, reading progress and subtle desktop parallax. All three pages are available in Polish, English and German.
- Fixed Studio Blue branding, independent of the five product finishes: green `#00AE42`, blue `#489FDF`, red `#D32941` black `#000000`, and original orange (UI swatch `#FF7900`).
- Five carousel photos per color: studio, front, rear, left and right. Arrows, position dots, swipe and keyboard navigation replace named side selectors. Text and controls retain their position when photos change.
- Cinematic photos are excluded from the live carousel and build, but preserved in the asset archive.
- Contact links open `mailto:studio@example.com`; no enquiry forms or catalogue.
- `products.html` and `about.html` are real subpages, linked from the shared navigation. `style-guide.html` documents the selected direction.

## Implementation

### Languages

Polish is the default, including the static HTML fallback. The header language selector switches between Polski, English and Deutsch. `?lang=pl`, `?lang=en` and `?lang=de` provide shareable language URLs; an explicit supported URL language takes precedence over the saved `si-language` preference. An invalid language falls back to Polish. Page links and product order links carry the current language, and switching languages retains the selected product color and URL fragment. Language selection still works when browser storage is unavailable.

Copy lives in `src/data/translations.json`, with natural wording for each language. `src/js/i18n.js` applies the `data-i18n` text and attribute keys before galleries and motion initialize; interactive controls use the same dictionary. When changing default Polish copy, keep its static HTML fallback in sync. Product IDs, color IDs and image mappings remain language-independent. `tests/languages.spec.js` covers all pages, responsive navigation, metadata, galleries, preferences and the Polish no-JavaScript fallback.

`index.html`, `products.html` and `about.html` contain Home, Product and About. `src/css/` holds styling and design tokens. `src/js/main.js` initializes navigation and the product carousel. `catalogue.js` resolves Vite-managed image URLs, `product-colors.js` handles decoded image switching and loading failures, and `color-viewer-template.js` provides carousel markup. Product facts and variant mappings live in `src/data/products.json`. Older prototype modules remain unused; the entry point defines the active application.

The build includes nine original photographs, 25 live color/view images and the CAD-style hero. The hero is an AI-generated illustration, not a software screenshot or editable CAD model; its prompt is saved beside the asset. Product recolors are visualizations. The two installation photos are professional AI-assisted edits of the retained source photos.

The original [24-image gallery](assets/images/line-holder/generated/colors/index.html), [PNG bundle](assets/images/line-holder/generated/colors/product-colors.zip), generation prompts and metadata remain in the workspace. The earlier static site under `preview/` is a historical design archive. Neither archive is included in the production build.

## Status

Preparation, design, front-end setup and the revised website UI are complete. The GSAP motion layer is active. Performance/SEO, broader browser QA and deployment remain later work. No remote repository or deployment has been created. See `docs/phase-status.md` and `docs/validation.md` for details.

## Motion

`src/js/motion.js` progressively adds smooth desktop scrolling ([Lenis](https://lenis.darkroom.engineering), driven by the GSAP ticker), masked line-by-line heading reveals (GSAP SplitText), curtain wipes for framed images, in-frame photo parallax and a reading-progress bar. On desktop screens at least 680px tall, About chapters 01-03 share one pinned stage (`data-story-stage`): each chapter's paragraphs arrive with the scroll and the next chapter replaces it in the same spot, so the page only moves on when the product image is reached. Timing and distances are centralized in `gsap-config.js`. The engine loads on demand and is skipped when reduced motion is requested. Mobile uses short reveals with native scrolling, no pinning (chapters stack normally) and no parallax. Preference and breakpoint changes revert the previous effects; keyboard focus finishes any reveal around the focused control. Content remains visible when JavaScript or the animation download is unavailable. `tests/motion.spec.js` exercises these behaviors separately from the static layout suite.

## Product purchase flow

The product page’s color choice updates both purchase buttons and its shareable URL. Green, blue and orange use their individual Allegro offers; black uses Allegro Lokalnie. Per the owner’s instruction, red temporarily opens the orange listing and is explicitly labeled accordingly. All URLs live in `src/data/products.json`. Price, availability and delivery are not duplicated locally.

`installation-gallery.js` presents both approved professional in-use photos with arrow keys, swipe, full-size links and failed-load recovery. Product information includes ABS material, supplied hardware, setup guidance and native FAQ disclosures. The specifications, FAQs and orange purchase link remain available without JavaScript.
