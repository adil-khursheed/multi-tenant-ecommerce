---
name: DTlea Mobile
description: Shopper companion for a curated multi-vendor marketplace, in the same warm gallery world as the web app.
colors:
  background: "#faf8f6"
  foreground: "#221b19"
  card: "#ffffff"
  primary: "#914216"
  primary-foreground: "#ffffff"
  secondary: "#fdf4ef"
  secondary-foreground: "#6b3d24"
  muted: "#f2ede8"
  muted-foreground: "#79706a"
  accent: "#f5dbc7"
  accent-foreground: "#6b3d24"
  border: "#e2dad3"
  input: "#e2dad3"
  ring: "#914216"
  destructive: "#c42a2a"
  destructive-foreground: "#ffffff"
  success: "#00894a"
  warning: "#d9a150"
  error: "#c42a2a"
typography:
  display:
    fontFamily: "CormorantGaramond-Regular"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.25
  headline:
    fontFamily: "CormorantGaramond-Regular"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "CormorantGaramond-Regular"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "DMSans-Regular"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DMSans-Medium"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.375
  caption:
    fontFamily: "DMSans-Regular"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  price:
    fontFamily: "DMSans-SemiBold"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  full: "9999px"
spacing:
  0.5: "2px"
  1: "4px"
  1.5: "6px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  24: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "48px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "48px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "48px"
  product-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
  tab-bar:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.none}"
  sheet:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
---

# Design System: DTlea Mobile

## Overview

**Creative North Star: "The Quiet Gallery, Pocket Edition"**

The mobile app is the same gallery as the web, scaled to the hand. Warm parchment is the ground, Cormorant Garamond is the label voice, and photography leads. The navigation and controls are more present than on web, but they stay quiet: hairline rules, squared fields, and one copper accent that marks price, action, and current location.

Because this is the shopper companion and not the seller console, the app can lean further into browsing. Product imagery is large and mostly untouchable by chrome; metadata sits underneath in a tight editorial stack. The five-tab bar is the one place where the system becomes unmistakably app-like, with a copper top indicator and spring motion rather than a Material or iOS default bar.

The palette and type match the web exactly. The platform differences are practical: no mono family is bundled, so prices use DM Sans SemiBold; corners stay square except for the 4px small control, 20px top-sheet radius, and full-circle icon affordances. Scaling is proportional from a 375px design width so the same composition holds on small and large phones.

**Key Characteristics:**

- Warm parchment ground with pure white reserved for cards, inputs, and the tab bar.
- Aged copper for price, primary action, active tab, and the shop header band.
- Cormorant Garamond display and headings; DM Sans for every control and label.
- Squared geometry by default; 4px controls, 20px sheet corners, circles for icon affordances.
- Photography and product cards carry the hierarchy.
- Serif card labels and a circular arrow affordance mark every editorial tile.
- Warm, low-opacity shadows at rest on product cards and the tab bar; deeper for sheets.
- Proportional scaling from 375px with moderate type scaling.
- Spring-based tab motion and slow image drift as the only habitual animation.
- Reduce Motion disables autoplay and entrance movement instead of merely shortening it.

## Colors

The web palette translated to native hex. Same roles, same rarity.

### Primary

- **Aged Copper** (`#914216`): Prices, primary buttons, active tab icon and label, the 3px tab indicator, the shop header band, selected sort rows, and discount text.
- **Copper Tint** (`#91421615`): A 8% alpha wash behind discount badges. Use alpha over a new token.

### Secondary

- **Linen** (`#fdf4ef`): Quiet section fills and image wells.
- **Cocoa** (`#6b3d24`): Secondary text on linen and the category eyebrow color.

### Tertiary

- **Apricot Wash** (`#f5dbc7`): Promotional tint, warm chips, and "TRENDING" ribbon ground.
- **Deep Cocoa** (`#6b3d24`): Text on apricot.

### Neutral

