# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two equally primary audiences:

- **Shoppers:** discover and buy from multiple independent sellers in one marketplace; browse storefronts, use a shared cart, check out, and track orders. No category is fixed for the long term.
- **Sellers:** apply to join, submit business and KYC details, get verified and activated, manage their own store and catalog, and receive payouts.
- **Platform admins:** review seller applications, activate stores, set commission terms, manage content, and oversee orders and payouts.

## Product Purpose

DTlea is a curated multi-vendor marketplace. It gives independent sellers a storefront and shared commerce infrastructure while giving shoppers one place to discover and buy from approved sellers. What success should be measured by is still an open decision.

## Positioning

Access is curated operationally: sellers apply, DTlea verifies their business identity and bank details, and an admin activates the store before it can sell. The marketplace is intended to serve general multi-vendor commerce rather than one category, although the current launch surfaces still use inherited women's fashion copy. Commercial terms are admin-controlled, including a commission rate that can be set per seller rather than a single fixed platform rate.

## Operating Context

- Shoppers browse the marketplace and individual seller storefronts; a cart can contain items from several sellers, and checkout groups the resulting orders by seller.
- Sellers apply through the web app, submit business details, PAN/GST, business address, and bank details, then wait for manual approval and activation.
- Activation triggers Razorpay linked-account onboarding in the background; settlement goes to the seller's registered bank account after commission.
- Orders are split into per-seller fulfillment records and commission records.
- Seller and admin work happens on the web. The mobile app is a shopper-only companion.

## Capabilities and Constraints

- The web app is built with Next.js 16, Payload CMS 3, and MongoDB, using Payload's ecommerce and multi-tenant plugins.
- Seller stores have a name, description, logo/banner, and unique store slug/subdomain. User roles are admin, vendor, and customer.
- Current payments are Razorpay and cash on delivery. Current pricing is INR.
- Current seller verification is India-specific: PAN, GST, IFSC, and Indian business-address fields.
- The confirmed product direction is global from day one. The current India-only currency, tax, address, and payout implementation is therefore an open gap, not a shipped global capability.
- Commission defaults to 15% but is admin-editable per seller.
- Guest checkout and email-based guest order lookup are supported.
- Current launch catalog copy is women's fashion. Broader catalog framing is the intended direction; the fashion copy is inherited for now rather than a permanent category limit.
- Products can be draft/published, use variants, discounts, inventory, reviews, categories, collections, designs, materials, and size guides.

## Brand Commitments

- Product name: **DTlea**.
- Existing customer-facing copy frames DTlea around curated sellers and women's fashion. Treat that as inherited launch copy, not a long-term category promise.
- No formal voice or tone guide has been confirmed.

## Evidence on Hand

- There are no real testimonials, case studies, press mentions, sales figures, or customer logos. Do not fabricate proof.
- Seed content under `src/endpoints/seed/` is demo template content, not DTlea evidence.
- Product claims should be limited to functionality that is actually implemented.

## Product Principles

1. **Trust before supply:** a seller becomes visible only after verification and explicit admin activation.
2. **One marketplace, many identities:** preserve each seller's identity through discovery, cart, checkout, and fulfillment.
3. **Admin-owned commercial terms:** commission and seller activation are platform decisions, not hard-coded constants.
4. **Low-friction buying:** guest checkout and secure order lookup should remain first-class paths.
5. **Honest scope:** global ambition must not be presented as shipped while pricing, tax, addresses, and payouts remain India-only.
