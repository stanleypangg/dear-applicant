# Developer Guide

How to implement the Dear Applicant design system in TailwindCSS v4 on Cloudflare Workers.

---

## 1. Using Tokens with TailwindCSS v4

### Registering the Warmgray Scale

The `warmgray` scale is a custom color not included in Tailwind. Register it in `app/app.css` via the `@theme` block so that all `warmgray-*` utilities (e.g., `bg-warmgray-50`, `text-warmgray-900`, `border-warmgray-200`) are available.

```css
@import "tailwindcss" source(".");

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-serif: "Instrument Serif", Georgia, "Times New Roman", serif;

  /* Warmgray neutral scale */
  --color-warmgray-50:  #FAFAF8;
  --color-warmgray-100: #F5F5F2;
  --color-warmgray-200: #E8E8E4;
  --color-warmgray-300: #D4D4CF;
  --color-warmgray-400: #A8A8A2;
  --color-warmgray-500: #737370;
  --color-warmgray-600: #5C5C58;
  --color-warmgray-700: #44443F;
  --color-warmgray-800: #2C2C28;
  --color-warmgray-900: #1C1C19;
  --color-warmgray-950: #121210;

  --animate-fade-in: fade-in 0.5s ease-out both;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

html {
  scroll-behavior: smooth;
}

html,
body {
  @apply bg-white dark:bg-warmgray-950;

  @media (prefers-color-scheme: dark) {
    color-scheme: dark;
  }
}
```

After this change, `warmgray-*` is available everywhere Tailwind color utilities are used: `bg-warmgray-*`, `text-warmgray-*`, `border-warmgray-*`, `ring-warmgray-*`, `divide-warmgray-*`, `placeholder-warmgray-*`.

### Teal — No Registration Needed

Teal is a built-in Tailwind color. All `teal-*` utilities work out of the box: `bg-teal-600`, `text-teal-500`, `ring-teal-600/30`, etc.

### Migration from Existing Colors

The codebase currently mixes `stone-*`, `gray-*`, and `emerald-*`. Replace as follows:

| Before | After | Notes |
|--------|-------|-------|
| `stone-50` | `warmgray-50` | All stone steps map 1:1 to warmgray |
| `stone-100` | `warmgray-100` | |
| `stone-200` | `warmgray-200` | |
| `stone-300` | `warmgray-300` | |
| `stone-400` | `warmgray-400` | |
| `stone-500` | `warmgray-500` | |
| `stone-600` | `warmgray-600` | |
| `stone-700` | `warmgray-700` | |
| `stone-800` | `warmgray-800` | |
| `stone-900` | `warmgray-900` | |
| `stone-950` | `warmgray-950` | |
| `gray-50` through `gray-950` | `warmgray-*` | Landing page uses gray; migrate to warmgray |
| `slate-*` | `warmgray-*` | If any exist |
| `emerald-500` | `teal-500` | Dark mode accent |
| `emerald-600` | `teal-600` | Light mode primary |
| `emerald-700` | `teal-700` | Hover state |
| `emerald-800` | `teal-800` | Active/pressed state |
| `emerald-600/30` | `teal-600/30` | Focus ring opacity |
| `emerald-500/30` | `teal-500/30` | Dark mode focus ring |
| `emerald-500/25` | `teal-500/25` | Shadow tint |

### Files to Migrate

These files currently use `stone-*`, `gray-*`, or `emerald-*` and need updating:

| File | Current Tokens | Migration |
|------|---------------|-----------|
| `app/app.css` | `gray-950` | Replace with `warmgray-950`, add `@theme` warmgray scale |
| `app/components/auth-ui.tsx` | `stone-*`, `emerald-*` in `inputClass`, `socialBtnClass` | Replace all to `warmgray-*`, `teal-*` |
| `app/routes/login.tsx` | `stone-*`, `gray-950`, `emerald-*` inline | Replace all to `warmgray-*`, `teal-*` |
| `app/routes/signup.tsx` | Same pattern as login | Replace all to `warmgray-*`, `teal-*` |
| `app/routes/forgot-password.tsx` | Same pattern | Replace all to `warmgray-*`, `teal-*` |
| `app/routes/reset-password.tsx` | Same pattern | Replace all to `warmgray-*`, `teal-*` |
| `app/routes/layout.auth.tsx` | `stone-*`, `gray-950` | Replace all to `warmgray-*` |
| `app/routes/dashboard.tsx` | `stone-*` | Replace all to `warmgray-*` |
| `app/components/landing/hero.tsx` | `gray-*`, `emerald-*` | Replace all to `warmgray-*`, `teal-*` |
| `app/components/landing/navbar.tsx` | `gray-*`, `emerald-*`; wordmark missing `font-serif italic` | Replace tokens + add `font-serif italic` to wordmark |
| `app/components/landing/features.tsx` | `gray-*`, `emerald-*` | Replace all to `warmgray-*`, `teal-*` |
| `app/components/landing/how-it-works.tsx` | `gray-*`, `emerald-*` | Replace all to `warmgray-*`, `teal-*` |
| `app/components/landing/final-cta.tsx` | `emerald-*`, `gray-*` | Replace all to `teal-*`, `warmgray-*` |
| `app/components/landing/gradient-blob.tsx` | Hardcoded emerald hex (`#10b981`, `#34d399`, `#6ee7b7`) in SVG `<stop>` elements | Manually replace with teal hex (`#14B8A6`, `#2DD4BF`, `#5EEAD4`) |