- **Warm Parchment** (`#faf8f6`): Screen ground; also the light text and chip text on copper bands.
- **Ink** (`#221b19`): Body, headings, and the "SALE" ribbon ground.
- **Card White** (`#ffffff`): Inputs, cards, and the tab bar.
- **Bone** (`#f2ede8`): Muted fills, disabled fields, image placeholders, unfilled star color.
- **Fog** (`#79706a`): Metadata, descriptions, inactive tabs, placeholder text.
- **Hairline** (`#e2dad3`): 1px borders, hairline dividers, and sheet handle.

### Semantic

- **Kiln Red** (`#c42a2a`): Cart badge, destructive actions, errors.
- **Moss** (`#00894a`): Savings and success.
- **Ochre** (`#d9a150`): Warnings and low-stock emphasis.

### Named Rules

**The Rare Copper Rule.** Copper marks price, action, active location, and one signature band per screen. Do not tint whole backgrounds with it beyond the shop header.

**The Warm Paper Rule.** The screen ground is `#faf8f6`. White is a card, input, or tab-bar material, not the canvas.

## Typography

**Display Font:** Cormorant Garamond (local `CormorantGaramond-*`)
**Body Font:** DM Sans (local `DMSans-*`)
**Price Font:** DM Sans SemiBold (no mono family is bundled on native)

**Character:** The same gallery pairing as web, with the mono price voice replaced by a tighter sans so the native bundle stays lean. Cormorant carries titles and editorial moments; DM Sans carries everything the shopper operates.

### Hierarchy

- **Display** (Cormorant 400, 36px, 1.25): Screen titles and editorial hero headings. Light or regular, never bold.
- **Headline** (Cormorant 400, 30px, 1.25): Section and collection titles.
- **Title** (Cormorant 400, 20px, 1.25): List-view product names, sheet titles, and profile names.
- **Body** (DM Sans 400, 16px, 1.5): Descriptions, form content, and empty-state copy.
- **Label** (DM Sans 500, 14px, 1.375): Buttons, field labels, active sort rows, and tab labels at 12px.
- **Caption** (DM Sans 400, 12px, 1.5): Metadata, helper text, and counts.
- **Price** (DM Sans 600, 14px, 1.3, Aged Copper): All monetary values, with the original price in 12px Fog and strikethrough.

### Named Rules

**The Two-Register Rule.** Cormorant is for display, headline, editorial tiles, and list product titles; DM Sans is for controls, labels, inputs, prices, and metadata. Never set a button or field in Cormorant.

**The Content Register Rule.** Rich-text text states map `fontFamily: serif` to Cormorant, `subHeading` to 30pt, and `heroHeading` to 36pt. Section headings authored in the CMS therefore arrive in the serif register rather than inheriting body sans.

**The Native Price Rule.** Prices are DM Sans SemiBold in Aged Copper. Do not add a mono font family just to match web; the 1:1 type system is intentional.

**The Capsule Label Rule.** Uppercase labels use `letterSpacing: 0.8–1` (roughly `0.06–0.08em` at 12px). Category eyebrows use `letterSpacing: 0.1` at 10px.

## Layout

Native layout is proportional to a 375pt design width. `horizontalScale` multiplies by width/375, `verticalScale` by height/812, and `moderateScale` softens type scaling by 50%. Padding follows a 4pt base with 16pt screen gutters, 12pt column gaps, and 24–32pt section spacing.

The shop uses a two-column grid of 3:4 product images with 12pt gaps and 16pt gutters; list view switches to a 120×160 image plus flexible copy. Category and collection tiles use the same 3:4 proportion, so the editorial blocks keep one image rhythm. Product detail leads with a full-width 4:3 image, then copy at 20pt gutters. Checkout and profile screens tighten to 16–24pt rhythm and use full-width primary actions.

The tab bar is a custom five-item bar: 22pt icons, 12pt labels, 3pt copper top indicator, safe-area bottom padding, and a Card White ground with a hairline top border. Screens sit under the safe area with their own headers rather than the native stack header.

## Elevation & Depth

Depth is soft and ambient. Product cards and the tab bar carry a low warm shadow at rest, then step up on press or when they float; bottom sheets and modals use the deeper end of the scale. List rows and inline content stay flat with hairline separators. The shadow color is always warm brown (`#241005`), never neutral black.

### Shadow Vocabulary

