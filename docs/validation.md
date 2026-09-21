# Phase 1 preview verification

## White-theme revision

Rechecked after the white-background revision: all four pages pass at 320, 390, 768, 1024, and 1440px, with no horizontal overflow or JavaScript errors. Each palette was captured at desktop and mobile widths. Palette selection, reload persistence, cross-page selection, explicit palette links, existing catalogue interactions, dialog focus, mobile navigation, and reduced motion pass.

White action labels have contrast ratios of 5.57:1 (Studio Blue), 6.06:1 (Soft Sage), and 5.68:1 (Warm Clay). Muted text on the three feature-card surfaces ranges from 4.84:1 to 4.86:1. Supporting text on white is 7.32:1.

Current screenshots: `docs/previews/{blue,sage,clay}-{1440,390}.png` and corresponding `*-features-*.png` crops. The latter hide fixed navigation for clean section review. `light-*.png` contains the latest per-page captures. The original unprefixed page screenshots below document the earlier dark iteration.

## Initial dark-theme verification

Verified in local headless Google Chrome using Playwright on 2026-09-20. This is prototype verification, not the Phase 7 cross-browser production audit.

- Home, About, Products, and Design System all load successfully at 1440, 1024, 768, 390, and 320px viewport widths.
- No horizontal document overflow at those widths; all referenced images load.
- All local HTML links and assets resolve; the prototype JavaScript passes Node's syntax check.
- Catalogue category selection, debounced search, empty-state reset, and deep-linked concepts work.
- Product dialogs focus the close button, contain keyboard focus, dismiss with Escape, and return focus to the initiating control.
- Contact dialog can open above product detail and dismiss without closing the product detail.
- Finish selections update the accessible pressed state and visible finish name.
- Mobile navigation opens, closes with Escape, and links to the catalogue; mobile category disclosure works.
- Reduced-motion preference disables smooth scrolling.
- No JavaScript page errors during verification.

An initial keyboard check found focus could cycle into browser chrome at the end of the native dialog. Explicit Tab/Shift+Tab wrapping was added; the repeated check passed.

## Contrast samples

| Foreground / background | Ratio |
| --- | --- |
| Action ink `#07131A` / blue `#00A8E8` | 6.95:1 |
| Muted `#999999` / surface `#191919` | 6.17:1 |
| Secondary text `#CCCCCC` / charcoal `#111111` | 11.76:1 |
| Blue `#00A8E8` / charcoal `#111111` | 6.98:1 |

These sample text pairs exceed 4.5:1. This is not a claim of a full accessibility audit.

## Saved visual references

Desktop and mobile screenshots for each page are in `docs/previews/` with `-1440.png` and `-390.png` suffixes. The Home desktop/mobile and Products desktop screenshots were also inspected visually.

Safari, Firefox, screen-reader testing, real-device testing, production performance, and integration testing remain later-phase work.

## Product color selector — 2026-09-21

Verified all 20 color/view combinations at 1440, 390 and 320 px, with no horizontal overflow. Checked home/products integration, keyboard activation, one active image/color/view, retained color across view changes, rapid clicks (last selection wins), failed-load fallback and successful retry, and reduced-motion behavior. Verified 20 PNG decodes and genuine transparent alpha on all 16 cutouts; inspected the full color gallery. Browser validation script: `/tmp/si-preview-check/colors.cjs`.

### Cinematic color extension

Added four 1536 × 1024 cinematic PNGs and checked all 24 combinations at 1440, 390 and 320 px. The cinematic view preserves the selected color, uses light controls on the right of the dark scene, and crops from the left on mobile to keep the product visible. Browser checks passed for all views, keyboard controls, rapid switching, failed-image retry and reduced motion. All 24 files and ZIP integrity verified.

## Phase 2 — Vite migration

- `npm run build`: passed, four HTML entry points emitted with fingerprinted CSS, JS and product assets.
- Catalogue validation: one real product, nine original photos and all 24 color/view variants; 33 image references exist.
- `npm test`: three Chromium regression suites passed against the production build (46.8 seconds).
- Page, asset, navigation and overflow checks at 1440, 768, 390 and 320 pixels.
- All 24 color/view combinations verified at 1440, 390 and 320 pixels, including the cinematic layout, keyboard selection, rapid switching and reduced motion.
- Product modal deep link, nine full-resolution photos, exact Allegro offer ID, specs, focus wrap/restoration, concept state, search reset and category filters verified.
- Palette persistence, cross-page navigation and the shipped style-guide document verified; no page errors or failed local asset responses in the page suite.
- GSAP 3.15.0 and ScrollTrigger 3.15.0 loaded successfully; motion configuration remains disabled for Phase 4.
- Inspected desktop/mobile screenshots of the built cinematic viewer. Reproducible test sources are in `tests/site.spec.js`; screenshots are in ignored `test-results/`.
- Development server starts successfully on port 5174. No production deployment or cross-browser certification is claimed.

