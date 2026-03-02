# Foundations

All values reference `tokens.json`. When implementing, use TailwindCSS v4 `@theme` utilities — see [dev-guide.md](./dev-guide.md) for setup.

---

## Color System

### Primary — Teal

Tailwind's built-in teal scale, adopted without modification. Teal sits at the intersection of blue (trust, intelligence) and green (success, achievement) — it communicates smart growth without the corporate coldness of pure blue or the cliched optimism of pure green.

| Token | Hex | Usage |
|-------|-----|-------|
| `teal-50` | `#F0FDFA` | Tinted backgrounds, hover states on light surfaces |
| `teal-100` | `#CCFBF1` | Active/selected backgrounds (light mode) |
| `teal-200` | `#99F6E4` | Decorative accents |
| `teal-300` | `#5EEAD4` | — |
| `teal-400` | `#2DD4BF` | — |
| `teal-500` | `#14B8A6` | Dark mode primary actions, accent text (dark) |
| `teal-600` | `#0D9488` | **Primary action color** — buttons, links, focus rings |
| `teal-700` | `#0F766E` | Hover state for primary actions |
| `teal-800` | `#115E59` | Active/pressed state for primary actions |
| `teal-900` | `#134E4A` | — |
| `teal-950` | `#042F2E` | — |