- **sm** (`#241005`, y 1, opacity 0.06, radius 3, elevation 1): Product cards at rest and the tab bar.
- **md** (`#241005`, y 2, opacity 0.08, radius 4, elevation 3): Card press, bottom sheets, and dropdown panels.
- **lg** (`#241005`, y 4, opacity 0.10, radius 6, elevation 5): Modal cards and the strongest allowed float.
- **Image overlay:** `linear-gradient(transparent, rgba(0,0,0,0.3))` at the bottom 40–45% of category and collection tiles, with a 1px text shadow at 50% for legibility.

### Named Rules

**The Soft Lift Rule.** Product cards and image tiles carry the warm sm shadow at rest and step to md on press. List rows and inline content stay flat; do not use elevation to fake hierarchy.

**The Warm Shadow Rule.** Shadows are warm brown at 6–10% opacity. No cool gray, no black glow.

## Shapes

The system is squared. Cards, inputs, buttons, chips, image wells, and list rows use 0 radius. Use 4px only for small utility buttons and hero product buttons; 20px only for the bottom corners of the shop header band and the top corners of sheets; full circles only for wishlist buttons, icon affordances, and count badges.

Borders are hairline (`StyleSheet.hairlineWidth`) in Hairline, or 1px in the same color for inputs. Avoid rounded cards, soft neumorphic surfaces, and decorative corner cuts.

## Components

### Buttons

- **Shape:** Squared (`0px`) for form and checkout actions; 4px for compact hero actions; full circles for icon-only controls.
- **Primary:** Aged Copper ground, white DM Sans Medium 16px, full width, 12–14pt vertical padding, no radius. Text is sentence case for forms and uppercase 12px with `0.8` tracking for hero links.
- **Hover / Press:** Pressed state drops opacity to 0.6–0.85 or shows `colors.accent`; there is no hover state. Disabled is 60% opacity.
- **Secondary / Outline:** Transparent ground with a 1px Aged Copper border and copper text; used for "Login to Checkout" and secondary hero links.

### Tab Chips

- **Shape:** Squared, 1px Hairline border, 16pt horizontal and 10pt vertical padding.
- **Type:** 11pt DM Sans Medium, uppercase, `1.2` tracking, Fog when inactive.
- **State:** Active fills Aged Copper with white text; pressed drops to 80% opacity. Never round chips or use sentence case.

### Product Cards

- **Shape:** Squared. Grid image is 3:4 with a warm `sm` shadow at rest, `expo-image` with `contentFit: cover` and a 300ms transition.
- **Ribbons:** Flush top-left, 9pt medium uppercase with `0.1` tracking. NEW = copper/white; SALE = Ink/Parchment; TRENDING = Deep Cocoa/Parchment.
- **Content:** 12pt gap above copy; 10pt uppercase Cocoa category; 14pt DM Sans Medium Ink title, two lines; 10pt Fog star count; 14pt SemiBold copper price with original price and an 8% copper discount chip.
- **Wishlist:** 28–32pt white/90 circle with a full radius, floating top-right over the image.
- **Editorial tile:** The overlay variant keeps the 3:4 crop, adds an 18pt Cormorant title over a bottom gradient, and sets price in a squared Aged Copper badge. It is for image-led grids only, never for the main shop listing.

### Tab Bar

- **Style:** Card White ground, hairline top border, warm `sm` shadow, five equal items, safe-area padding.
- **State:** Inactive icon and label are Fog; active is Aged Copper. A 3pt copper indicator slides along the top with a spring (damping 20, stiffness 300).
- **Badge:** Kiln Red full circle, 18pt minimum, white bold 10pt count, positioned top-right of the cart icon.

### Inputs / Fields

- **Style:** Card White ground, 1px Hairline border, 0 radius, 16pt text, 16pt horizontal and 12pt vertical padding. Labels are 14pt DM Sans Medium above the field.
- **Focus:** Border shifts toward the ring color; no glow.
- **Error / Disabled:** Kiln Red border and helper text for errors; 50–60% opacity for disabled.

### Bottom Sheets

