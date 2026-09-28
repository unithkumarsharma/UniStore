---
name: UniStore
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#f0eeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#574237'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ec'
  outline: '#8b7265'
  outline-variant: '#dec1b1'
  surface-tint: '#9a4600'
  primary: '#9a4600'
  on-primary: '#ffffff'
  primary-container: '#f47a20'
  on-primary-container: '#582500'
  inverse-primary: '#ffb68c'
  secondary: '#5a5f65'
  on-secondary: '#ffffff'
  secondary-container: '#dee3ea'
  on-secondary-container: '#60656b'
  tertiary: '#805600'
  on-tertiary: '#ffffff'
  tertiary-container: '#d18f00'
  on-tertiary-container: '#482f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#dee3ea'
  secondary-fixed-dim: '#c2c7ce'
  on-secondary-fixed: '#171c21'
  on-secondary-fixed-variant: '#42474d'
  tertiary-fixed: '#ffddaf'
  tertiary-fixed-dim: '#ffba43'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#614000'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The brand represents a modern, curated everyday commerce platform that elevates lifestyle and personal technology shopping into an inspiring, high-trust experience. Built around the ethos of "Discover More. Live Better," the platform caters to design-conscious digital natives and discerning shoppers seeking thoughtfully selected goods that balance premium utility with accessible value.

The visual style blends **Editorial Minimalism** with **Warm Tactility**. Rather than cold, sterile marketplace patterns, the design system utilizes generous optical margins, warm cream foundation layers, and deeply intentional hierarchy. The emotional target is immediate trust, quiet confidence, and tactile delight: interfaces feel tactile and tangible through soft ambient illumination, deliberate corner curvature, and decisive typographic contrast. High-frequency utility surfaces remain uncluttered, letting rich product photography and curated lifestyle collections lead the visual field.

## Colors

The color system establishes a deliberate balance between grounding depth, warm natural light, and high-energy transactional focus:

