# Brand and interface guide

## Direction

Revision 3: the user selected Studio Blue on white and a website focused on one product with separate Home, Product and Design pages. This guide supersedes the original dark direction and earlier palette studies.

White canvas, quiet charcoal typography, and restrained blue actions. Product imagery, negative space and clear type establish the visual hierarchy. The hero depicts the product in an illustrated CAD workspace.

## Logo

Use the original `logo.jpg` without cropping, distortion, or recoloring. Place it on white with clear space. In compact navigation, pair the artwork with the readable name “SI 3D PROJECT”. The complete square artwork is shown again in the footer. Request a vector original before final production asset optimization.

## Color tokens

The site uses `#FFFFFF` canvas, `#1D1D1F` primary text, `#55565B` secondary text, and `#696A70` muted text. Studio Blue actions use `#0066CC` with white labels, `#0055AD` hover, and `#EDF4FC` feature surfaces. The palette is fixed; earlier Sage and Clay studies remain only in the archived prototype.

Product swatches are independent of the site accent: green `#00AE42`, blue `#489FDF`, red `#D32941`, and black `#000000`. The logo remains unchanged.

## Typography

Inter from Google Fonts, with `-apple-system`, BlinkMacSystemFont, Segoe UI, and sans-serif fallbacks. Weights 300–700. Use tight but legible headline tracking and generous body leading.

| Role | Desktop | Mobile | Weight |
| --- | --- | --- | --- |
| H1 | 64px | 40px | 700 |
| H2 | 40px | 32px | 600 |
| H3 | 32px | 28px | 500 |
| Body | 16px / 1.5 | 15px / 1.5 | 400 |
| Small | 14px | 13px | 400 |
| Eyebrow | 11px, 0.16em tracking | 11px | 500 |

Small UI labels use weight 400 instead of the draft's 300 for legibility. Editorial headlines can wrap deliberately, but mobile wrapping must never create overflow.

## Layout

- 8-point spacing rhythm with tokens: 4, 8, 12, 16, 24, 32, 48, 64px. Section spacing uses multiples, up to 128px.
- Max content width 1200px; 48px desktop, 32px tablet, 24px mobile gutters.
- Desktop: split hero, three-column features, carousel copy on the left and product on the right, two-column product details.
- Mobile: collapsed menu, stacked hero and features, carousel image above the copy and color controls.
- Layouts down to 320px remain readable without horizontal scrolling.

## Components and states

- Navigation links to separate Home, Product and Design pages. Mobile menu exposes its expanded state; Escape closes it and restores focus.
- Buttons use blue accents, generous touch targets and visible keyboard focus.
- Product carousel has five photos per color, previous/next arrows and position dots. It supports keyboard arrows and horizontal swipe, with no autoplay or named side controls.
- Color swatches include visible names and selected states. There is no visible hex/view status; screen readers receive a concise live update.
- Switching photos keeps text and controls in a fixed layout. New images decode before replacing the previous photo; failures retain the working image and expose a retry message.
- Contact is a direct email link to `studio@example.com`. No forms or enquiry dialogs.
- Home’s Order button carries the selected color to the product page. Product specifications and the explicitly orange-edition purchase link appear on that subpage. Cinematic imagery is retained in the archive but excluded from the live carousel.

## Motion and accessibility

All content is visible without animation or JavaScript. CSS transitions are short (180–240ms) and decorative. Respect `prefers-reduced-motion` by removing transitions and smooth scrolling. GSAP adds 850ms desktop entrances and 550ms mobile reveals, with 100ms stagger. Desktop photo parallax is limited to ±24px; mobile has none. About includes reading and chapter-progress lines. Live reduced-motion changes revert all effects. There are no looping CTA pulses, scroll interception, invented counters or testimonial sliders.

Use semantic landmarks, one H1 per page, descriptive alt text, visible labels, a skip link, logical headings, and 44px touch targets. Do not publish placeholder customer claims or testimonials. Chromium interaction checks are automated; cross-browser QA is Phase 7.
