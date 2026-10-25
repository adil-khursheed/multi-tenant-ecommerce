# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Shoppers on iOS and Android: people discovering and buying from multiple independent sellers in one curated marketplace. They expect each platform's native navigation, gestures, and accessibility behavior. Sellers and platform admins are not users of this app.

## Product Purpose

The DTlea mobile app is the shopper-only companion to the DTlea multi-vendor marketplace. It lets shoppers browse the marketplace and seller storefronts, save items, build a multi-seller cart, complete checkout, and manage their orders and addresses while away from a desktop. What success should be measured by is still an open decision.

## Positioning

The app carries the same marketplace position as DTlea on the web: sellers are admitted through application and manual verification, and shoppers buy from approved sellers in one place. Its distinct value is the native mobile shopping experience, not a separate catalog or seller toolset. The marketplace is intended to serve general multi-vendor commerce, although current launch surfaces still use inherited women's fashion copy.

## Operating Context

- Shoppers move between home, shop, cart, wishlist, and profile tabs, plus product detail, search/filter, and a multi-step checkout.
- Carts can contain items from several sellers; checkout and order summaries preserve the seller grouping.
- Authentication is required for profile, orders, wishlist, and addresses; guest browsing and checkout flows exist.
- Seller onboarding, store management, and admin work stay on the web app.

## Capabilities and Constraints

- Built with Expo 56 and React Native, using Expo Router, typed routes, and the React Compiler experiment.
- Targets both iOS and Android from one codebase and should respect each platform's native patterns and affordances.
- Consumes the shared tRPC API (`@repo/api`) and shared payment adapters (`@repo/payments`).
- Shopper surfaces implemented include home, shop, product detail, cart, wishlist, checkout, order history, addresses, profile, login, and registration.
- No seller or admin tooling is in scope for this app.
- Current launch catalog copy is women's fashion; broader catalog framing is the intended direction, and the fashion copy is inherited for now.
- Pricing and seller verification in the current backend are India-specific (INR, PAN/GST/IFSC), while the confirmed product direction is global from day one. That mismatch is an open implementation gap, not a shipped global capability.

## Brand Commitments

- Product name: **DTlea**.
- Existing customer-facing copy frames DTlea around curated sellers and women's fashion. Treat that as inherited launch copy, not a long-term category promise.
- No formal voice or tone guide has been confirmed.

## Evidence on Hand

- There are no real testimonials, case studies, press mentions, sales figures, or customer logos. Do not fabricate proof.
- Home and product content is served from the shared Payload CMS; seed content is demo content, not DTlea evidence.
- Product claims should be limited to functionality that is actually implemented.

## Product Principles

1. **Native first:** use each OS's expected navigation, gestures, and accessibility behavior rather than imitating the web app.
2. **Trust before supply:** show only sellers that have been verified and activated by DTlea.
3. **Keep seller identity visible:** never collapse a multi-seller cart or order into an anonymous single store.
4. **Buy without friction:** guest paths and clear order lookup should stay easy on a small screen.
5. **Honest scope:** global ambition must not be presented as shipped while pricing, tax, addresses, and payouts remain India-only.
