# Phase 0 — Preparation and discovery

## Current design revision

The user requested a white background, multiple color options, and redesigned feature containers. The current prototype uses three light palettes and rounded illustrated feature cards. The original dark audit below is historical context; `style-guide.md` describes the current design.

## Project brief

SI 3D PROJECT is a 3D-printing company. The website should introduce the brand, showcase printed products, support finish selection, and ultimately send customers to Allegro or Allegro Lokalnie. A custom-project enquiry is the secondary conversion path.

Source of truth: `plan.md`, `design_spec.md`, and `logo.jpg`. The source plan has no Phase 0; this document defines that preparation stage without renumbering later phases.

## Brand audit

- The supplied square black-on-white logo combines the name with an extrusion nozzle and cube. It immediately establishes the printing category.
- Preserve the original artwork and proportions. The preview presents the unchanged JPEG in a small white tile with a separate readable brand name. A transparent vector master would improve small-size reproduction in production.
- Apple-inspired direction means disciplined spacing, clear hierarchy, quiet navigation, product-led art direction, and restrained motion. SI retains its own name, logo, and color palette.
- Dark charcoal and silver form the foundation; electric blue identifies actions. Lime belongs to finish selection and is not a second general action color.
- The broad spec contains multiple attention-seeking animations. Reserve them for Phase 4 review; the prototype favors stillness and short hover transitions.

## Working assumptions

| Topic | Working decision | Before launch |
| --- | --- | --- |
| Language | English, matching source copy | Confirm Polish/localization needs |
| Offering | Printed objects and custom printing | Confirm whether printers are also sold |
| Products | Clearly labeled concept designs | Supply names, descriptions, photos, dimensions, pricing, and stock |
| Materials | General finish exploration | Confirm actual materials and colors per product |
| Contact | Honest unconfigured preview state | Supply public email/phone and enquiry workflow |
| Marketplace | No guessed shop links | Supply verified per-product Allegro URLs |
| Trust | No numeric proof claims | Verify print counts, reviews, experience, partners |
| Company | No invented timeline or people | Supply history, staff profiles, and workshop imagery |

## Information architecture

Home → Products → Product detail → external marketplace or quote request.

Home → About → custom-project enquiry.

Shared navigation: Home, About, Products, Contact. Mobile navigation remains keyboard accessible. A linked style guide is included in the prototype footer for review.

## Content inventory

Available: detailed brief, draft wireframes, brand palette, typography direction, original JPEG logo.

Created: design tokens, responsive browser mockups, one generated concept product visual, component samples, page wireframes, and implementation handoff.

Needed: real product catalogue and image variants, company story, contact details, marketplace links, verified claims, media rights for future supplied imagery, and production hosting choice.
