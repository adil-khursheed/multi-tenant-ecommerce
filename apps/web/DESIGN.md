---
name: DTlea Web
description: Curated multi-vendor marketplace with a warm, gallery-like editorial surface.
colors:
  background: "oklch(0.9801 0.0034 67.7835)"
  foreground: "oklch(0.2006 0.0138 34.3909)"
  card: "oklch(1 0 0)"
  primary: "oklch(0.4732 0.1247 46.2007)"
  primary-foreground: "oklch(1 0 0)"
  aged-copper-80: "oklch(0.4732 0.1247 46.2007 / 0.8)"
  secondary: "oklch(0.9728 0.0118 51.3225)"
  secondary-foreground: "oklch(0.404 0.0799 48.0849)"
  muted: "oklch(0.9508 0.008 73.7429)"
  muted-foreground: "oklch(0.5525 0.0155 53.167)"
  accent: "oklch(0.9097 0.0386 60.9712)"
  accent-foreground: "oklch(0.404 0.0799 48.0849)"
  border: "oklch(0.8958 0.013 63.9053)"
  input: "oklch(0.8958 0.013 63.9053)"
  ring: "oklch(0.4732 0.1247 46.2007)"
  destructive: "oklch(0.5343 0.1951 26.9711)"
  destructive-foreground: "oklch(1 0 0)"
  success: "oklch(0.55 0.15 155)"
  warning: "oklch(0.75 0.12 75)"
  error: "oklch(0.5343 0.1951 26.9711)"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(48px, 7vw, 96px)"
    fontWeight: 300
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.015em"
  label:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.1em"
  price:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  none: "0px"
  hairline: "2px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  12: "48px"
  16: "64px"
  24: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "0 8px"
    height: "28px"
  button-primary-hover:
    backgroundColor: "{colors.aged-copper-80}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    height: "28px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0 8px"
    height: "28px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
    height: "28px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "16px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    height: "20px"
---

# Design System: DTlea Web

## Overview

**Creative North Star: "The Quiet Gallery"**

DTlea reads as a warm, quiet gallery for things made by many hands. The page is warm paper, the photography is the exhibit, and the interface is the wall label: small, exact, and never louder than the work. Cormorant Garamond supplies the editorial voice; DM Sans handles every operational task. Aged copper appears only where the visitor must act or read a price, so the accent keeps its authority.

This is a marketplace, not a single brand, so the system has to hold multiple seller identities without becoming a collage. It does that by keeping the frame constant: one parchment ground, one copper accent, one hairline border language, one squared control geometry. Seller logos, banners, and product imagery can be loud inside that frame.

The system is editorial on discovery surfaces and compact on operational ones. Marketing pages breathe at gallery scale; shop, cart, checkout, and account screens tighten to a 14px base and 28px controls. Dark mode inverts to warm ink rather than cool gray, preserving the paper-and-copper relationship.

**Key Characteristics:**
- Warm parchment canvas; pure white is reserved for cards and inputs.
- Aged copper accent used for price, action, and one signature moment per screen.
- Cormorant Garamond display against DM Sans UI text.
- Squared controls with hairline warm borders; circles only for icon affordances and badges.
- Photography carries hierarchy; chrome recedes.
- Soft, warm ambient shadows at rest on cards and product tiles; deeper only for overlays.
- Wide-tracked uppercase micro-labels as the recurring editorial signature.

## Colors

A warm, low-chroma paper palette with a single copper accent and three quiet semantic tones.

### Primary
- **Aged Copper** (`oklch(0.4732 0.1247 46.2007)`): Prices, primary buttons, active navigation underline, focus rings, the "NEW" ribbon, and the active option in sort/filter surfaces. It is the only saturated brand color.
- **Aged Copper 80** (`oklch(0.4732 0.1247 46.2007 / 0.8)`): Hover fill for primary buttons. Created by opacity, never by a second hex.