- **Primary Interactive (#F47A20):** Reserved strictly for high-intent conversions, key shopping triggers, "Add to Cart" sticky CTAs, active states, and critical notification pips. It should not be overused as decorative background fills.
- **Deep Charcoal Grounding (#151A1F):** Anchors the typographic hierarchy, high-contrast dark badges, hero narrative blocks, and premium category headers. Provides decisive legibility and an upscale editorial tone against pale backdrops.
- **Warm Gold (#FFB52E):** Dedicated exclusively to trust signals, verified customer ratings, star aggregators, editor's picks, and loyalty tier markers.
- **Soft Cream (#FFF9F1) & Pure White (#FFFFFF):** Form the alternating foundation surfaces. `#FFF9F1` is used for editorial feature wells, promo banners, and hero modules, while pure `#FFFFFF` isolates discrete interactive cards and transactional sheets.
- **Soft Warm Gray (#F4F2EE) & Slate Muted (#66707A):** Provide subtle structural delimitation. `#F4F2EE` powers hairline separators and inactive surface wells, while `#66707A` controls supporting specifications, secondary metadata, and delivery promises.

## Typography

The typographic hierarchy utilizes Plus Jakarta Sans across all layers to maintain contemporary geometric clarity and approachable warmth. Headings leverage bold and extra-bold weights paired with tight negative letter-spacing, providing a confident, high-fashion catalog authority. Body copy relies on generous line heights to facilitate effortless scanning through technical specs, editorial reviews, and checkout steps.

Numbers and financial currency displays must use proportional figures with tabular numeric alignment enabled (`font-variant-numeric: tabular-nums`) to ensure price alignment across comparison matrices and cart summaries.

## Layout & Spacing

The layout is built on a responsive 12-column grid for desktop environments (max-width 1280px, centered with 3rem external canvas margins and 1.5rem column gutters) that folds down to a 4-column fluid structure on mobile devices (1rem margin, 1rem gutter).

Vertical rhythm operates on a rigid 8pt base unit. Product listing grids display standard 2-column formats on mobile with comfortable 12px gaps, expanding to 3 or 4 columns on tablet and desktop viewports. To preserve the tactile, unhurried browsing experience, generous vertical spacing (`space-xl` and above) separates discovery carousels and promotional sections, avoiding claustrophobic supermarket densification.

## Elevation & Depth

Depth is established through soft ambient lighting and layered tonal planes rather than harsh borders or dark drop-shadows:

- **Surface Ground (Level 0):** Neutral warm canvas `#F4F2EE` or soft cream wells `#FFF9F1` resting completely flat.
- **Card Tier (Level 1):** Pure white `#FFFFFF` product tiles elevated with an ultra-diffused, warm-tinted shadow: `0 8px 24px -4px rgba(21, 26, 31, 0.05), 0 2px 6px -1px rgba(21, 26, 31, 0.03)`. This shadow carries a faint trace of charcoal tone to ground items physically.
- **Hover & Focused Cards (Level 2):** Slight upward translation (-2px) accompanied by an expanded ambient spread: `0 16px 32px -6px rgba(21, 26, 31, 0.08), 0 4px 10px -2px rgba(21, 26, 31, 0.04)`.
- **Floating Overlays & Sticky Sheets (Level 3):** Bottom navigation bars, filter sheets, and sticky checkout bars float above content with a deep backdrop blur (`backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.88)`) reinforced by a soft omnidirectional glow: `0 -4px 20px rgba(21, 26, 31, 0.06)`.

## Shapes

The design system incorporates a generous curvature philosophy (`roundedness: 2`) that brings soft sophistication to modern consumer electronics and lifestyle goods. 

Primary content and product cards feature 16px (`rounded-lg`) to 24px (`rounded-xl`) corner radii, visually softening dense catalog grids. Category pill chips, primary interactive action buttons, search fields, and status badges utilize full organic encapsulation (`rounded-full` / pill shapes). Micro-elements such as checkboxes and step indicators maintain a disciplined 4px to 6px radius to prevent structural distortion.

## Components

### Buttons
- **Primary Action:** Solid `#F47A20` fill with crisp `#FFFFFF` typography (`label-lg`), pill-shaped geometry (`rounded-full`), padded with 14px vertical and 28px horizontal spacing. Interactive states trigger subtle brightness shifts without perimeter rings.
- **Secondary / Ghost:** `#151A1F` high-contrast outline (1.5px) or solid `#151A1F` fill for editorial storytelling triggers.
- **Sticky Buy Bar:** Fixed mobile viewport element pinned to bottom safe-area containing product thumbnail, dual price/installment specs, and a high-prominence primary "Add to Cart" trigger occupying >60% width.

### Product & Promo Cards
- Constructed with `#FFFFFF` surfaces, `rounded-xl` corners, and subtle warm hairline borders (`1px solid #F4F2EE`).
- Image containers feature a neutral `#F4F2EE` inner backing with an aspect ratio of 1:1 or 4:5, showcasing lifestyle photography flush to the borders.
- Discount tags and trust markers float pinned at `top: 12px; left: 12px` using charcoal or warm orange micro-badges.

### Chips & Filter Pills
- Fully rounded pills with minimal 1px `#F4F2EE` borders and `#FFFFFF` background.
- Selected state flips immediately to solid `#151A1F` background with `#FFFFFF` text, bypassing decorative checkmarks for clean typographic toggle recognition.

### Navigation & Bottom Dock
- **Mobile Bottom Dock:** 64px floating or docked bar with ultra-smooth glassmorphic backing (`rgba(255, 255, 255, 0.9)`), balanced across 4 or 5 primary tabs (Discover, Categories, Saved, Cart, Account). Active tab highlighted with `#F47A20` and an illuminated micro dot indicator.

### Input Fields & Controls
- **Form Controls:** 48px standard touch height, filled with `#FFFFFF`, bordered with 1px `#F4F2EE`. Focused states smoothly transition border to `#151A1F` with zero abrasive glow rings.
- **Checkboxes & Radios:** 20px geometric toggles with `#151A1F` or `#F47A20` active fills and stark white glyphs.

### Trust Badges & Step Indicators
- **Trust Seals:** Horizontal row layout with 16px geometric icons (delivery, authentication, secure payment) accompanied by `body-sm` muted text in `#66707A`.
- **Checkout Step Indicator:** Minimalist connected line tracker; active step utilizes solid `#F47A20` circular nodes with numeric labels, completed steps turn `#151A1F`, and future steps rest in `#F4F2EE`.