# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Game developers and studios evaluating Ballai games, Unity tools, and pixel-art assets. Store visitors need to understand each product, inspect real media, compare availability across marketplaces, and reach a valid purchase channel without creating an account.

## Product Purpose

Ballai.dev is a portfolio and static storefront for Ballai Fokt Jeno's games, software projects, Unity tools, and game assets. Phase 1 adds credible internal product pages while keeping commerce local and static until a separate store API exists.

## Positioning

The store presents tools extracted from shipped game-development work with their engineering context, real marketing media, and clearly stated marketplace availability.

## Operating Context

The site is a React and Vite static application hosted on GitHub Pages. Navigation uses lightweight hash routes. Products may later be sold directly through a separate API and checkout service, but Phase 1 remains a public static frontend with no secrets, accounts, payments, or backend endpoints.

## Capabilities and Constraints

- Store search and category filtering must continue to work.
- Every asset has a stable ID, slug, internal product route, media, content, numeric pricing, labels, promotion state, and marketplace availability.
- Product identity and editorial content remain separate from mutable price, promotion, label, and platform state where practical.
- Promotion dates use ISO and UTC-compatible timestamps. The frontend determines whether a promotion is active.
- Disabled purchase channels are noninteractive and expose accurate Coming soon or Pending review states.
- The Pixel Art Scythe UI Frame links safely to its live itch.io page.
- The four Unity products remain unavailable on itch.io and pending Unity Asset Store review until real URLs are supplied.
- No payment, Cloudflare, authentication, database, customer, admin, or private-download implementation belongs in Phase 1.

## Brand Commitments

Preserve the existing Ballai.dev name, concise voice, dark portfolio identity, gold accent, responsive behavior, and lightweight React architecture. Product pages should feel commercial and credible without copying the Unity Asset Store or inventing technical claims.

## Evidence on Hand

- Existing product descriptions and prices in `src/data.js`.
- Existing games and portfolio content in the React application.
- Local Asset Store Pictures source folders supplied for the four Unity products.
- Product demo video IDs supplied in the Phase 1 brief.
- Pixel Art Scythe UI Frame wording and live itch.io URL supplied in the Phase 1 brief.
- No customer testimonials, sales metrics, marketplace approval, or backend services are established and none may be fabricated.

## Product Principles

- Show real product evidence instead of padded claims.
- Keep commerce state data-driven and replaceable by a future API.
- Make unavailable channels honest and visibly noninteractive.
- Preserve fast static delivery, accessibility, and mobile usability.
- Keep future direct-sale and magic-link access possible without assuming conventional customer accounts.

## Accessibility & Inclusion

Product pages require useful alt text, semantic controls, visible focus states, disabled semantics, meaningful iframe titles, sensible headings, and layouts without horizontal overflow.
