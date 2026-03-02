# UI Component Strategy Design

**Date:** 2026-03-02
**Decision:** Use shadcn/ui (Radix primitives + Tailwind) for component implementation.

## Context

The project has 37 component specs in `docs/design-system/components.md` and 8 screen specs in `docs/ui-spec.md`. All screens require WCAG AA accessibility: focus traps, keyboard navigation, ARIA roles (dialog, combobox, tablist, menu, etc.). No UI library is currently installed — only raw Tailwind classes.

## Decision

shadcn/ui, which copies editable component source into `app/components/ui/`. Built on Radix UI primitives for accessibility. Styled with Tailwind, fully customizable.

**Why over alternatives:**
- vs. Radix-only: shadcn provides pre-styled starting points for simple components (Button, Badge, Skeleton). Radix-only means writing all styling from scratch.
- vs. from-scratch: Accessibility engineering (focus traps, combobox patterns, drawer behavior) is a weeks-long effort that Radix solves out of the box.

## Theme Mapping

shadcn CSS variables mapped to warmgray/teal design tokens:

| shadcn variable | Light | Dark |
|----------------|-------|------|
| `--background` | white | warmgray-950 |
| `--foreground` | warmgray-900 | warmgray-100 |
| `--card` | white | warmgray-900 |
| `--card-foreground` | warmgray-900 | warmgray-100 |
| `--muted` | warmgray-100 | warmgray-800 |
| `--muted-foreground` | warmgray-500 | warmgray-400 |
| `--popover` | white | warmgray-900 |
| `--popover-foreground` | warmgray-900 | warmgray-100 |
| `--border` | warmgray-200 | warmgray-700 |
| `--input` | warmgray-300 | warmgray-700 |
| `--primary` | teal-600 | teal-500 |
| `--primary-foreground` | white | white |
| `--secondary` | warmgray-100 | warmgray-800 |
| `--secondary-foreground` | warmgray-900 | warmgray-100 |
| `--destructive` | red-600 | red-600 |
| `--destructive-foreground` | white | white |
| `--accent` | warmgray-100 | warmgray-800 |
| `--accent-foreground` | warmgray-900 | warmgray-100 |
| `--ring` | teal-600/30 | teal-500/30 |

## Component Location

`app/components/ui/` — shadcn components, editable.

## Initial Components

Button, Input, Textarea, Select, Tabs, Dialog, Sheet (Drawer), DropdownMenu, Popover, Tooltip, Badge, Avatar, Skeleton, Label, Separator.

## App-Specific Components (Hand-Built)

KanbanColumn (#34), ApplicationCard (#35), ApplicationDetail (#36), MetricCard (#14), Timeline (#15), ColumnColorPicker (#37) — these use shadcn primitives but are custom implementations.

## Radius

`--radius: 0.5rem` (8px = `rounded-lg`) for app UI components (matching design system specs).

## Dark Mode Strategy

Uses `prefers-color-scheme` media query (system preference). CSS variables are duplicated under both `.dark` class and `@media (prefers-color-scheme: dark)` to support both shadcn's `@custom-variant dark` and the system-preference approach.

## Implementation Status

**Installed and verified (build passes):**
- 15 shadcn components in `app/components/ui/`
- Dependencies: `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tw-animate-css`, plus Radix primitives auto-installed by shadcn
- `app/lib/utils.ts` — `cn()` utility
- `app/app.css` — warmgray/teal CSS variables with both light and dark themes
- `components.json` — shadcn config pointing to `~/` alias paths
- Custom `warmgray-*` color scale registered in `@theme` for direct Tailwind usage (e.g., `text-warmgray-600`)