---

## 2. Component Implementation

### File Organization

```
app/components/
  ui/               # Shared, generic components
    button.tsx
    input.tsx
    textarea.tsx
    select.tsx
    checkbox.tsx
    toggle.tsx
    badge.tsx
    avatar.tsx
    card.tsx
    modal.tsx
    drawer.tsx
    dropdown-menu.tsx
    popover.tsx
    toast.tsx
    alert.tsx
    spinner.tsx
    skeleton.tsx
    progress-bar.tsx
    tabs.tsx
    table.tsx
    tooltip.tsx
    pagination.tsx
    empty-state.tsx
    divider.tsx
    timeline.tsx
    metric-card.tsx
  auth/             # Auth-specific components (keep existing auth-ui.tsx)
    auth-ui.tsx
  landing/          # Landing page components (keep existing)
    hero.tsx
    features.tsx
    final-cta.tsx
    gradient-blob.tsx
    how-it-works.tsx
    navbar.tsx
    scroll-reveal.tsx
    motion-wrapper.tsx
  kanban/           # Kanban-specific components
    column.tsx
    application-card.tsx
    application-detail.tsx
    color-picker.tsx
  layout/           # Layout shells
    page-shell.tsx
    sidebar.tsx
    navbar.tsx
```

### Class String Exports Pattern

For simple components, export class strings (like the existing `inputClass` in `auth-ui.tsx`). For components with variants, export a function that returns class strings.

```tsx
// app/components/ui/input.tsx

export const inputClass =
  "w-full rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 placeholder:text-warmgray-400 dark:placeholder:text-warmgray-500 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors";

export const inputErrorClass =
  "w-full rounded-lg border border-red-500 dark:border-red-500 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-500 transition-colors";
```

```tsx
// app/components/ui/button.tsx

const variants = {
  primary: "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white",
  secondary: "bg-warmgray-100 dark:bg-warmgray-800 text-warmgray-900 dark:text-warmgray-100 hover:bg-warmgray-200 dark:hover:bg-warmgray-700",
  ghost: "text-warmgray-600 dark:text-warmgray-400 hover:bg-warmgray-100 dark:hover:bg-warmgray-800",
  danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export function buttonClass(
  variant: keyof typeof variants = "primary",
  size: keyof typeof sizes = "md"
) {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:opacity-50 cursor-pointer ${variants[variant]} ${sizes[size]}`;
}
```

### Headless UI for Complex Accessibility

For components with complex keyboard interactions (Modal, Dropdown, Tabs, Toggle), use a headless UI library like [Headless UI](https://headlessui.com/) or [Radix Primitives](https://www.radix-ui.com/primitives). These provide ARIA roles, focus trapping, and keyboard navigation out of the box. Apply the design system's visual styles on top.

---

## 3. Accessibility Checklist

### Focus Rings

All interactive elements must have a visible focus indicator:

```
focus:outline-none focus:ring-2 focus:ring-teal-600/30
```

Dark mode variant:
```
dark:focus:ring-teal-500/30
```

For inputs, also shift the border color:
```
focus:border-teal-600 dark:focus:border-teal-500
```

### Contrast Requirements

| Element | Minimum Ratio | Standard |
|---------|--------------|----------|
| Body text | 4.5:1 | WCAG AA |
| Large text (18px+ or 14px bold) | 3:1 | WCAG AA |
| UI components (borders, icons) | 3:1 | WCAG AA |
| Decorative elements | None | — |

Key pairings and their contrast ratios:
- `warmgray-900` on white → 17.1:1 (AA pass)
- `warmgray-600` on white → 6.7:1 (AA pass)
- `warmgray-100` on `warmgray-950` → 17.2:1 (AA pass)
- `warmgray-400` on `warmgray-950` → 7.8:1 (AA pass)
- `teal-700` on white → 5.5:1 (AA pass — use for small text links)
- `teal-600` on white → 3.7:1 (AA pass for UI components/large text, **fails for small text** — use `teal-700` instead)

### Keyboard Navigation

- All interactive elements reachable via Tab
- Custom components support Arrow keys where expected (tabs, menus, radio groups)
- Escape closes overlays (modals, drawers, dropdowns, popovers)
- Enter/Space activates buttons and links
- Skip link as first DOM element

### ARIA Attributes

| Component | Required ARIA |
|-----------|--------------|
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Drawer | Same as Modal |
| Dropdown | `role="menu"` on container, `role="menuitem"` on items, `aria-haspopup`, `aria-expanded` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-labelledby` |
| Toggle | `role="switch"`, `aria-checked` |
| Tooltip | `role="tooltip"`, `aria-describedby` on trigger |
| Alert | `role="alert"` |
| Toast | `role="alert"` or `role="status"` |
| Progress | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Icon button | `aria-label` (required — no visible text) |
| Breadcrumb | `aria-label="Breadcrumb"` on `<nav>`, `aria-current="page"` on current |
| Pagination | `aria-label="Pagination"` on `<nav>`, `aria-current="page"` on active |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Semantic HTML

- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>` for navigation regions
- Use `<main>` for primary content
- Use `<header>` and `<footer>` for page regions
- Use `<h1>`–`<h6>` in order, no skipping levels
- Use `<ul>`/`<ol>` for lists
- Use `<table>` for tabular data (not layout)
- Use `<form>` with `<label>` for all inputs

---

## 4. Do's and Don'ts

### Colors

| Do | Don't |
|----|-------|
| Use `warmgray-*` for all neutrals | Use `stone-*`, `gray-*`, or `slate-*` |
| Use `teal-*` for primary accent | Use `emerald-*` |
| Use `teal-600` for light mode buttons/UI components | Use `teal-500` in light mode (too low contrast) |
| Use `teal-700` for small text links in light mode (5.5:1 contrast) | Use `teal-600` for small text (only 3.7:1 — fails AA for text) |
| Use `teal-500` for dark mode actions | Use `teal-600` in dark mode (too dark) |
| Use semantic colors for status indicators | Use teal for success, warning, or error states |

### Typography

| Do | Don't |
|----|-------|
| Use Inter for all UI text | Use other sans-serif fonts |
| Use Instrument Serif only for "dear applicant" wordmark | Use serif font for headings, body, or labels |
| Always render wordmark as lowercase italic | Capitalize the wordmark |
| Use the type scale (Display–Caption) | Invent ad-hoc font sizes |

### Components

| Do | Don't |
|----|-------|
| Use `border` on cards | Use `shadow` on cards (reserve shadow for overlays) |
| Use `rounded-2xl` on cards and modals | Use `rounded-xl` or `rounded-lg` for cards |
| Use `rounded-lg` on buttons and inputs | Use `rounded-2xl` on buttons |
| Use `rounded-full` only for landing CTAs and avatars | Use `rounded-full` on app UI buttons |
| Use `cursor-pointer` on all clickable elements | Forget cursor styles on buttons |
| Use `transition-colors` on hover/focus elements | Use `transition-all` (animates layout properties) |

### Spacing

| Do | Don't |
|----|-------|
| Use the Tailwind spacing scale | Use arbitrary pixel values |
| Use `gap-*` for flex/grid spacing | Use margin on child elements |
| Use consistent page padding: `px-4 sm:px-6 lg:px-8` | Use different padding patterns per page |

### Dark Mode

| Do | Don't |
|----|-------|
| Use `prefers-color-scheme` (system preference) | Implement a manual toggle (yet) |
| Use warmgray-950 for page bg, warmgray-900 for cards | Use pure `#000000` or Tailwind's `black` |
| Rely on surface color differences for elevation | Rely on shadows for dark mode elevation |

### HTML & Accessibility

| Do | Don't |
|----|-------|
| Use `<Link>` for navigation | Use `useNavigate()` + `<button>` for page nav |
| Use `<button>` for actions | Use `<div onClick>` or `<a href="#">` for actions |
| Include `aria-label` on icon-only buttons | Omit accessibility labels |
| Escape interpolated values in HTML emails | Render raw user input in templates |
| Use `React.FormEvent<HTMLFormElement>` for form handlers | Use `React.SubmitEvent` |
