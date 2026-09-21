# SI 3D PROJECT – Detailed Website Plan

---

## 1. Project Overview
- **Company**: SI 3D PROJECT – specialist in 3‑D printing.
- **Goal**: Showcase products, allow colour‑customisation on product pages, and direct visitors to external purchase sites (Allegro, Allegro Lokalnie).
- **Target Feel**: Apple‑style – sleek, minimalist, premium, modern.
- **Pages**: 
  1. **Home** – hero, brand story, featured products, CTA.
  2. **About Us** – mission, team, technology, trust signals.
  3. **Products** – product catalogue with colour picker, specs, external‑shop links.

---

## 2. Brand System
### 2.1 Typography
| Use | Font | Weight | Size (Desktop) | Size (Mobile) |
|-----|------|--------|----------------|---------------|
| Heading 1 (H1) | **Inter** – Google Font – `Inter` | 700 | 4rem (64px) | 2.5rem (40px) |
| Heading 2 (H2) | Inter | 600 | 2.5rem (40px) | 2rem (32px) |
| Heading 3 (H3) | Inter | 500 | 2rem (32px) | 1.75rem (28px) |
| Body Text | Inter | 400 | 1rem (16px) | 0.95rem (15px) |
| Small UI Text | Inter | 300 | 0.875rem (14px) | 0.8rem (13px) |
> **Note** – Load via `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`.

### 2.2 Color Palette (Luxury‑Score: 8/10 → slow, deliberate animations)
| Role | HEX | Usage |
|------|-----|-------|
| **Primary** (Deep Charcoal) | `#111111` | Background, headers, nav bar |
| **Secondary** (Soft Silver) | `#F5F5F5` | Card backgrounds, section dividers |
| **Accent** (Electric Blue) | `#00A8E8` | CTA buttons, link highlights |
| **Highlight** (Lime Green) | `#A8E600` | Interactive colour‑picker swatches |
| **Text Primary** | `#FFFFFF` | Light‑theme text on dark bg |
| **Text Secondary** | `#CCCCCC` | Sub‑text, footers |
> All colours are defined in `:root` CSS variables for easy theming.

### 2.3 UI Elements
- **Buttons**: Rounded (8 px) with subtle glass‑morphism gradient and a faint inner‑shadow. Hover: background‑gradient deepens, scale 1.03.
- **Cards**: Soft‑blur backdrop (`backdrop-filter: blur(12px)`) with thin border `1px solid rgba(255,255,255,0.08)`. Hover: lift (`transform: translateY(-4px)`) and shadow.
- **Inputs (Colour picker)**: Circle swatches with border `2px solid #fff`. Selected swatch shows a check‑mark SVG overlay.
- **Navigation**: Fixed transparent bar, becomes solid on scroll (opacity 0.9).

---

## 3. Page Structure & Wireframes
### 3.1 Home (`index.html`)
1. **Hero Section** – full‑height background image (parallax). Overlay: H1, tagline, primary CTA “Explore Products”.
2. **Feature Strip** – three icon‑plus‑text blocks (speed, precision, material range).
3. **Featured Products Carousel** – GSAP‑driven slide‑in cards.
4. **Numbers Counter** – “+200 prints”, “99 % satisfaction”, animated with GSAP `counter`.
5. **CTA Section** – pulsing “Get a Quote” button.
6. **Footer** – minimal links, social icons.

### 3.2 About Us (`about.html`)
1. **Hero** – static hero with subtle fade‑in text.
2. **Story Timeline** – vertical timeline with line‑draw animation.
3. **Team Grid** – cards with hover‑flip showing short bio.
4. **Tech Showcase** – video background (muted) with overlay text.
5. **Trust Badges** – logos with clip‑path wipe animation.

### 3.3 Products (`products.html`)
1. **Hero** – heading + search bar.
2. **Category Filters** – sticky left bar (desktop) or collapsible top bar (mobile).
3. **Product Grid** – cards (image, name, price, “View”).
4. **Product Detail Modal** (or separate page) –
   - Large product render (placeholder 3‑D view).
   - **Colour Picker** – swatches; on click changes image via GSAP `to` colour transition.
   - **External Purchase Buttons** – “Buy on Allegro”, “Buy on Allegro Lokalnie”.
5. **Related Products Carousel** – staggered reveal.

---

