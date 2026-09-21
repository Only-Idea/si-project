# SI 3D PROJECT – Screen Design & Wireframe Specification

---

## 📑 Table of Contents
1. [Design Foundations](#design-foundations)
2. [Home Page (index.html)](#home-page)
3. [About Us Page (about.html)](#about-us-page)
4. [Products Page (products.html)](#products-page)
5. [Product Detail Modal / Page](#product-detail)
6. [Responsive Breakpoints & Mobile Adjustments](#responsive-design)
7. [Style‑Guide Summary (Markdown Version)](#style-guide-summary)
8. [Interaction & Animation Notes (for Phase 4)](#interaction‑animation-notes)

---

## 🎨 Design Foundations <a name="design-foundations"></a>
- **Brand Tone**: Apple‑style – minimal, premium, elegant, high‑contrast dark theme.
- **Typography**: `Inter` (Google Font) – see *plan.md* for exact weight/size matrix.
- **Color System** (CSS variables, defined in `:root`):
  ```css
  :root {
    --color-primary: #111111;   /* Deep charcoal */
    --color-secondary: #F5F5F5; /* Soft silver */
    --color-accent: #00A8E8;    /* Electric blue */
    --color-highlight: #A8E600; /* Lime green – colour‑picker */
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #CCCCCC;
  }
  ```
- **Spacing Scale** (8‑pt system): `4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px` – used for margins/paddings.
- **Corner Radius**: 8 px for buttons, cards, inputs; 12 px for modal windows.
- **Elevation**: subtle box‑shadow `0 4px 12px rgba(0,0,0,0.15)` for lifted components.
- **Glass‑morphism**: `backdrop-filter: blur(12px); background: rgba(255,255,255,0.07);` applied to cards and nav bar.

---

## 🏠 Home Page – `index.html` <a name="home-page"></a>
### 1️⃣ Layout Overview (desktop ≥1024 px)
```
+----------------------------------------------------------+
| NAVBAR (fixed, transparent → opaque on scroll)          |
+----------------------------------------------------------+
| HERO (full‑viewport height, parallax background)        |
|   ├─ H1 – "SI 3D PROJECT"                               |
|   ├─ Sub‑headline – "Precision 3‑D printing for the future"
|   └─ CTA button – primary (electric blue)                |
+----------------------------------------------------------+
| FEATURE STRIP (3 columns)                               |
|   [Icon] Speed   | [Icon] Precision | [Icon] Materials |
+----------------------------------------------------------+
| FEATURED PRODUCTS CAROUSEL (GSAP)                       |
|   Card1   Card2   Card3   (glass‑morphism)               |
+----------------------------------------------------------+
| NUMBERS COUNTER (stats)                                  |
|   200+ Prints | 99% Satisfaction | 5‑Year Experience    |
+----------------------------------------------------------+
| CTA SECTION – pulsating button "Get a Quote"            |
+----------------------------------------------------------+
| FOOTER (minimal)                                         |
+----------------------------------------------------------+
```
### 2️⃣ Component Details
- **NavBar**: logo left, links (`Home`, `About`, `Products`) centered, CTA `Contact` right. Transparent `rgba(0,0,0,0.2)`; on scroll adds `background: var(--color-primary);` and `box-shadow`.
- **Hero**:
  - Background image with `data-parallax-speed="0.4"` (GSAP). 
  - Text block centered vertically, max‑width 720 px.
  - CTA: `button.btn-primary` – rounded, gradient `linear-gradient(135deg, var(--color-accent), #0066b2)`, hover `scale(1.03)`.
- **Feature Strip**: three equal‑width columns, each with SVG icon (stroke‑style), short heading (H3) and 1‑line description.
- **Featured Products Carousel**:
  - Cards contain product image (transparent background), name, short tagline, `View` button.
  - Horizontal scroll on desktop; swipeable on mobile.
- **Numbers Counter**:
  - Each counter is a `<div class="counter" data-target="200">0</div>` – animated via GSAP.
- **CTA Section**: full‑width band with dark background, centered button with subtle pulse animation (`@keyframes pulse { 0% { transform:scale(1); } 50% { transform:scale(1.05); } 100% { transform:scale(1); } }`).
- **Footer**: small text links, social icons (SVG), background `var(--color-primary)`.

### 3️⃣ Mobile Layout (≤768 px)
- NavBar collapses to hamburger menu.
- Hero height reduces to 70vh, text centered.
- Feature strip becomes stacked vertical blocks.
- Carousel becomes single‑card view with swipe gestures.
- Counters stack vertically.
- All parallax effects disabled (CSS media query).

---

## ℹ️ About Us Page – `about.html` <a name="about-us-page"></a>
### 1️⃣ Layout Overview
```
+----------------------------------------------------------+
| NAVBAR (same as home)                                    |
+----------------------------------------------------------+
| HERO (static image, fade‑in text)                        |
+----------------------------------------------------------+
| STORY TIMELINE (vertical)                                 |
|   • 2018 – Founded   → line‑draw animation               |
|   • 2020 – First commercial printer                         |
|   • 2022 – Expansion to 3 D‑metal printing                 |
+----------------------------------------------------------+
| TEAM GRID (cards, hover‑flip)                           |
|   4‑6 columns desktop, 2‑column tablet, 1‑column mobile  |
+----------------------------------------------------------+
| TECH SHOWCASE (muted video background)                  |
+----------------------------------------------------------+
| TRUST BADGES (partner logos, clip‑path wipe)            |
+----------------------------------------------------------+
| FOOTER                                                   |
+----------------------------------------------------------+
```
### 2️⃣ Component Details
- **Hero**: background‑image with dark overlay, headline `Our Story`, sub‑headline.
- **Timeline**: ordered list `<ul class="timeline">` with each `<li>` containing year, icon, description. GSAP draws SVG line connecting items when scrolled into view.
- **Team Cards**:
  - Front side: portrait (circular), name, role.
  - Back side (on hover/tap): short bio, social links.
  - Implemented with CSS `transform: rotateY(180deg)` and GSAP for smooth flip.
- **Tech Showcase**: video (`autoplay muted loop`) with text overlay “Cutting‑edge technology”. Video has fallback poster.
- **Trust Badges**: grid of partner logos; each appears with `clip-path` wipe animation.

### 3️⃣ Mobile Adjustments
- Timeline becomes horizontal scroll with small cards.
- Team cards become vertical stack; flip action turned into tap‑to‑expand accordion.
- Video reduces to static poster on low‑bandwidth.

---

## 🛍️ Products Page – `products.html` <a name="products-page"></a>
### 1️⃣ Layout Overview
```
+----------------------------------------------------------+
| NAVBAR                                                   |
+----------------------------------------------------------+
| HERO – Title "Products" + Search bar                     |
+----------------------------------------------------------+
| FILTER PANEL (left desktop, top collapsible mobile)       |
|   • Category dropdown                                    |
|   • Price range slider                                   |
|   • Colour swatch filter                                 |
+----------------------------------------------------------+
| PRODUCT GRID (cards)                                    |
|   Card layout: image, name, price, "View" button         |
+----------------------------------------------------------+
| RELATED PRODUCTS CAROUSEL (below grid)                  |
+----------------------------------------------------------+
| FOOTER                                                   |
+----------------------------------------------------------+
```
### 2️⃣ Component Details
- **Search Bar**: `<input type="search" placeholder="Search products...">` with debounce (300 ms) – GSAP fade‑in on focus.
- **Filter Panel**:
  - Desktop: sticky column (width 260 px) with `position: sticky; top: 80px;`.
  - Mobile: slide‑in drawer triggered by filter icon.
- **Product Card**:
  - Container `.product-card` – glass‑morphism, subtle shadow.
  - Image placeholder (will be swapped by colour picker on detail view).
  - Name (H3), price (bold), `button.btn-view`.
- **Related Carousel**: same style as featured carousel on home.

### 3️⃣ Mobile Layout
- Filter drawer appears from left, covering 80% width.
- Grid becomes single‑column list; each card spans full width.
- Carousel becomes swipe‑able.

---

## 🔎 Product Detail (Modal or Separate Page) <a name="product-detail"></a>
### 1️⃣ Layout Overview (Modal width 80% desktop, 100% mobile)
```
+----------------------------------------------------------+
| CLOSE X  |  Product Name (H2)                              |
+----------------------------------------------------------+
| LEFT column – 3‑D render / large image (with colour overlay)
+----------------------------------------------------------+
| RIGHT column –
|   • Colour Picker (swatches)                               |
|   • Specs list (bullet points)                             |
|   • Price                                                  |
|   • Buttons: "Buy on Allegro"  "Buy on Allegro Lokalnie" |
|   • CTA "Request a Quote" (pulse)                         |
+----------------------------------------------------------+
| BELOW – Testimonials slider (GSAP)                        |
+----------------------------------------------------------+
```
### 2️⃣ Interaction Details
- **Colour Picker**: set of circular swatches (`<button class="color-swatch" data-color="#ff0000">`). Clicking triggers GSAP `to` animation that cross‑fades the product image to the selected colour version.
- **External Purchase Buttons**: open new tab (`target="_blank"`). Styled with accent colour, subtle icon of Allegro.
- **Modal Accessibility**:
  - `role="dialog"`, `aria-modal="true"`.
  - Focus trap (first focus on close button).
  - ESC key closes modal.
- **Responsive**:
  - On mobile the modal becomes full‑screen page with a back arrow instead of close X.

---

## 📱 Responsive Design <a name="responsive-design"></a>
| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| **Desktop** | ≥1024 px | 4‑column product grid, sticky filter, full‑width hero.
| **Tablet** | 768‑1023 px | 2‑column grid, filter collapses to top bar, hero height 80vh.
| **Mobile** | ≤767 px | Hamburger nav, hero 70vh, vertical stacking, all parallax disabled, animations reduced if `prefers-reduced-motion`.

**Media Queries** (example):
```css
@media (max-width: 1024px) { /* tablet */ }
@media (max-width: 768px) { /* mobile */ }
@media (prefers-reduced-motion: reduce) { .gsap-anim { opacity:1; transform:none; } }
```

---

## 📘 Style‑Guide Summary (Markdown) <a name="style-guide-summary"></a>
> This section mirrors the **style‑guide** that would otherwise be a separate Figma file.

### Colors (CSS Variables)
```css
:root {
  --color-primary: #111111;   /* background, nav */
  --color-secondary: #F5F5F5; /* cards, sections */
  --color-accent: #00A8E8;    /* primary CTA */
  --color-highlight: #A8E600; /* colour‑picker */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #CCCCCC;
}
```
### Typography (Inter)
```css
h1 { font-size: 4rem; font-weight: 700; }
h2 { font-size: 2.5rem; font-weight: 600; }
h3 { font-size: 2rem; font-weight: 500; }
body, p { font-size: 1rem; font-weight: 400; line-height: 1.5; }
.small { font-size: 0.875rem; font-weight: 300; }
```
### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, var(--color-accent), #0066b2);
  color: #fff; border-radius: 8px; padding: 0.75rem 1.5rem;
  transition: transform 0.2s, background 0.2s;
}
.btn-primary:hover { transform: scale(1.03); }
```
### Cards
```css
.card {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
```
### Input – Colour Swatch
```css
.color-swatch {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid #fff; margin: 0.25rem; cursor: pointer;
}
.color-swatch.selected::after { content: "✓"; color: #fff; font-size: 1rem; position: absolute; inset: 0; display:flex; justify-content:center; align-items:center; }
```

---

## 🎬 Interaction & Animation Notes (for Phase 4) <a name="interaction-animation-notes"></a>
- All scroll‑triggered animations are defined in **gsap-config.js** (see *plan.md*).
- **Reduced‑motion**: wrap each GSAP timeline in `if (!prefersReducedMotion) { … }`.
- **Parallax**: disable via `@media (max-width: 768px) { .parallax { transform:none; } }`.
- **Hover micro‑animations** (buttons, cards) are pure CSS for instant feedback; GSAP adds staggered entrances on page load.
- **Colour‑picker transition**: `gsap.to(image, {opacity:0, duration:0.2, onComplete: () => {image.src = newSrc;}, opacity:1, duration:0.2});`

---

## ✅ Next Steps
1. Review this design spec – adjust any layout, wording, or component details.
2. Once approved, we will move to **Phase 2 – Front‑end Setup** (scaffold Vite, install GSAP, create base HTML/CSS files).
3. Ask if you need any additional assets (icons, logo variations) or a colour‑palette tweak.

---

*Prepared by Antigravity – your AI coding partner.*