### Secondary
- **Linen** (`oklch(0.9728 0.0118 51.3225)`): Product image wells, quiet section fills, and hover surfaces. The near-neutral warm tint that keeps a block from reading as pure white.
- **Cocoa** (`oklch(0.404 0.0799 48.0849)`): Secondary text on linen and the accent-foreground used for category labels.

### Tertiary
- **Apricot Wash** (`oklch(0.9097 0.0386 60.9712)`): Promotional tint, accent chips, and the warmest non-primary surface. Use as a wash, not as a button fill.

### Neutral
- **Warm Parchment** (`oklch(0.9801 0.0034 67.7835)`): The page ground. Never replace with `#fff` for page surfaces.
- **Ink** (`oklch(0.2006 0.0138 34.3909)`): Body copy, headings, and the "SALE" ribbon ground.
- **Card White** (`oklch(1 0 0)`): Cards, inputs, and the mobile tab bar only.
- **Bone** (`oklch(0.9508 0.008 73.7429)`): Muted fills, disabled surfaces, image placeholders.
- **Fog** (`oklch(0.5525 0.0155 53.167)`): Secondary copy, metadata, ratings counts, and placeholder text.
- **Hairline** (`oklch(0.8958 0.013 63.9053)`): The 1px border used on cards, inputs, header, and product wells.

### Semantic
- **Kiln Red** (`oklch(0.5343 0.1951 26.9711)`): Destructive actions and errors.
- **Moss** (`oklch(0.55 0.15 155)`): Success and savings confirmations.
- **Ochre** (`oklch(0.75 0.12 75)`): Warnings and low-stock emphasis.

Dark mode is a warm ink inversion: ground `oklch(0.1433 0.0059 41.0395)`, body `oklch(0.8939 0.0129 56.235)`, primary `oklch(0.7023 0.0794 64.6432)`. It brightens the copper rather than shifting to a cool accent.

### Named Rules
**The Rare Copper Rule.** Aged Copper covers no more than roughly 5% of any screen. It belongs on price, primary action, active state, and one signature element. If a layout has three copper moments, remove one.

**The Warm Paper Rule.** The page ground is Warm Parchment. Pure white is a card, input, or overlay material, never the canvas.

**The Kiln Line Rule.** Borders are one hairline in Hairline, or `ring-foreground/10` on cards. No second border color, no 2px decorative outlines except the hero's secondary CTA.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif)
**Body Font:** DM Sans (with ui-sans-serif, system-ui)
**Mono Font:** Geist Mono (with ui-monospace)

**Character:** Cormorant is the gallery label, DM Sans is the wall text, and Geist Mono is the price tag. The pairing keeps editorial warmth without letting the interface become a magazine pastiche.

### Hierarchy
- **Display** (300, `clamp(48px, 7vw, 96px)`, 0.92): Hero statements only. Tight tracking (`-0.03em`), maximum width around 600px, italic used sparingly for emphasis.
- **Headline** (400, 30–36px, 1.1): Page and section titles, empty-state titles, and editorial block headings. Never bold.
- **Title** (DM Sans 500, 14px, 1.3): Product names in grids, card titles, form section labels. This is the typical UI title weight, not a serif moment.
- **Body** (400, 14px, 1.6, tracking `0.015em`): Descriptions, prose, helper copy. Keep marketing prose at 60–75ch; account and checkout copy at 45–65ch.
- **Label** (500, 10–12px, tracking `0.1em`, uppercase): Category eyebrows, ribbons, trust-bar items, table headers, and nav. These labels are the system's most repeated editorial signature.
- **Price** (Geist Mono 500, 16px, 1.2, Aged Copper): All monetary values in product grids, cart, and hero product tags. Tabular rhythm matters more than size.

### Named Rules
**The Two-Register Rule.** Serif is for display, headline, and editorial product names; sans is for controls, labels, metadata, and body. Never set a button, input, badge, or table cell in Cormorant.

**The Mono Price Rule.** Prices use Geist Mono in Aged Copper. Do not set prices in the serif face or invent a fourth type family.

