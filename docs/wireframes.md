# Phase 1 — Page wireframes and user flows

The browser prototype is the high-fidelity visual reference. These structures retain the full intended website scope and identify content that is awaiting verification.

## Home

Desktop: fixed navigation → split hero (eyebrow, H1, lead, product CTA / oversized concept render) → three-column speed/precision/material feature strip → collection introduction and product concept cards → brand statement → custom-project CTA → footer.

Mobile: collapsed navigation → headline and actions → image → stacked features → stacked collection cards → brand statement → CTA → footer.

The source's animated statistics are omitted from the visual preview pending verified values. A future horizontal featured-products carousel can replace the static preview collection in Phase 3; its buttons must include accessible labels and keyboard interaction. GSAP motion is deferred.

## About

Desktop: shared navigation → large editorial heading → two-column story/image → three-step approach → reserved company-history and team content note → custom-project CTA → footer.

Mobile: same reading order, stacked columns, full-width image, stacked approach blocks.

Production expansion: verified company timeline → team portraits and bios → technology video with poster and pause control → approved partner logos. Do not use the example years, metal-printing claim, or invented people from the initial wireframe as factual content.

## Products

Desktop: shared navigation → title and lead → labelled search → category panel beside four-column grid at wide widths; narrower desktop uses two columns to keep product cards usable → footer.

Tablet: top filter disclosure → two-column grid. Mobile: filter disclosure → single-column cards.

Each concept card: image or explicit typography-led concept tile → category → product name → short description → “Explore concept” button. No speculative price.

Prototype search matches product name, category, and description. Categories are mutually exclusive; a clear empty state provides reset. Real price ranges and available-color filters need actual catalogue data and remain later-phase work.

## Product detail

Desktop: centered modal, close button, two columns (concept image / title, description, swatches, selected finish label, indicative design notes, marketplace state, quote action).

Mobile: full-screen modal, close at top, image above text, vertically stacked actions.

Open focuses the close control. Tab stays in the dialog. Escape or close dismisses and returns focus to the initiating card. Selecting a swatch changes its accessible pressed state and selected-finish label; real color images will be supplied for Phase 5. Purchase information clearly states that marketplace links and prices are not configured.

## Contact preview

Contact and custom-project CTAs open a small dialog. It explains that public contact details will be connected before launch, and outlines useful enquiry information. There is no submit control, backend, storage, or false success message.

## Review criteria

- Hierarchy and spacing feel consistent across Home, About, and Products.
- Original logo and company name remain readable.
- Product and quote paths are clear on desktop and mobile.
- Keyboard users can open/close navigation and dialogs without losing focus.
- The preview distinguishes visual concepts from real company/product facts.