## Phase 3 — Single-product revision, 2026-09-21

- Production build validates one product and 29 image references (nine source photos, 20 carousel variants); cinematic assets are excluded from the live build.
- Four Chromium regression tests cover the single-product page, carousel interactions, failed-load recovery/race handling, and legacy-page redirects.
- Checked the page at 1440, 768, 390 and 320 px: CAD hero loaded, Studio Blue remained fixed despite stale palette preferences, email links worked, and there was no horizontal overflow.
- Verified all 20 photo/color combinations at 1440, 390 and 320 px, stable copy position and carousel height, next/previous wraparound, keyboard navigation, horizontal swipe and ignored vertical gestures.
- Verified absence of catalogue, forms, named side selectors, visible hex/view status and enquiry buttons.
- Failed image requests preserve the last working image; retries succeed; the latest request wins during rapid changes.
- Inspected desktop/mobile hero and carousel screenshots in `test-results/`. Tests are reproducible with `npm test`.

## Subpage revision — 2026-09-21

`npm test`: four Chromium tests passed (15.9 seconds). Checked Home, Product and Design at 1440, 768, 390 and 320 px. Verified Home’s Order link, selected-color handoff and reload on the product page, invalid-color fallback, real subpage URLs, active navigation, moved specifications, exact Allegro offer, internal anchors and absence of horizontal overflow. The carousel’s 20 combinations, swipe/keyboard controls, loading failures and latest-selection behavior still pass. Inspected the mobile Order control and desktop product carousel screenshots.

## About story and four-color campaign — 2026-09-21

Production build and all four Chromium suites passed (16.5 seconds). The About page was checked at 1440, 768, 390 and 320 px, including Polish document language, four readable chapters, localized mobile menu/Escape focus restoration, decoded campaign image, email link and no horizontal overflow. Desktop and mobile full-page screenshots were inspected. Carousel, order navigation and selected-color handoff still pass. Story content remains visible without JavaScript; parallax/reveal animation is deferred as requested.

## Fifth color and gold campaign — 2026-09-21

Added original orange studio/front/rear/left/right assets to the live picker and replaced the campaign image on Home and About with five colors and a gold cord. Production validation finds 34 product image references. All four Chromium suites pass (16.6 seconds), covering 25 color/photo combinations, orange URL selection, responsive layouts and existing interactions. Inspected the narrow mobile picker with its wrapped fifth swatch.

## Phase 4 — Animation layer, 2026-09-21

- `npm test`: all eight Chromium suites passed (19.5 seconds); production build succeeded.
- Observed chapter content transition into view and finish fully readable; checked active chapter styling and reading progress.
- Desktop parallax changes with scroll and remains within ±24px. Mobile widths 768, 390 and 320 have no photo transforms or horizontal overflow.
- Switching reduced motion on removes progress effects and transforms, restores full visibility, and disables smooth scrolling; switching it off and resizing produces no duplicate effects.
- Fixed a ScrollTrigger inline smooth-scroll restoration conflict and an initial section-link positioning issue identified during the first run.
- Keyboard focus completes pending reveals. Home-to-product color handoff, detail anchors, orange ordering path, and an initial About chapter link remain usable with motion enabled.
- Story remains readable without JavaScript and when the GSAP chunk fails to download.
- Existing static/layout checks, all 25 carousel combinations, load retry and selection-race checks pass.
- Inspected `test-results/motion-story-desktop.png` and `motion-story-mobile.png`. Confirmed the development server returns the new motion module and assembled stylesheet successfully.
- Cross-browser, real-device performance and full accessibility audit remain later-phase work.

Implementation follows the official [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/); effects are scoped through GSAP matchMedia and revert on preference/breakpoint changes.

## Phase 5 — Product details and ordering, 2026-09-21

- Build and all 11 Chromium suites passed.
- Confirmed both purchase buttons track the selected color and match the owner's supplied URLs: green offer 18881264719, blue 18883876669, orange 18883894172, and black's Allegro Lokalnie listing including its supplied query parameter. Red deliberately uses orange, with explicit wording, as requested by the owner.
- Clicked each outgoing link in an intercepted browser navigation and verified the destination/new tab and noopener/noreferrer. This verifies site routing, not third-party checkout or stock; automated access to the live marketplace pages was unavailable. No purchase was placed.
- Verified color URL persistence on reload, both professional installation images, keyboard/swipe, failed-image fallback/retry and full-size links.
- Checked stable color/purchase-panel height and no overflow at 1440, 768, 390 and 320 px; fixed a 1px button-height change caused by the longer marketplace name at narrow widths.
- Verified material/package contents, FAQ disclosure behavior and useful static specs/FAQ/orange purchase link without JavaScript.
- Existing motion, reduced-motion, progressive fallback and 25 color/photo checks still pass. Product detail screenshots were inspected; live development CSS served successfully.