**Key rules:**
- `teal-600` is the primary action color for buttons and UI components in light mode (3.7:1 — passes AA for non-text components)
- For small text links in light mode, use `teal-700` (#0F766E, 5.5:1) to meet AA text contrast
- `teal-500` is the primary action color in dark mode
- Never use teal for body text — only for interactive elements and accents
- Focus ring: `focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600`

### Neutral — Warmgray (Custom)

A custom 11-step gray scale with warm undertones (HSL hue 60deg, saturation 1-17%). This replaces **all** usage of Tailwind's `gray-*`, `stone-*`, and `slate-*` scales to create a cohesive, warm aesthetic.

| Token | Hex | HSL (approx) | Usage |
|-------|-----|--------------|-------|
| `warmgray-50` | `#FAFAF8` | 60 17% 98% | Page background (light), alternate card bg |
| `warmgray-100` | `#F5F5F2` | 60 13% 95% | Sidebar background, subtle backgrounds |
| `warmgray-200` | `#E8E8E4` | 60 8% 90% | Default borders, dividers |
| `warmgray-300` | `#D4D4CF` | 60 5% 82% | Input borders, disabled text (light) |
| `warmgray-400` | `#A8A8A2` | 60 3% 65% | Placeholder text, tertiary text |
| `warmgray-500` | `#737370` | 60 1% 45% | Secondary text (dark mode) |
| `warmgray-600` | `#5C5C58` | 60 2% 35% | Secondary text (light mode), icon default |
| `warmgray-700` | `#44443F` | 60 4% 26% | Dark mode borders, disabled text (dark) |
| `warmgray-800` | `#2C2C28` | 60 5% 16% | Dark mode card alt, input background (dark) |
| `warmgray-900` | `#1C1C19` | 60 6% 10% | Dark mode card background, sidebar (dark) |
| `warmgray-950` | `#121210` | 60 6% 7% | Dark mode page background |

### Semantic Colors

Each semantic color provides a light/dark triplet of background, text, and border.

| Status | Light BG | Light Text | Light Border | Dark BG | Dark Text | Dark Border |
|--------|----------|------------|--------------|---------|-----------|-------------|
| **Success** | `#F0FDF4` | `#15803D` | `#BBF7D0` | `green-600/15` | `#4ADE80` | `green-600/30` |
| **Warning** | `#FFFBEB` | `#B45309` | `#FDE68A` | `amber-600/15` | `#FBBF24` | `amber-600/30` |
| **Error** | `#FEF2F2` | `#DC2626` | `#FECACA` | `red-600/15` | `#F87171` | `red-600/30` |
| **Info** | `#EFF6FF` | `#2563EB` | `#BFDBFE` | `blue-600/15` | `#60A5FA` | `blue-600/30` |

All semantic background/text combinations meet WCAG AA contrast requirements (4.5:1 for text, 3:1 for large text).

### Surface Colors

| Role | Light | Dark | Notes |
|------|-------|------|-------|
| Page | `#FFFFFF` | `warmgray-950` | Root `<html>` background |
| Card | `#FFFFFF` | `warmgray-900` | Primary card surface |
| Card Alt | `warmgray-50` | `warmgray-800` | Nested or secondary cards |
| Overlay | `warmgray-950/60` | `warmgray-950/80` | Modal/drawer backdrop |
| Sidebar | `warmgray-100` | `warmgray-900` | App sidebar |
| Input | `#FFFFFF` | `warmgray-800` | Form inputs |

### Text Colors

| Role | Light | Dark |
|------|-------|------|
| Primary | `warmgray-900` | `warmgray-100` |
| Secondary | `warmgray-600` | `warmgray-400` |
| Tertiary | `warmgray-400` | `warmgray-500` |
| Disabled | `warmgray-300` | `warmgray-700` |
| Accent (UI/buttons) | `teal-600` | `teal-500` |
| Accent (text links) | `teal-700` | `teal-500` |

### Border Colors

| Role | Light | Dark |
|------|-------|------|
| Default | `warmgray-200` | `warmgray-700` |
| Subtle | `warmgray-100` | `warmgray-800` |
| Input | `warmgray-300` | `warmgray-700` |
| Focus | `teal-600/30` | `teal-500/30` |
| Divider | `warmgray-200` | `warmgray-800` |

---

## Typography

Font stack: **Inter** (sans-serif, all UI text) + **Instrument Serif** (serif, wordmark only).

Instrument Serif is used **exclusively** for the "dear applicant" wordmark — always lowercase italic: `font-serif italic`.

### Type Scale

| Level | Mobile | Desktop | Weight | Line Height | Letter Spacing | Use |
|-------|--------|---------|--------|-------------|----------------|-----|
| **Display** | 30px (1.875rem) | 48px (3rem) | 700 | 1.1 | -0.025em | Landing hero headline |
| **H1** | 24px (1.5rem) | 36px (2.25rem) | 700 | 1.2 | -0.025em | Page titles |
| **H2** | 20px (1.25rem) | 30px (1.875rem) | 600 | 1.25 | -0.015em | Section headings |
| **H3** | 18px (1.125rem) | 24px (1.5rem) | 600 | 1.3 | -0.01em | Card titles, modal titles |
| **H4** | 16px (1rem) | 18px (1.125rem) | 600 | 1.4 | 0 | Subsections, sidebar groups |
| **Body Large** | 16px (1rem) | 18px (1.125rem) | 400 | 1.6 | 0 | Landing page body copy |
| **Body** | 14px (0.875rem) | 14px (0.875rem) | 400 | 1.5 | 0 | App body text (default) |
| **Body Small** | 13px (0.8125rem) | 13px (0.8125rem) | 400 | 1.5 | 0 | Secondary info, descriptions |
| **Caption** | 12px (0.75rem) | 12px (0.75rem) | 500 | 1.4 | 0.01em | Labels, timestamps, metadata |

**Responsive sizing:** Display through H4 have smaller mobile sizes. Body, Body Small, and Caption are fixed across breakpoints. Use `text-[size] md:text-[size]` for responsive levels.

---

## Spacing

8px base unit. The spacing scale matches Tailwind's default scale.

| Token | Value | Common Uses |
|-------|-------|-------------|
| `0` | 0 | — |
| `0.5` | 2px | Micro adjustments |
| `1` | 4px | Icon-to-text gap, tight padding |
| `1.5` | 6px | Badge padding, small gaps |
| `2` | 8px | **Base unit** — form field gaps, list item padding |
| `3` | 12px | Compact card padding, form label margin |
| `4` | 16px | Standard card padding, input padding-x |
| `5` | 20px | — |
| `6` | 24px | Section gaps within a card |
| `8` | 32px | Card-to-card gaps, section padding (mobile) |
| `10` | 40px | Page section vertical padding (mobile) |
| `12` | 48px | — |
| `16` | 64px | Page section vertical padding (desktop) |
| `20` | 80px | Large section spacing |
| `24` | 96px | Hero padding-top |
| `32` | 128px | Maximum section spacing |

### Spacing Usage Guidelines

| Context | Recommended Spacing |
|---------|-------------------|
| Gap between form fields | `space-y-4` (16px) |
| Gap between form label and input | `mb-1.5` (6px) |
| Card internal padding | `p-6` (24px) mobile, `p-8` (32px) desktop |
| Card-to-card gap | `gap-6` (24px) or `gap-8` (32px) |
| Page section padding | `py-10 md:py-16` (40px / 64px) |
| Kanban column gap | `gap-4` (16px) |
| Button icon-to-text gap | `gap-2` (8px) |
| Navbar height | `h-16` (64px) |
| Sidebar width | `w-64` (256px) |

---

## Grid & Layout

### Breakpoints

| Name | Min-width | Typical device |
|------|-----------|----------------|
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### Container

Standard centered container pattern:

```html
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- content -->
</div>
```

| Variant | Max Width | Use |
|---------|-----------|-----|
| `max-w-sm` | 384px | Auth forms |
| `max-w-2xl` | 672px | Settings, single-column content |
| `max-w-4xl` | 896px | Landing content sections |
| `max-w-7xl` | 1280px | App shell, dashboard |
| (none) | Full | Kanban board (horizontal scroll) |

### Common Layouts

**1. Auth centered** — Single card centered on full-viewport background:
```
┌──────────────────────────────────────────┐
│                                          │
│            ┌──────────────┐              │
│            │  dear        │              │
│            │  applicant   │              │
│            │              │              │
│            │  [form card] │              │
│            │              │              │
│            └──────────────┘              │
│                                          │
└──────────────────────────────────────────┘
```
Max-width: `max-w-sm`. Background: `warmgray-50` / `warmgray-950`.

**2. App shell with sidebar:**
```
┌────────┬─────────────────────────────────┐
│ sidebar│  navbar                         │
│ w-64   ├─────────────────────────────────┤
│        │                                 │
│        │  main content                   │
│        │  (max-w-7xl mx-auto)            │
│        │                                 │
└────────┴─────────────────────────────────┘
```
Sidebar: `w-64`, fixed left, collapsible on mobile (drawer). Navbar: `h-16`, fixed top.

**3. Kanban board:**
```
┌────────┬─────────────────────────────────────────┐
│ sidebar│  navbar                                  │
│        ├───────┬───────┬───────┬───────┬──────────┤
│        │ col   │ col   │ col   │ col   │ ...→     │
│        │ w-72  │ w-72  │ w-72  │ w-72  │          │
│        │       │       │       │       │          │
│        │ card  │ card  │ card  │       │          │
│        │ card  │       │ card  │       │          │
│        │       │       │       │       │          │
└────────┴───────┴───────┴───────┴───────┴──────────┘
```
Columns: `w-72`, horizontal scroll on overflow. Column gap: `gap-4`.

**4. Feature grid (landing):**
```
┌──────────────────────────────────────────┐
│         Section heading                  │
│         Subheading                       │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ feature  │ │ feature  │ │ feature  │ │
│  │ card     │ │ card     │ │ card     │ │
│  └──────────┘ └──────────┘ └──────────┘ │
└──────────────────────────────────────────┘
```
Grid: `grid md:grid-cols-3 gap-8`. Max-width: `max-w-4xl`.

**5. Two-column form:**
```
┌──────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ description  │  │ form fields      │  │
│  │ (sticky top) │  │                  │  │
│  │              │  │                  │  │
│  └──────────────┘  └──────────────────┘  │
└──────────────────────────────────────────┘
```
Grid: `grid lg:grid-cols-[1fr_2fr] gap-12`. Description sticky: `lg:sticky lg:top-8`.

---

## Elevation & Shadows

Cards use **border**, not shadow. Shadow is reserved for elevated, floating elements.

| Level | Token | Value | Use |
|-------|-------|-------|-----|
| Flat | — | No shadow, no border | Inline content, layout sections |
| Bordered | — | `border border-warmgray-200 dark:border-warmgray-700` | Cards, panels, inputs |
| Raised | `shadow-xs` | `0 1px 2px warmgray-950/5` | Subtle lift (optional on cards) |
| Floating | `shadow-sm` | See `tokens.json` | Dropdown menus, popovers |
| Overlay | `shadow-md` | See `tokens.json` | Tooltips, toasts |
| Modal | `shadow-lg` | See `tokens.json` | Modals, drawers |

**Dark mode note:** Shadows are less visible on dark backgrounds. Dark mode elevation relies more on surface color differentiation (`warmgray-800` vs `warmgray-900` vs `warmgray-950`) than shadow.

---

## Motion

All animations must respect `prefers-reduced-motion`. When reduced motion is preferred, replace transitions with instant opacity changes or remove them entirely.

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| **Micro** | 150ms | `default` | Hover colors, focus rings, toggle state |
| **Standard** | 300ms | `default` | Expand/collapse, slide panels, tab switch |
| **Entrance** | 500ms | `out` (decelerate) | Page enter, modal open, toast slide-in |

### Easing Reference

| Name | Value | Use |
|------|-------|-----|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations (accelerate away) |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrance animations (decelerate in) |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces (toasts, popovers) |

### Tailwind Usage

```html
<!-- Micro: color transitions on hover/focus -->
<button class="transition-colors duration-150">...</button>

<!-- Standard: expand/collapse -->
<div class="transition-all duration-300">...</div>

<!-- Entrance: page elements -->
<div class="animate-fade-in">...</div>

<!-- Reduced motion -->
<style>
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
```
