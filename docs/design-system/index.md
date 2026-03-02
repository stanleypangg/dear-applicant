# Dear Applicant Design System

Visual direction: **Quiet Confidence** — Apple Notes meets Linear.

Deep teal primary, warm neutrals, generous whitespace. Premium and calming. The interface recedes so the user's data — their job search — has the highest visual weight.

---

## Design Principles

### 1. Quiet Confidence

Restraint over decoration. One accent color (teal). Whitespace is the primary design tool. Every visual element must earn its place — if removing something doesn't hurt comprehension, remove it.

- Use teal sparingly: primary actions, active states, links. Everything else is warmgray.
- Prefer borders over shadows for cards and containers.
- No gradients in the application UI (subtle gradients are acceptable on the landing page only).
- Icons are functional, not decorative. If an icon accompanies a text label, the icon is `aria-hidden`.

### 2. Data Leads

User content has the highest visual weight. UI chrome — navigation, labels, borders — recedes. The user should see their companies, roles, and progress before they notice the interface.

- Application data (company name, role, salary) uses `text-primary` weight.
- UI labels, metadata, and chrome use `text-secondary` or `text-tertiary`.
- Kanban columns have minimal visual overhead so cards dominate.
- Empty states are helpful, not decorative — they explain what to do, then get out of the way.

### 3. Predictable Motion

Every animation has a purpose: orient the user spatially (sidebar slide), confirm an action (toast entrance), or indicate progress (loading spinner). No animation exists purely for delight.

- Three duration tiers: micro (150ms), standard (300ms), entrance (500ms).
- All motion respects `prefers-reduced-motion` — fallback to instant opacity or no animation.
- Drag-and-drop feedback is immediate (no artificial delay on drop).
- Page transitions use the `fade-in` keyframe — 500ms, ease-out, translateY(6px).

### 4. Inclusive by Default

Accessibility is not a checklist — it's a design constraint applied from the start. Every component is keyboard-navigable, screen-reader-friendly, and meets WCAG AA contrast minimums.

- Visible focus rings on all interactive elements: `focus:ring-2 focus:ring-teal-600/30`.
- Color is never the sole indicator of state — pair with text, icons, or patterns.
- All images and icons have appropriate alt text or `aria-hidden="true"`.
- Form errors are announced to screen readers and linked to their fields with `aria-describedby`.
- Touch targets are at minimum 44x44px on mobile.

### 5. One Way to Do It

Each pattern has exactly one sanctioned implementation. When two developers build the same feature, the result should be visually identical. Minimal component APIs — prefer convention over configuration.

- One button component, not three slightly different ones across pages.
- One input style, exported as a shared class string.
- Color tokens use `warmgray` (not `stone`, `gray`, or `slate`) and `teal` (not `emerald`).
- Serif font is used only for the "dear applicant" wordmark — nowhere else.
- See [components.md](./components.md) for canonical implementations.

---

## Files in This System

| File | Purpose |
|------|---------|
| [foundations.md](./foundations.md) | Colors, typography, spacing, grid, elevation, motion |
| [tokens.json](./tokens.json) | Machine-readable design tokens (W3C format) |
| [components.md](./components.md) | 37 component specifications with Tailwind examples |
| [patterns.md](./patterns.md) | 7 composition patterns with code examples |
| [dev-guide.md](./dev-guide.md) | Implementation guide, accessibility checklist, do's/don'ts |