**The Micro-Label Rule.** Uppercase labels use `0.1em` tracking at 10px and `1.8px` tracking at 12px in the nav. Do not add uppercase labels without the tracking that makes them legible.

## Layout

The web app is a centered container system. Breakpoints are 40rem (640), 48rem (768), 64rem (1024), 80rem (1280), and 86rem (1376). Container padding is 1rem on small screens and 2rem from medium up. The 12-column grid drives editorial blocks; product grids collapse from four columns to two on mobile.

Discovery surfaces use gallery spacing: 48–96px between major sections, full-bleed imagery inside a contained frame, and a 55/45 split hero at `min-h-dvh`. Operational surfaces (cart, checkout, account, seller tools) use tighter 16–24px rhythm and 28px control heights.

Product grids use a 4:5 image well with 1:1 square variant tiles in editorial blocks. Cards are separated by whitespace, not borders, except for the hairline around inputs and selectable surfaces. Mobile keeps 16px horizontal padding and a two-column product grid.

## Elevation & Depth

Depth is soft and ambient. Cards and product tiles lift slightly at rest with a low warm shadow, then step up on hover; dropdowns, drawers, and the floating hero product tag use the deeper end of the scale. Surfaces never look glassy or dramatically lifted. The shadow color is warm (`#241005`) rather than neutral black.

### Shadow Vocabulary
- **Ambient 2xs** (`0 1px 3px 0px hsl(21.2903 75.6098% 8.0392% / 0.03)`): Product tiles and cards at rest.
- **Ambient sm** (`0 1px 3px 0px hsl(21.2903 75.6098% 8.0392% / 0.06), 0 1px 2px -1px hsl(21.2903 75.6098% 8.0392% / 0.06)`): Card hover, menus, and small floating panels.
- **Ambient md/lg** (`0 2px 4px -1px` / `0 4px 6px -1px` at 6%): Dropdowns, sheets, and the mobile tab bar.
- **Ambient 2xl** (`0 1px 3px 0px hsl(21.2903 75.6098% 8.0392% / 0.15)`): The strongest allowed shadow, still quiet.
- **Blur and border instead of glow** on hero overlays: `bg-background/85` with `backdrop-blur-md` and `border-border/40`.

### Named Rules
**The Soft Lift Rule.** Cards and product tiles carry the warm 2xs shadow at rest and the sm shadow on hover. Do not use elevation to fake importance; the lift is a material cue, not a hierarchy cue.

**The Warm Shadow Rule.** Shadows are warm brown at 3–15% opacity. No cool gray, no black glow, no colored halo.

## Shapes

The system is squared and rectilinear. Default control radius is 0; the hero's secondary CTA uses 2px, and collection strips may use 4px. Full circles are reserved for icon buttons, wishlist affordances, and badges. Product imagery is clipped square, 4:5, or 3:4 with no rounding except where a card explicitly clips its media.

Borders are one hairline (`1px`), often at 40–100% of Hairline. Avoid thick borders, double borders, and decorative corner treatments. The form language is a print frame, not a soft app surface.

## Components

### Buttons
- **Shape:** Squared (`0px`), with full circles only for icon-only actions.
- **Primary:** Aged Copper ground, white text, 12px/relaxed DM Sans, 28px height, 8px horizontal padding. Uppercase hero CTAs use 13px text, `0.08em` tracking, 32px vertical padding, and 2px radius.
- **Hover / Focus:** Primary darkens by opacity to `primary/80`. Focus is a 2px `ring` at 30% opacity with a ring-colored border. Active state translates down 1px. Disabled is 50% opacity.
- **Secondary / Ghost / Outline:** Outline uses a Hairline border and `bg-input/50` on hover; ghost is transparent with a muted hover fill; the hero's secondary CTA is a 1.5px Ink border that inverts to Ink ground with Parchment text.