## 4. GSAP Animation Layer (Step 4)
| Animation | Trigger | Details |
|-----------|---------|---------|
| **Hero entrance stagger** | Page load | H1, sub‑head, CTA appear sequentially (0.2 s delay) with `y:30→0` and opacity.
| **Parallax background depth** | Scroll | `data-speed` attribute on sections; GSAP `ScrollTrigger` moves background at 0.4× scroll speed. Disabled on `@media (max‑width: 768px)`.
| **Section fade‑ups** | Scroll | Each `.section` fades from 0→1 and translates `y:20→0` when 80 % visible.
| **Staggered card reveals** | Scroll | Product cards use `.from('.card', {opacity:0, y:40, stagger:0.1})`.
| **Animated number counters** | Scroll (when counters enter viewport) | `gsap.to(counter, {innerText: target, duration: 2, ease: "power2.out"})`.
| **Clip‑path image wipes** | Scroll | Images appear with `clip-path: polygon(0 0, 0 0, 0 100%, 0 100%)` → full polygon.
| **Line‑draw divider** | Scroll | SVG path drawn with `stroke-dasharray` animation.
| **CTA pulse** | Idle (no scroll for 3 s) | Subtle `scale` pulsation on primary button.
| **Testimonial slider** | Auto / manual | `gsap.timeline({repeat:-1, paused:true})` with fade‑cross‑fade.
| **Smooth anchor scroll** | Click on nav links | `gsap.to(window, {scrollTo: target, duration: 1, ease: "power3.out"})`.
| **Animation speed** | Brand luxury score 8 → `duration` multiplied by 1.2 (slower).
| **Reduced‑motion respect** | `prefers-reduced-motion` media query – disable all scroll‑triggered animations, fallback to instant visibility.

---

## 5. Accessibility & Responsiveness
- **ARIA** roles for navigation, buttons, and modal dialogs.
- **Keyboard** navigation: focus trap inside product modal.
- **Contrast**: meet WCAG AA (minimum 4.5:1 for text).
- **Responsive breakpoints**: 1440 px, 1024 px, 768 px, 480 px.
- **Parallax disabled** on mobile via CSS (`@media (max-width: 768px) { .parallax { transform:none; } }`).
- **Reduced‑motion** media query disables GSAP transitions.

---

## 6. Implementation Phases
| Phase | Duration | Milestones | Deliverables |
|-------|----------|------------|--------------|
| **1. Discovery & Design** | 1 week | Brand audit, colour‑palette finalisation, typography selection, wireframes. | Figma mockups, style‑guide markdown. |
| **2. Front‑end Setup** | 1 week | Project scaffold (Vite + vanilla JS), install GSAP, set up CSS variables, global layout. | Repo with `index.html`, `about.html`, `products.html`, `src/css/`, `src/js/`. |
| **3. UI Development** | 2 weeks | Implement navigation, hero, cards, colour picker UI, responsive grid. | Fully functional static pages (no animation yet). |
| **4. Animation Layer** | 1 week | Add GSAP, configure ScrollTrigger, implement all listed animations, test reduced‑motion & mobile. | Animated site, animation‑config file (`gsap-config.js`). |
| **5. Product Detail & External Links** | 1 week | Build product modal/page, integrate colour‑swap, add Allegro buttons, test external redirects. | Dynamic product view with working links. |
| **6. SEO & Performance** | 3 days | Meta tags, Open‑Graph, lazy‑load images, minify CSS/JS, Lighthouse audit ≥ 90. | Optimised assets, `index.html` meta. |
| **7. Testing & QA** | 4 days | Cross‑browser (Chrome, Safari, Edge), device testing, accessibility audit. | Test report, bug‑fix list. |
| **8. Deployment** | 2 days | Set up GitHub repo, CI (GitHub Actions) to build Vite, deploy to Netlify/Vercel. | Live URL, deployment documentation. |

---

## 7. File Structure (suggested)
```
si-3d-project/
├─ index.html
├─ about.html
├─ products.html
├─ assets/
│   ├─ images/          # product renders, hero backgrounds
│   └─ fonts/           # optional self‑hosted fonts
├─ src/
│   ├─ css/
│   │   ├─ base.css     # resets, variables
│   │   ├─ layout.css   # grid, flex helpers
│   │   └─ components.css
│   ├─ js/
│   │   ├─ main.js      # site‑wide init
│   │   └─ gsap-config.js
│   └─ data/
│       └─ products.json # product catalogue (name, images, price, URLs)
└─ README.md
```

---

## 8. Next Steps
1. Approve this plan (or suggest adjustments).
2. Choose a repository host (GitHub) and create the project folder.
3. I can scaffold the Vite project and push initial commit, or you may start manually.

---

*Prepared by Antigravity – your AI coding partner.*
