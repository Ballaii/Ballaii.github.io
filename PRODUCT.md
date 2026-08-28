# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Game developers and studios evaluating Ballai games, Unity tools, and pixel-art assets. Store visitors need to understand each product, inspect real media, compare availability across marketplaces, and reach a valid purchase channel without creating an account.

## Product Purpose

Ballai.dev is a portfolio and storefront for Ballai Fokt Jeno's games, software projects, Unity tools, and game assets. Phase 2.5 keeps listing content, commerce state, revisions, and media references in D1, with the public catalog delivered through a Cloudflare Worker.

## Positioning

The store presents tools extracted from shipped game-development work with their engineering context, real marketing media, and clearly stated marketplace availability.

## Operating Context

The public site is a React and Vite application hosted on GitHub Pages. Navigation uses lightweight hash routes. A public Cloudflare Worker reads published commerce state and accepts tightly bounded store analytics. A separate Cloudflare Pages admin is protected by Cloudflare Access and writes draft or published commerce state to D1. Payments, customer accounts, orders, and private downloads remain outside Phase 2.

## Capabilities and Constraints

- Store search and category filtering must continue to work.
- Every asset has a stable ID, slug, internal product route, media, content, numeric pricing, labels, promotion state, and marketplace availability.
- Product identity and editorial content remain separate from mutable price, promotion, label, and platform state where practical.
- Promotion dates use ISO and UTC-compatible timestamps. The frontend determines whether a promotion is active.
- Disabled purchase channels are noninteractive and expose accurate Coming soon or Pending review states.
- The Pixel Art Scythe UI Frame links safely to its live itch.io page.
- The four Unity products remain unavailable on itch.io and pending Unity Asset Store review until real URLs are supplied.
- The Dark Pixel Keyboard Glyph Pack links to its live itch.io page and uses repository-owned media.
- The public store must fail closed when authoritative catalog state is unavailable.
- Public analytics are limited to approved store interaction events and exclude raw IP addresses or customer identity.
- Admin mutations require a valid Cloudflare Access JWT and same-origin checks, then use draft-first publishing with optimistic concurrency and an audit trail.
- Marketing media is private in R2 and is served publicly only through visible published revision references.
- New listings begin as draft-only records and may be archived or restored without deleting their history.
- No payment, customer, order, account, entitlement, or private-download implementation belongs in Phase 2.

## Brand Commitments

Preserve the existing Ballai.dev name, concise voice, dark portfolio identity, gold accent, responsive behavior, and lightweight React architecture. Product pages should feel commercial and credible without copying the Unity Asset Store or inventing technical claims.

## Evidence on Hand

- Existing product descriptions and prices in `src/data.js`, used as the static fallback for known portfolio items.
- Existing games and portfolio content in the React application.
- Local Asset Store Pictures source folders supplied for the four Unity products, migrated into the private R2 media bucket.
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
