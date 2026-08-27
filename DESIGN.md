---
name: Ballai.dev
description: A focused dark portfolio and storefront led by real game and tool media.
colors:
  accent-gold: "#e7c06a"
  accent-ink: "#181108"
  ground-black: "#080b0f"
  surface-deep: "#10151b"
  surface-raised: "#151c24"
  text-bright: "#f6f8fb"
  text-soft: "#c8d3df"
  text-muted: "#8795a4"
typography:
  body:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Segoe UI, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 850
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent-gold}"
    textColor: "{colors.accent-ink}"
    rounded: "999px"
    padding: "10px 16px"
    height: "42px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-soft}"
    rounded: "999px"
    padding: "10px 16px"
    height: "42px"
  card:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.xl}"
    padding: "22px"
  input:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: Ballai.dev

## Overview

**Creative North Star: "The Focused Workshop"**

Ballai.dev presents games, tools, and engineering work in a quiet dark environment where the work itself carries the visual weight. Real screenshots and product media lead, while navigation, pricing, and status controls remain compact and predictable.

The system is dense enough for repeated browsing but avoids dashboard chrome. Gold appears as a precise signal for active, selected, purchasable, or important states.

**Key Characteristics:**

- Near-black ground with cool layered surfaces.
- Real product media before supporting explanation.
- Restrained gold signals and bright neutral typography.
- Compact controls, semantic states, and responsive stacked layouts.

## Colors

The palette uses one warm accent against cool black surfaces and neutral text.

### Primary

- **Signal Gold:** Marks active navigation, prices, selected media, focus rings, and available purchase actions.

### Neutral

- **Workshop Ground:** The page field and darkest media backgrounds.
- **Deep Surface:** Panels, cards, and input backgrounds.
- **Raised Surface:** Secondary tonal separation inside the dark system.
- **Bright Text:** Primary headings and key values.
- **Soft Text:** Body copy that needs strong readability.
- **Muted Text:** Metadata, disabled states, and supporting labels.

### Named Rules

**The Gold Signal Rule.** Gold marks active navigation, price, focus, and primary action. It never becomes a full-page field color.

## Typography

**Body Font:** Segoe UI with platform sans-serif fallbacks.

**Character:** Direct, practical, and highly legible. Weight and scale establish hierarchy without decorative type effects.

### Hierarchy

- **Display** (heavy, responsive, tight line-height): Reserved for page and product titles.
- **Headline** (heavy, responsive): Names sections and major content groups.
- **Title** (bold, compact): Names cards, products, and panels.
- **Body** (regular, generous line-height): Uses a readable measure near 65 to 72 characters.
- **Label** (heavy, compact, uppercase where appropriate): Used for metadata, product type, and status.

### Named Rules

**The Plain Language Rule.** Typography communicates hierarchy through scale and weight, never gradient text or decorative effects.

## Layout

The primary content container is capped at 1180px with 20px desktop side margins. Major surfaces use an 18px gap. Product detail heroes place media in the wider column and product summary in the narrower column, then stack below 920px. At 560px, margins tighten and dense grids become single columns.

**The Evidence First Rule.** Product media gets the widest column and appears before supporting copy on desktop and mobile.

## Elevation & Depth

Depth comes primarily from tonal layering and restrained one-pixel borders. The sticky navigation uses one wide ambient shadow, while cards remain mostly flat until hover or active state.

### Shadow Vocabulary

- **Navigation Ambient:** A wide soft black shadow used only by the floating navigation shell.
- **Action Lift:** A low-opacity gold shadow paired with a one-pixel upward movement on primary actions.

### Named Rules

**The Flat Surface Rule.** Resting panels rely on tonal separation and a one-pixel border. Shadows are reserved for navigation and interactive lift.

## Shapes

Panels use compact 12px to 16px corners. Media stages and thumbnails use smaller corners to keep screenshots visually precise. Pills are reserved for navigation tabs, tags, labels, and action buttons.

## Components

### Buttons

- **Shape:** Pill form for primary and secondary actions.
- **Primary:** Gold fill with dark text and confident weight.
- **Hover / Focus:** One-pixel lift, restrained ambient shadow, and a clear gold focus outline.
- **Disabled:** Muted tonal surface, reduced opacity, and noninteractive cursor.

### Chips

- **Style:** Compact pills with a translucent surface and one-pixel border.
- **State:** Gold border and text are reserved for labels and selected states.

### Cards / Containers

- **Corner Style:** Compact rounded panels.
- **Background:** Deep cool surface against the darker page ground.
- **Shadow Strategy:** Flat at rest.
- **Border:** One-pixel translucent neutral line.
- **Internal Padding:** Typically 18px to 26px depending on density.

### Inputs / Fields

- **Style:** Dark tonal fill, one-pixel border, compact rounded corners.
- **Focus:** Gold border with a low-opacity focus ring.
- **Disabled:** Muted text and reduced contrast without implying clickability.

### Navigation

The sticky header contains a rounded navigation shell. The active tab uses a gold fill, inactive tabs stay muted, and mobile tabs remain horizontally scrollable rather than compressing their labels.

### Product Media Gallery

The gallery uses one large aspect-ratio-safe media stage with a horizontally scrollable thumbnail rail. The selected thumbnail gains a gold border, while embedded videos load only when selected.

## Do's and Don'ts

### Do:

- **Do** lead product pages with real screenshots and descriptive alt text.
- **Do** keep unavailable commerce channels visibly disabled and semantically noninteractive.
- **Do** reserve gold for active, selected, priced, focused, or purchasable states.
- **Do** stack media before summary content on narrow screens.

### Don't:

- **Don't** invent technical claims, sales evidence, or marketplace availability.
- **Don't** use unrelated artwork to fill a gallery.
- **Don't** introduce decorative gradients, nested cards, or oversized marketing copy.
- **Don't** make disabled marketplace controls look clickable.