### Badges
- **Style:** Full pill, 20px height, 10px medium uppercase text. Primary badges are Aged Copper on white; outline badges use Hairline and `bg-input/20`.
- **State:** Ribbons are square, not pills: top-left, 9px bold uppercase with widest tracking. NEW = copper, SALE = Ink, TRENDING = Cocoa.

### Cards / Containers
- **Corner Style:** Squared (`0px`) for product cards; 4px maximum for media strips.
- **Background:** Card White, or Linen for image wells.
- **Shadow Strategy:** Warm 2xs at rest, sm on hover; see Elevation.
- **Border:** `ring-1 ring-foreground/10` or a single Hairline border.
- **Internal Padding:** 16px, 12px for compact cards, 24px for editorial panels.

### Inputs / Fields
- **Style:** 28px height, Hairline border, Card White with `bg-input/20`, squared corners, 14px DM Sans.
- **Focus:** Border becomes `ring` and a 2px 30% ring appears. No glow.
- **Error / Disabled:** Error uses Kiln Red border and a 20% ring; disabled drops to 50% opacity with a not-allowed cursor.

### Navigation
- **Style:** Parchment ground with a single bottom Hairline. Logo left, uppercase 12px nav at `1.8px` tracking, account and cart icons right as ghost icon buttons.
- **States:** Active and hover use a 2px Aged Copper underline that animates up into place; the label stays Ink.
- **Mobile:** A dedicated mobile menu sheet; icons remain 20px ghost buttons.

### Product Grid Item
- **Character:** A gallery placard under a 4:5 image.
- **Image:** Linen well, `object-cover`, a warm 2xs shadow at rest, and 1.03 scale on hover over 300ms.
- **Overlay:** Vendor pill appears top-left on hover as a white/90 blurred chip; wishlist becomes a 32px white/90 circle top-right.
- **Text:** 10px uppercase Cocoa category, 14px medium Ink title, 16px Geist Mono copper price. Ribbons are square and sit flush to the image corner.

### Editorial Hero
- **Character:** A two-panel gallery spread. 55% text on Parchment, 45% image with a slow 8s scale loop.
- **Type:** Serif display at `clamp(48px, 7vw, 96px)` with `0.92` line height and negative tracking.
- **Overlay:** Floating product tag uses `bg-background/85`, `backdrop-blur-md`, a `border-border/40` hairline, and a circular Ink button. It floats; it does not glow.

### Trust Marquee
- **Character:** A quiet ticker, not a promotional banner.
- **Style:** 14px medium uppercase at wide tracking, 4px gap, transparent ground, gradient-masked edges, 40s linear scroll, pauses on hover. Icons are copper.

## Do's and Don'ts

### Do:
- **Do** keep the page ground on Warm Parchment and reserve Card White for real surfaces.
- **Do** use one Aged Copper action per view and let price be the second copper moment.
- **Do** set all prices in Geist Mono, Aged Copper, at 16px in grids.
- **Do** use Cormorant only for display and editorial headlines.
- **Do** use 10px uppercase labels at `0.1em` tracking for eyebrows, ribbons, and metadata.
- **Do** keep controls squared; use circles only for icon buttons, wishlist, and badges.
- **Do** give cards and product tiles a soft warm shadow at rest, stepping up on hover.

### Don't:
- **Don't** introduce a second accent color, gradient brand background, or colored glow.
- **Don't** use pure white as the page canvas or neutral gray borders in the warm frame.
- **Don't** set buttons, inputs, prices, or nav in Cormorant.
- **Don't** round product images, cards, or primary controls beyond 4px.
- **Don't** use hard, cool, or high-opacity shadows; keep them warm and under 15%.
- **Don't** use more than one uppercase tracking value on the same line of text.
- **Don't** fabricate proof, testimonials, or seller counts in hero or trust surfaces; use only implemented facts.
- **Don't** carry inherited demo claims such as "200+ Artisan Vendors" or "100% Authentic Handwoven" into new surfaces unless they are verified.