- **Style:** Parchment ground, 20px top corners, warm `md` shadow, 40pt Hairline handle, 50% black backdrop.
- **Options:** Full-width rows with 16pt horizontal and 14pt vertical padding; the selected row is a solid Aged Copper block with white medium text.
- **Motion:** Present and dismiss with the native bottom-sheet spring; do not add a second custom transition.

### Shop Header

- **Character:** The one large copper moment in the app.
- **Style:** Aged Copper band with 20px bottom corners, safe-area top padding, 16pt gutters. Title is 30pt Cormorant in Parchment; active filters are Ink chips with Parchment text and a 12pt cancel icon; "Clear All" is 12pt copper.
- **Purpose:** Mark the shopping mode without turning every screen into a colored header.

### Image Tiles (Category / Collection)

- **Shape:** Squared, 3:4, hairline border at 70% Hairline, Linen ground, clipped image.
- **Label:** 24pt Cormorant in white, two lines maximum, with a 30pt circular arrow affordance at the lower right. Category and collection names keep the case authored in the CMS; do not force uppercase.
- **Overlay:** Bottom two-thirds gradient, transparent to `rgba(0,0,0,0.84)` over photography; a Linen-to-transparent gradient on the paper fallback.
- **Fallback:** When no image exists, render the first letter as a 128pt Cormorant watermark in 10% Aged Copper at the top right, with an Ink label and Hairline arrow circle. Never leave a blank gradient block.
- **Press:** Opacity 0.88, no scale.

### Hero Slider

- **Character:** A full-bleed editorial opener; photography fills the frame and the chrome stays at the bottom edge.
- **Overlay:** Transparent-to-`rgba(0,0,0,0.82)` gradient under the heading, subheading, and white CTA badge. The CTA carries a trailing arrow.
- **Controls:** Inline dots at the lower left, a tabular `01 / 04` counter, and a 32pt translucent pause/play circle at the lower right.
- **Motion:** Autoplay every 4s, stopped entirely under Reduce Motion. Manual pauses persist until the visitor resumes.

### Trust Signals

- **Style:** Three equal items inside a hairline top and bottom rule; thin vertical Hairline separators; no filled cards.
- **Content:** 18pt Aged Copper icon over a 9pt DM Sans Medium Fog label tracking `0.8`, centered.

### Motion

- **Habitual:** 300ms image fade, 4s slow image scale loop in the high-impact hero (1 → 1.04, reverse), 300ms list item layout transition, and the tab spring.
- **Rule:** Motion clarifies state or gives photography breath. Do not add scroll-jacking, parallax stacks, or decorative looping motion beyond the hero drift.
- **Reduce Motion:** Stop carousel autoplay, hero drift, and entrance translation; show the final state immediately. Do not replace them with shorter animations.

## Do's and Don'ts

### Do:

- **Do** keep the screen ground `#faf8f6` and reserve `#ffffff` for cards, inputs, and the tab bar.
- **Do** use Aged Copper for price, primary action, active tab, and the shop header band.
- **Do** set prices in DM Sans SemiBold copper at 14pt, with the original price in Fog 12pt strikethrough.
- **Do** keep cards, inputs, and image wells square; use circles only for wishlist, icon buttons, and count badges.
- **Do** use 16pt screen gutters and 12pt grid gaps, scaled proportionally from 375pt.
- **Do** use hairline borders, plus warm 6–10% shadows on cards, tiles, and the tab bar.
- **Do** set category and collection tile names in Cormorant with the circular arrow affordance.
- **Do** render a serif initial watermark when an editorial tile has no image.
- **Do** use the spring tab indicator and 300ms image fades as the default motion language.
- **Do** stop autoplay and entrance motion when Reduce Motion is enabled.

### Don't:

- **Don't** add a mono font family or mix a fourth typeface into the system.
- **Don't** round product cards, inputs, or primary controls; 20px is for sheet and header corners only.
- **Don't** use pure white as the screen canvas or cool gray borders.
- **Don't** introduce a second accent color or a full-screen gradient brand background.
- **Don't** add shadows to list rows or inline content; reserve them for cards, tiles, and floating chrome.
- **Don't** use the native tab bar or native stack header as a visual default; the app has its own chrome.
- **Don't** fabricate seller counts, ratings, or proof in empty states or promos; use implemented facts only.
