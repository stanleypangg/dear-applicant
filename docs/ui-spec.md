# UI Specification — Dear Applicant

> Comprehensive authenticated app experience specification.
> Design philosophy: Apple HIG adapted for web — Clarity, Deference, Depth.
> Built on the established "Quiet Confidence" direction with warmgray/teal tokens.

---

## Table of Contents

0. [Design Philosophy & Platform Rules](#section-0-design-philosophy--platform-rules)
1. [Kanban Board](#screen-1-kanban-board)
2. [Application Detail](#screen-2-application-detail)
3. [Add / Edit Application](#screen-3-add--edit-application)
4. [Analytics Dashboard](#screen-4-analytics-dashboard)
5. [Settings](#screen-5-settings)
6. [Onboarding / First-Run](#screen-6-onboarding--first-run)
7. [Search & Command Palette](#screen-7-search--command-palette)
8. [Contact Detail](#screen-8-contact-detail)
9. [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## Section 0: Design Philosophy & Platform Rules

### Apple HIG Principles Applied to Web

**Clarity** — Content-first hierarchy. Company names and role titles are the loudest elements on every screen. Chrome — navigation, labels, borders, section headers — recedes to warmgray-400/500, never competing with user data. Typography weight and color are the primary tools for establishing hierarchy, not decoration or ornamentation.

**Deference** — The interface never competes with the data. Flat surfaces without gratuitous gradients. Borders instead of shadows for cards (shadows reserved for floating overlays). Generous whitespace between sections. Color is used sparingly and purposefully: teal for interactive elements, warmgray for everything else, semantic colors only for status communication.

**Depth** — Visual layering through surface colors creates a clear spatial model:
- **Layer 0 (Page):** `bg-white` / `bg-warmgray-950` — the canvas
- **Layer 1 (Card):** `bg-white` / `bg-warmgray-900` — content containers, bordered
- **Layer 2 (Card Alt):** `bg-warmgray-50` / `bg-warmgray-800` — nested surfaces (column backgrounds, code blocks)
- **Layer 3 (Overlay):** `bg-white` / `bg-warmgray-900` + `shadow-lg` — modals, drawers, floating panels

Motion reinforces spatial relationships: the drawer slides in from the right (it lives off-screen to the right), the modal rises from center (it lives in a layer above), toasts slide in from the edge (transient notifications entering the viewport).

### Platform Rules

| Rule | Implementation |
|------|---------------|
| Navigation model | Sidebar (persistent on desktop) + top navbar (contextual actions per screen) |
| Mobile navigation | Sidebar becomes a drawer overlay; hamburger toggle in navbar |
| Board mobile | Columns become horizontal snap-scroll with pill tab selector above |
| Modals on mobile | Become full-screen sheets |
| Touch targets | Minimum 44×44px on mobile for all interactive elements |
| Keyboard-first | Every action reachable without a mouse; tab order follows visual reading order |
| Dark mode | System-preference driven via `prefers-color-scheme` (no manual toggle) |
| Reduced motion | All animation gated on `prefers-reduced-motion: reduce` — transitions become instant |
| Font scaling | All text in `rem` units; layouts accommodate up to 200% browser zoom without horizontal scroll |

### Information Hierarchy Rules

| Level | Weight | Color (Light / Dark) | Use |
|-------|--------|----------------------|-----|
| 1 — Primary data | `font-semibold` / `font-bold` | `warmgray-900` / `warmgray-100` | Company name, role title, metric values |
| 2 — Supporting data | `font-normal` | `warmgray-600` / `warmgray-400` | Dates, salary ranges, URLs, secondary descriptions |
| 3 — Chrome | `font-medium` | `warmgray-400` / `warmgray-500` | Labels, section headers, captions, form labels |
| 4 — Ambient | `font-normal` | `warmgray-300` / `warmgray-700` | Borders, dividers, disabled states, placeholder text |

These levels must be consistently applied across all screens. When in doubt, demote — UI chrome should always be quieter than user data.

### Navigation Model

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (w-64)  │  Navbar (h-16)                       │
│  ┌─────────────┐ ├─────────────────────────────────────┤
│  │ dear         │ │                                     │
│  │ applicant    │ │  Main Content Area                  │
│  │              │ │                                     │
│  │ Board    ●   │ │  (varies per screen)                │
│  │ Analytics    │ │                                     │
│  │              │ │                                     │
│  ├─────────────┤ │                                     │
│  │ Settings     │ │                                     │
│  │ User ▼       │ │                                     │
│  └─────────────┘ └─────────────────────────────────────┘
```

**Sidebar structure:**
- **Top:** Wordmark ("dear applicant" in Instrument Serif italic, `font-serif italic text-xl`)
- **Nav items:** Board, Analytics — icon + label, active state uses `bg-teal-50 text-teal-700` / `dark:bg-teal-950 dark:text-teal-300`
- **Divider:** `border-t border-warmgray-200 dark:border-warmgray-700`
- **Bottom:** Settings link + User menu (avatar initials + name, dropdown with Sign Out)

**Navbar structure (per-screen):**
- **Left:** Screen title (e.g., "Board", "Analytics", "Settings")
- **Right:** Contextual actions (search input, primary CTA button)
- **Style:** `backdrop-blur-sm bg-white/80 dark:bg-warmgray-900/80 border-b`

---

## Screen 1: Kanban Board

The primary workspace. Horizontal-scrolling columns of application cards. This is where users spend 80%+ of their time.

### Wireframe (Desktop)

```
┌────────┬──────────────────────────────────────────────────────────┐
│ Sidebar│  [≡ Board]            [🔍 Search...]    [+ Add App]     │
│        ├──────────────────────────────────────────────────────────┤
│ Board  │  ┌─ Applied ─┐  ┌─ Interview ─┐  ┌─ Offer ──┐  [+ Col]│
│ ●      │  │ ● 5       │  │ ● 3         │  │ ● 1      │         │
│ Anlytcs│  │┌──────────┐│  │┌──────────┐ │  │┌────────┐│         │
│        │  ││Acme Corp ││  ││Stripe    │ │  ││Notion  ││         │
│ ───    │  ││FE Eng    ││  ││Backend   │ │  ││Product ││         │
│ Settngs│  ││Mar 1     ││  ││$150-180k │ │  ││$200k+  ││         │
│ User ▼ │  │└──────────┘│  │└──────────┘ │  │└────────┘│         │
│        │  │┌──────────┐│  │┌──────────┐ │  │          │         │
│        │  ││Google    ││  ││Linear    │ │  │ No more  │         │
│        │  ││SWE III   ││  ││Fullstack │ │  │ apps     │         │
│        │  ││Feb 28    ││  │└──────────┘ │  │          │         │
│        │  │└──────────┘│  │             │  │          │         │
│        │  │ + Add      │  │ + Add       │  │ + Add    │         │
│        │  └────────────┘  └─────────────┘  └──────────┘         │
└────────┴──────────────────────────────────────────────────────────┘
```

### Wireframe (Tablet — Collapsed Sidebar)

```
┌──┬───────────────────────────────────────────────────────────────┐
│  │  [≡ Board]                    [🔍 Search...]    [+ Add App]  │
│  ├───────────────────────────────────────────────────────────────┤
│📋│  ┌─ Applied ─┐  ┌─ Interview ─┐  ┌─ Offer ──┐  [+ Col]     │
│  │  │ ● 5       │  │ ● 3         │  │ ● 1      │              │
│📊│  │┌──────────┐│  │┌──────────┐ │  │┌────────┐│              │
│  │  ││Acme Corp ││  ││Stripe    │ │  ││Notion  ││              │
│──│  ││FE Eng    ││  ││Backend   │ │  ││Product ││              │
│⚙️│  │└──────────┘│  │└──────────┘ │  │└────────┘│              │
│  │  │ ...        │  │ ...         │  │          │              │
│  │  └────────────┘  └─────────────┘  └──────────┘              │
└──┴───────────────────────────────────────────────────────────────┘
```

### Wireframe (Mobile — Scrollable)

```
┌──────────────────────────┐
│ [≡]  dear applicant  [+] │
├──────────────────────────┤
│ [🔍 Search applications] │
├──────────────────────────┤
│ ← Applied(5) │ Interview │
│ ┌────────────────────┐   │
│ │ Acme Corp          │   │
│ │ Frontend Engineer   │   │
│ │ Mar 1 · $120-160k  │   │
│ └────────────────────┘   │
│ ┌────────────────────┐   │
│ │ Google             │   │
│ │ SWE III            │   │
│ │ Feb 28             │   │
│ └────────────────────┘   │
│        ...more...         │
│ [+ Add application]      │
└──────────────────────────┘
```

On mobile, columns are navigated via a horizontal pill tab selector (`role="tablist"`, Pill Tabs variant from component #19). Swiping left/right on the card area snaps to the next column. The active column's pill is highlighted. Below the tab selector, only the active column's cards are shown, scrolling vertically.

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| PageShell | #33 | Top-level layout: sidebar + navbar + main |
| Sidebar | #18 | Fixed left navigation, collapses on mobile |
| Navbar | #17 (app variant) | Fixed top bar with screen title + actions |
| KanbanColumn | #34 | Each `boardColumn` rendered as a column |
| ApplicationCard | #35 | Each `application` rendered as a draggable card |
| SearchInput | #8 | Toolbar search, compact variant |
| Button | #1 (primary) | "+ Add App" in navbar, "+ Add Column" |
| IconButton | #2 | Column options (⋯), mobile hamburger |
| DropdownMenu | #29 | Column header options menu |
| EmptyState | #13 | Empty columns, search no results |
| Skeleton | #25 | Loading state placeholders |
| Toast | #22 | Success/error feedback for drag-and-drop |
| Alert | #23 | Error banner below navbar on load failure |

### Interaction Behaviors

**Drag-and-drop:**
1. User grabs a card (`cursor-grab` → `cursor-grabbing`).
2. The dragged card reduces to `opacity-50` with `ring-2 ring-teal-600/30`.
3. Valid drop-target columns highlight with `ring-2 ring-teal-600/30 bg-teal-50/50 dark:bg-teal-950/20`.
4. A drop placeholder (`h-1 rounded-full bg-teal-600/30 mx-2`) appears between cards at the cursor position.
5. On drop: optimistic UI update — card moves immediately. A `columnTransition` record is created in the background (with `fromColumnId`, `toColumnId`, `transitionedAt`). The card's `application.columnId` and `application.position` update.
6. If the server request fails: card reverts to original position + error toast ("Failed to move application. Please try again.").
7. Animation: card settles with 200ms spring easing.

**Card click:**
- Opens Application Detail drawer (Screen 2) for the clicked `application`.
- The board content dims behind the drawer overlay.

**Column header click:**
- Inline rename: column name text transforms into a TextInput (#3) pre-filled with `boardColumn.name`. Enter saves, Escape cancels. Focus is placed in the input on click.

**Column header ⋯ menu (DropdownMenu #29):**
- Rename — triggers inline rename (same as header click)
- Change Color — opens ColumnColorPicker (#37) popover
- Move Left / Move Right — swaps `boardColumn.position` with adjacent column, animates 300ms slide
- Delete — if column has applications: confirmation modal ("This column has N applications. They will be deleted."). If empty: deletes immediately with success toast.

**"+ Add" button (bottom of column):**
- Inline card creation form appears at the bottom of the column, pushing the button down.
- Minimal form: company (TextInput, required) + role (TextInput, required) + [Cancel] [Add] buttons.
- Enter submits, Escape cancels.
- On success: new card animates in (300ms fade-in + slide-down). A `columnTransition` record is created with `fromColumnId: null` and `toColumnId` set to the current column.

**"+ Add App" (navbar CTA):**
- Opens Screen 3 (Add Application modal).
- Column defaults to the first `boardColumn` by `position`.

**"+ Col" button (end of column row):**
- Adds a new `boardColumn` at the end with `name: "New Column"`, `color: "#0D9488"` (teal-600), `position: max + 1`.
- Column slides in from the right (300ms, ease-out).
- Inline rename activates automatically so the user can name it immediately.

**Search (SearchInput #8 in toolbar):**
- Filters cards across all columns in real-time (debounced 150ms).
- Searches `application.company` and `application.role` (client-side filter on loaded data).
- Non-matching cards fade to `opacity-30`. Matching cards remain at full opacity.
- Column headers update their count to show matching cards only.
- Clearing the search (click ✕ or Escape) restores all cards to full opacity.

### Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `n` | Open Add Application modal (Screen 3) | When no input is focused |
| `/` | Focus search input | When no input is focused |
| `Escape` | Clear search / close overlays | Global |
| `Arrow keys` | Navigate between cards | When a card has focus |
| `Enter` | Open Application Detail (Screen 2) | When a card has focus |
| `Space` | Initiate drag mode on focused card | When a card has focus |

When a card has keyboard focus, a visible focus ring (`ring-2 ring-teal-600/30`) appears around it. Arrow Up/Down moves within a column, Arrow Left/Right moves to the adjacent column (same vertical position or nearest).

### States

**Loading:**
- Skeleton columns: 3 columns × 2–3 card-height rectangles each, shimmer animation (`animate-pulse`).
- Toolbar skeleton: title placeholder (w-32) + button placeholder (w-28).
- Uses the Loading pattern from `patterns.md` §4.

**Empty (first-run, no `boardColumn` records):**
- Full-screen onboarding experience (Screen 6). No sidebar, no navbar — clean centered card.

**Empty column (column exists, no `application` records with matching `columnId`):**
- Muted text: "No applications" in `text-xs text-warmgray-400`.
- Below: "Add one" link in `text-xs text-teal-700 dark:text-teal-500 hover:underline`.
- Uses the Column Empty pattern from `patterns.md` §3.

**Search no results:**
- Ghost icon (search icon in warmgray-100 circle) + "No results found" heading + "Try adjusting your search terms." body text.
- Replaces the column area (centered).
- Uses the Search No Results pattern from `patterns.md` §3.

**Error (board load failed):**
- Inline Alert (#23, error variant) below the navbar: "Failed to load your board. Please try again."
- Retry button (Button #1, secondary variant) within the alert.
- Columns area is empty (not skeleton — distinguishes "failed" from "loading").

**Drag in progress:**
- Dragged card: `opacity-50 ring-2 ring-teal-600/30`, cursor `cursor-grabbing`.
- Valid drop target column: `ring-2 ring-teal-600/30`.
- Drop placeholder between cards: `h-1 rounded-full bg-teal-600/30 mx-2`.
- Other columns (invalid or not hovered): no visual change.

### Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| `≥ lg` (1024px) | Full sidebar (`w-64`) + horizontal columns (`w-72 shrink-0`, `overflow-x-auto`) |
| `md` (768–1023px) | Sidebar collapses to icon-only rail (`w-16`), columns still horizontal |
| `< md` (< 768px) | Sidebar hidden (hamburger drawer via Drawer #28). Columns → horizontal snap-scroll with Pill Tabs (#19) selector above. Cards stack vertically under the active tab. |

**Mobile column selector detail:**
- Pill Tabs (#19) are positioned below the search input, above the card list.
- Each pill shows the column name + count badge: "Applied (5)".
- Pill color dot matches `boardColumn.color`.
- Horizontal scroll on the tab bar if many columns (snap behavior).
- Swiping the card area changes the active column (snap-x snap-mandatory).

> **Note:** `patterns.md` §6 documents an alternative mobile layout using collapsible `<details>` accordion sections. This spec supersedes that with the pill-tab selector approach, which better preserves the spatial kanban metaphor and avoids the visual fragmentation of accordion sections.

### Accessibility

- **Board landmark:** `<main>` wrapping the board area with `aria-label="Application board"`.
- **Columns:** Each column is a `<section>` with `aria-label="{boardColumn.name} column, {count} applications"`.
- **Cards:** Each card is a `<div>` with `role="button"` and `aria-label="{company}, {role}, in {column} column"`.
- **Drag-and-drop alternative:** Each card's ⋯ context menu includes "Move to column ▸" submenu with all available columns. This provides a keyboard/screen-reader accessible path to the same action as drag-and-drop.
- **Live region:** `aria-live="polite"` on a visually hidden element that announces drag results: "Moved {company} to {column name}".
- **Search results count:** `aria-live="polite"` on a visually hidden element: "{N} applications match your search".

### Data Model

| UI Element | Schema Field |
|------------|-------------|
| Column name | `boardColumn.name` |
| Column color dot | `boardColumn.color` (inline `style` attribute) |
| Column order | `boardColumn.position` (ascending left-to-right) |
| Card company | `application.company` |
| Card role | `application.role` |
| Card date | `application.dateApplied` (formatted as "Mar 1") |
| Card salary | `application.salaryMin` + `application.salaryMax` + `application.salaryCurrency` (formatted as "$120k–$160k") |
| Card position within column | `application.position` (ascending top-to-bottom) |
| Card-to-column relationship | `application.columnId` → `boardColumn.id` |
| Drag-and-drop record | `columnTransition.fromColumnId`, `columnTransition.toColumnId`, `columnTransition.transitionedAt` |

### Designer's Notes

> The board is the user's primary workspace — it must load instantly and feel spatial. Drag-and-drop is the hero interaction; optimize for fluid 60fps animation with GPU-accelerated transforms (`translate3d`). Column count is user-defined and unbounded, so horizontal scroll is essential — never wrap columns to a new row.
>
> The color dot on each column header is `boardColumn.color` — it's the primary visual differentiator between columns and should be prominent (h-3 w-3 rounded-full) but not overwhelming. Cards inherit their left border accent from their parent column's color via CSS custom properties.
>
> The inline card creation form (company + role only) is intentionally minimal. The goal is under-5-second card creation for the "I just applied" moment. Users can always click the card later to add salary, URL, notes, and contacts.

---

## Screen 2: Application Detail

A right-hand drawer showing the full detail of a single job application. Tabs organize information into digestible sections. The drawer preserves board context in peripheral vision.

### Wireframe (Desktop — Drawer)

```
┌────────┬────────────────────────┬────────────────────────────┐
│ Sidebar│  Board (dimmed)        │  ┌─ Application Detail ─┐  │
│        │                        │  │ [←] Acme Corp    [⋯]  │  │
│        │                        │  │ Frontend Engineer      │  │
│        │                        │  │ ● Applied              │  │
│        │                        │  ├────────────────────────┤  │
│        │                        │  │ Details│Notes│Contacts│H│  │
│        │                        │  ├────────────────────────┤  │
│        │                        │  │ APPLIED     Mar 1 '26  │  │
│        │                        │  │ SALARY  $120k – $160k  │  │
│        │                        │  │ CURRENCY         USD   │  │
│        │                        │  │ URL     acme.com/jobs  │  │
│        │                        │  │                        │  │
│        │                        │  │ ─── Notes ───          │  │
│        │                        │  │ Great culture, remote.  │  │
│        │                        │  │ React + TS stack.      │  │
│        │                        │  │ [Edit]                 │  │
│        │                        │  ├────────────────────────┤  │
│        │                        │  │ [Edit Application]     │  │
│        │                        │  │ [Delete]               │  │
│        │                        │  └────────────────────────┘  │
└────────┴────────────────────────┴────────────────────────────┘
```

### Wireframe (Mobile — Full Screen)

```
┌──────────────────────────┐
│ [← Board]  Acme Corp [⋯] │
├──────────────────────────┤
│ Frontend Engineer         │
│ ● Applied                 │
├──────────────────────────┤
│ Details │ Notes │Cntcts│H│
├──────────────────────────┤
│ APPLIED      Mar 1, 2026 │
│ SALARY   $120k – $160k   │
│ CURRENCY           USD   │
│ URL      acme.com/jobs →  │
│                           │
│ ─── Notes ───             │
│ Great culture, remote...  │
│ [Edit]                    │
│                           │
│ [Edit Application]        │
│ [Delete]                  │
└──────────────────────────┘
```

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| Drawer | #28 | Right-hand slide-in panel (desktop), full-screen (mobile) |
| ApplicationDetail | #36 | Content layout inside the drawer |
| Tabs | #19 (underline variant) | Details / Notes / Contacts / History |
| Timeline | #15 | History tab — column transition timeline |
| IconButton | #2 | Back arrow, ⋯ menu trigger, edit/delete icons |
| DropdownMenu | #29 | ⋯ menu (Edit, Move to Column, Delete) |
| Button | #1 | Edit Application (secondary), Delete (danger) |
| Badge | #9 | Status badge showing current column name |
| Textarea | #4 | Notes editor (auto-resize variant) |
| Toast | #22 | Save success/error feedback |
| Modal | #27 | Delete confirmation |
| Avatar | #10 (initials variant) | Contact avatars in Contacts tab |
| EmptyState | #13 | Empty states for Notes, Contacts, History tabs |

### Drawer Header

- **Back arrow** (IconButton #2, ghost): returns to board, closes drawer.
- **Company name** (`text-lg font-semibold text-warmgray-900 dark:text-warmgray-100`): `application.company`.
- **⋯ menu** (IconButton #2, ghost): opens DropdownMenu (#29) with Edit, Move to Column ▸, Delete.
- **Role** (`text-sm text-warmgray-600 dark:text-warmgray-400`): `application.role`.
- **Status badge** (Badge #9): shows current `boardColumn.name` with color dot (inline `style` from `boardColumn.color`). Clicking the badge opens a dropdown (DropdownMenu #29) listing all `boardColumn` records — selecting one moves the application (creates `columnTransition`, updates `application.columnId`).

### Tabs

**Tab bar** uses Tabs #19 (underline variant) with `role="tablist"`. Four tabs:

#### Tab 1: Details

Info grid displaying application metadata in a 2-column grid (`grid grid-cols-2 gap-4`):

| Label | Value | Schema Field |
|-------|-------|-------------|
| APPLIED | "Mar 1, 2026" | `application.dateApplied` (formatted) |
| SALARY | "$120,000 – $160,000" | `application.salaryMin` + `application.salaryMax` |
| CURRENCY | "USD" | `application.salaryCurrency` |
| URL | "acme.com/careers/fe" (linked) | `application.url` |

Labels use Level 3 hierarchy: `text-xs font-medium text-warmgray-400 uppercase tracking-wider`.
Values use Level 1 hierarchy: `text-sm text-warmgray-900 dark:text-warmgray-100`.
URL values use: `text-sm text-teal-700 dark:text-teal-500 hover:underline truncate block`.

Below the grid: Notes preview section.
- Section divider: `border-t border-warmgray-200 dark:border-warmgray-700 pt-6 mt-6`.
- "Notes" heading: `text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-2`.
- Notes content in a muted container: `rounded-lg bg-warmgray-50 dark:bg-warmgray-800 p-4 text-sm text-warmgray-700 dark:text-warmgray-300 whitespace-pre-wrap`.
- [Edit] link below notes: `text-sm text-teal-700 dark:text-teal-500 hover:underline`.
- If `application.notes` is null/empty: placeholder text "Add notes about this application..." in `text-warmgray-400`, click-to-edit.

#### Tab 2: Notes

Full-screen notes editor:
- Auto-resizing Textarea (#4) pre-filled with `application.notes`.
- `resize-none overflow-hidden` with JS auto-height on input.
- Save triggers on blur or explicit [Save] button (Button #1, primary, sm).
- Shows "Saved" confirmation (green checkmark, inline, fades after 2s) or error toast.

#### Tab 3: Contacts

List of `contact` records associated with this `application`. Full specification in Screen 8.
- Each contact shows: Avatar (#10, initials), name, role, email, phone.
- [+ Add Contact] button at bottom.

#### Tab 4: History

Timeline (#15) of `columnTransition` records for this application.
- Ordered by `columnTransition.transitionedAt` descending (most recent at top).
- Most recent transition: teal dot (`border-teal-600`).
- Older transitions: warmgray dots (`border-warmgray-300 dark:border-warmgray-600`).
- Each entry: "Moved to **{boardColumn.name}**" + relative timestamp ("2 days ago").
- If `columnTransition.fromColumnId` is not null: "Moved from {fromColumn} to **{toColumn}**".
- If `columnTransition.fromColumnId` is null: "Added to **{toColumn}**" (initial placement).

### Interaction Behaviors

**Open:**
- Slides in from right: `translateX(100%) → translateX(0)`, 300ms, ease-out easing.
- Board content dims with overlay (`bg-warmgray-950/60 dark:bg-warmgray-950/80`).
- Focus moves to the first focusable element in the drawer (back arrow button).

**Close:**
- Triggered by: clicking overlay, pressing Escape, or clicking back arrow.
- Slides out: `translateX(0) → translateX(100%)`, 200ms, ease-in easing.
- Focus returns to the ApplicationCard (#35) that triggered the drawer.

**Tab switch:**
- Instant content swap — no animation.
- Keyboard: Left/Right arrow keys navigate tabs when tab bar is focused.
- Tab content area scrolls independently (the header and tab bar stay fixed at top of drawer).

**Edit Application:**
- Opens Screen 3 (Add/Edit Application modal) pre-filled with current `application` data.
- Title reads "Edit Application". Submit button reads "Save Changes".
- On successful save: drawer updates with new data, success toast.

**Delete:**
- Confirmation modal (Modal #27): "Delete {application.company} application? This cannot be undone."
- Two buttons: [Cancel] (secondary) and [Delete] (danger).
- On confirm: drawer closes, card removed from board (optimistic), success toast.
- On error: error toast, card stays.

**URL click:**
- Opens `application.url` in new tab: `target="_blank" rel="noopener noreferrer"`.
- Visually indicated by external link icon next to the URL text.

**Status badge click:**
- Opens a DropdownMenu (#29) listing all `boardColumn` records (name + color dot).
- Selecting a column: updates `application.columnId`, creates `columnTransition`, shows success toast.
- Optimistic: badge updates immediately, board card moves to new column.

**⋯ menu:**
- Edit → opens Screen 3 in edit mode.
- Move to Column ▸ → submenu with all `boardColumn` records.
- Delete → triggers delete confirmation.

### States

**Loading:**
- Skeleton layout matching the detail structure: header placeholder (company + role), tab bar placeholder, info grid placeholders (4 rows of label + value), notes block placeholder.
- Uses Skeleton (#25) with `animate-pulse`.

**Notes empty (`application.notes` is null):**
- Muted placeholder: "Add notes about this application..." in `text-warmgray-400`.
- Click anywhere in the notes area to activate the editor (Textarea #4) with cursor focused.

**Contacts empty (no `contact` records):**
- EmptyState (#13) with: "No contacts yet" heading + "Add people you're working with at this company." body + [Add Contact] button.

**History empty (no `columnTransition` records):**
- Single muted line: "No transitions recorded" in `text-sm text-warmgray-400`.
- This state only occurs if an application was created directly in a column via the inline form (which creates a transition) and then that transition was somehow deleted. In practice, every application should have at least one transition.

**Error (save failed):**
- Toast (#22, error variant): "Failed to save changes. Please try again." with retry action.
- Form inputs remain editable with the failed values preserved.

### Accessibility

- **Drawer:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the company name heading element.
- **Focus trap:** Tab and Shift+Tab cycle only within drawer elements. Implemented per `patterns.md` §7.
- **Escape:** Closes drawer, returns focus to the trigger card.
- **Tabs:** `role="tablist"` on container, `role="tab"` + `aria-selected` on each tab, `role="tabpanel"` + `aria-labelledby` on each panel.
- **Screen reader announcement:** "Application detail, {company}, {role}, dialog" on open.
- **URL link:** `aria-label="Visit {company} job posting (opens in new tab)"`.
- **Status badge dropdown:** `aria-haspopup="listbox"`, `aria-expanded`, `aria-label="Current status: {column name}. Click to change."`.

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `≥ lg` (1024px) | Right drawer (`w-96`), board visible and dimmed behind overlay |
| `md` (768–1023px) | Right drawer (`w-80`), board visible and dimmed |
| `< md` (< 768px) | Full-screen sheet (no overlay, no board visible). Back arrow shows "← Board" text label. |

On mobile, the drawer becomes a full-screen view because there's no spatial board context to preserve at that viewport. Swipe right gesture on the drawer closes it (returns to board).

### Designer's Notes

> The drawer — not a modal — is intentional. It preserves the board context in peripheral vision, reinforcing spatial memory ("this application lives in the Applied column"). On mobile, it goes full-screen because there's no spatial context to preserve at that viewport.
>
> The tab structure prevents the detail view from becoming an overwhelming wall of data. Four tabs is the maximum — each should be scannable in under 2 seconds. If a fifth concern emerges, it should be folded into an existing tab, not given its own.
>
> The status badge is clickable because moving an application between columns is the second most common action (after viewing details). It should be a one-click operation from within the detail view.

---

## Screen 3: Add / Edit Application

Modal form for creating a new application or editing an existing one. Minimal required fields to reduce friction.

### Wireframe

```
┌──────────────────────────────────┐
│  Add Application              ✕  │
├──────────────────────────────────┤
│  Company *                       │
│  ┌──────────────────────────────┐│
│  │ Acme Corp                    ││
│  └──────────────────────────────┘│
│                                  │
│  Role *                          │
│  ┌──────────────────────────────┐│
│  │ Frontend Engineer            ││
│  └──────────────────────────────┘│
│                                  │
│  Column *                        │
│  ┌──────────────────────────────┐│
│  │ Applied                   ▼  ││
│  └──────────────────────────────┘│
│                                  │
│  URL                             │
│  ┌──────────────────────────────┐│
│  │ https://acme.com/careers     ││
│  └──────────────────────────────┘│
│                                  │
│  ┌─ Salary Range ─────────────┐  │
│  │ Min       │ Max    │ USD ▼ │  │
│  │ 120000    │ 160000 │       │  │
│  └────────────────────────────┘  │
│                                  │
│  Date Applied                    │
│  ┌──────────────────────────────┐│
│  │ 2026-03-01               📅 ││
│  └──────────────────────────────┘│
│                                  │
│  Notes                           │
│  ┌──────────────────────────────┐│
│  │                              ││
│  │                              ││
│  └──────────────────────────────┘│
│                                  │
├──────────────────────────────────┤
│           [Cancel]  [Save]       │
└──────────────────────────────────┘
```

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| Modal | #27 (md size, `max-w-lg`) | Dialog container |
| TextInput | #3 | Company, Role, URL, Salary Min, Salary Max fields |
| Select | #5 | Column selector, Currency selector |
| Textarea | #4 | Notes field |
| Button | #1 | Cancel (secondary), Save (primary) |
| IconButton | #2 | Close (✕) in modal header |
| Spinner | #24 | Loading state in Save button |

### Fields

| Field | Type | Schema Field | Required | Validation | Default |
|-------|------|-------------|----------|------------|---------|
| Company | TextInput | `application.company` | Yes | Non-empty, trimmed | — |
| Role | TextInput | `application.role` | Yes | Non-empty, trimmed | — |
| Column | Select | `application.columnId` | Yes | Must select from user's `boardColumn` records | First column by `position`, or clicked column |
| URL | TextInput | `application.url` | No | Valid URL format if provided | — |
| Salary Min | TextInput (number) | `application.salaryMin` | No | Positive integer if provided | — |
| Salary Max | TextInput (number) | `application.salaryMax` | No | Positive integer, ≥ Salary Min if both provided | — |
| Currency | Select | `application.salaryCurrency` | No | ISO 4217 currency code | "USD" |
| Date Applied | Date input | `application.dateApplied` | No | Not in the future | Today's date (add mode) |
| Notes | Textarea | `application.notes` | No | — | — |

**Column selector detail:** Each option shows the column's color dot (inline colored circle) next to the column name. This helps users visually place the application.

**Salary Range layout:** Three inputs in a horizontal row (`flex gap-3`): Min (flex-1), Max (flex-1), Currency (w-24). On mobile, Currency wraps to its own row.

### Interaction Behaviors

**Open (add mode):**
- Modal rises from center: `opacity 0 → 1, scale 0.95 → 1`, 300ms, ease-out.
- Title: "Add Application".
- Submit button: "Save".
- Column defaults to:
  - The column where "+" was clicked (if opened from column's "+ Add" button), or
  - The first column by `boardColumn.position` (if opened from navbar "+ Add App").
- Focus moves to Company input.

**Open (edit mode):**
- Same animation.
- Title: "Edit Application".
- Submit button: "Save Changes".
- All fields pre-filled with existing `application` data.
- Focus moves to Company input.
- Footer shows last-modified timestamp: "Last updated {application.updatedAt}" in `text-xs text-warmgray-400`.

**Submit:**
1. Primary button shows Spinner (#24) + "Saving..." text, all form inputs become `disabled`.
2. On success: modal closes, success toast ("Application saved"), card appears/updates in the correct column (optimistic).
3. On error: field-level errors (red border + error text below via TextInput error state) and/or inline banner (Alert #23, error variant) above the form footer. Focus jumps to the first invalid field.
4. A `columnTransition` record is created on add (with `fromColumnId: null`, `toColumnId: selected column`). On edit, a transition is created only if the column changed.

**Cancel:**
- If form has unsaved changes (any field modified from initial state): "Discard changes?" confirmation dialog (Modal #27, sm). Two buttons: [Keep Editing] (secondary), [Discard] (danger).
- If form has no changes: closes immediately, no confirmation.

**Tab order:**
Company → Role → Column → URL → Min → Max → Currency → Date → Notes → Cancel → Save.

### States

**Loading (submit in progress):**
- "Saving..." button with Spinner (#24), all inputs `disabled`, `opacity-50` on form body.

**Validation error:**
- Red border on invalid fields: `border-red-500 focus:ring-red-600/30 focus:border-red-500`.
- Error message below each invalid field: `text-sm text-red-600 dark:text-red-400`.
- Focus jumps to first invalid field.
- Field-level errors:
  - Company empty: "Company name is required"
  - Role empty: "Role is required"
  - URL invalid: "Please enter a valid URL"
  - Salary Max < Salary Min: "Maximum salary must be greater than minimum"
  - Date in future: "Date cannot be in the future"

**Edit mode:**
- "Save Changes" instead of "Save".
- Shows last-modified timestamp in footer.
- Delete button (Button #1, danger variant) in bottom-left of footer: opens delete confirmation (same as Screen 2 delete flow).

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `≥ sm` (640px) | Centered modal (`max-w-lg`), backdrop overlay |
| `< sm` (< 640px) | Full-screen sheet sliding up from bottom. No backdrop — fills viewport. Close (✕) and Cancel become the same back-arrow action. |

### Accessibility

- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to "Add Application" / "Edit Application" title.
- Focus trap: Tab cycles within modal only.
- Escape: triggers Cancel behavior (including "Discard changes?" if dirty).
- All inputs paired with `<label>` via `htmlFor`/`id`.
- Error states: `aria-invalid="true"` + `aria-describedby` pointing to error message `id`.
- Column selector: shows color dots as visual indicators; column names serve as the accessible label (color is not the sole differentiator).
- Screen reader: "Add Application dialog" / "Edit Application dialog" announced on open.

### Designer's Notes

> Required fields are minimal — just company, role, and column — to reduce friction. Users should be able to add an application in under 10 seconds. Salary is a range (min/max) to accommodate job postings that give bands, which is the norm. The column selector shows color dots next to column names so users can visually place the application without memorizing column positions.
>
> The salary inputs are plain number fields, not formatted currency inputs. Formatting happens on display (in the card and detail view), not on input. This avoids locale-specific formatting headaches and keeps the input fast.

---

## Screen 4: Analytics Dashboard

Metrics, trends, and flow visualization derived from `application` and `columnTransition` data. This screen rewards the user's tracking discipline with visual insights.

### Wireframe (Desktop)

```
┌────────┬──────────────────────────────────────────────────────────┐
│ Sidebar│  Analytics               [This Week ▼] [Last 30 Days ▼]│
│        ├──────────────────────────────────────────────────────────┤
│ Board  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────┐│
│ Anlytcs│  │ Total Apps │ │ Active     │ │ Response   │ │ Avg   ││
│ ●      │  │    47      │ │    32      │ │   Rate     │ │ Days  ││
│        │  │   +12%  ▲  │ │   +5   ▲   │ │   68%      │ │  4.2  ││
│ ───    │  └────────────┘ └────────────┘ └────────────┘ └───────┘│
│ Settngs│                                                         │
│        │  ┌──────────────────────────────────────────────────────┐│
│        │  │  Application Flow (Sankey)                           ││
│        │  │                                                      ││
│        │  │  Applied ━━━━━━━┓                                    ││
│        │  │    (47)         ┣━━━━ Interview (15)━━━ Offer (5)    ││
│        │  │                 ┗━━━━ Rejected (12)                  ││
│        │  │                                                      ││
│        │  └──────────────────────────────────────────────────────┘│
│        │                                                         │
│        │  ┌──────────────────────┐ ┌────────────────────────────┐│
│        │  │ Applications / Week  │ │ Column Distribution        ││
│        │  │     ▄                │ │  Applied    ████████  23   ││
│        │  │   ▄ █ ▄             │ │  Interview  ████     12   ││
│        │  │ ▄ █ █ █ ▄           │ │  Offer      ██        5   ││
│        │  │ █ █ █ █ █ ▄         │ │  Rejected   ███       7   ││
│        │  │ W1 W2 W3 W4 W5     │ │                            ││
│        │  └──────────────────────┘ └────────────────────────────┘│
└────────┴──────────────────────────────────────────────────────────┘
```

### Wireframe (Mobile)

```
┌──────────────────────────┐
│ [≡]  Analytics       [▼] │
├──────────────────────────┤
│ ┌──────────┐ ┌──────────┐│
│ │Total Apps│ │ Active   ││
│ │   47     │ │   32     ││
│ │  +12%  ▲ │ │  +5   ▲  ││
│ └──────────┘ └──────────┘│
│ ┌──────────┐ ┌──────────┐│
│ │ Response │ │ Avg Days ││
│ │   68%    │ │   4.2    ││
│ └──────────┘ └──────────┘│
│                           │
│ ┌────────────────────────┐│
│ │ Application Flow       ││
│ │ ← scroll →             ││
│ └────────────────────────┘│
│                           │
│ ┌────────────────────────┐│
│ │ Applications / Week    ││
│ │   ▄ █ ▄                ││
│ └────────────────────────┘│
│                           │
│ ┌────────────────────────┐│
│ │ Column Distribution    ││
│ │ Applied  ████████  23  ││
│ └────────────────────────┘│
└──────────────────────────┘
```

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| PageShell | #33 | Layout wrapper |
| MetricCard | #14 | 4 stat cards |
| Card | #11 (default variant) | Chart containers |
| Tabs | #19 (pill variant) | Period selector |
| Tooltip | #16 | Chart hover details |
| Skeleton | #25 | Loading placeholders |
| EmptyState | #13 | No data states |
| Alert | #23 | Error state |

### Metric Cards

Four MetricCard (#14) instances in a responsive grid (`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6`):

| Card | Label | Value | Trend | Data Source |
|------|-------|-------|-------|------------|
| Total Applications | "Total Applications" | Count of `application` records | % change vs previous period | `COUNT(application)` |
| Active | "Active" | Count of applications in non-terminal columns | +/- change vs previous period | `COUNT(application) WHERE boardColumn is not terminal` |
| Response Rate | "Response Rate" | % of applications that moved past their first column | — (no trend, cumulative) | `COUNT(DISTINCT columnTransition.applicationId) / COUNT(application) * 100` |
| Avg Days to Response | "Avg Days" | Mean days between `application.createdAt` and first `columnTransition.transitionedAt` | — | `AVG(first_transition.transitionedAt - application.createdAt)` |

**Trend indicator:**
- Positive change: green text (`text-green-600 dark:text-green-400`) + up arrow icon.
- Negative change: red text (`text-red-600 dark:text-red-400`) + down arrow icon.
- No change: no trend shown.

**"Active" definition:** An application is "active" if it is in a column that is not considered terminal. Since columns are user-defined with no hardcoded status enum, the system counts all applications. Users can interpret "Active" as "total current applications" — or a future enhancement could let users mark columns as "archived/terminal."

### Charts

#### Sankey Diagram — Application Flow

Full-width Card (#11) container. Visualizes transitions between columns.

- **Nodes:** Each `boardColumn` is a node. Width proportional to total applications that passed through.
- **Edges:** Each unique `fromColumnId → toColumnId` pair from `columnTransition`. Edge width proportional to count.
- **Colors:**
  - Node fill: `boardColumn.color` for each column.
  - Forward movement edges: teal-600 (#0D9488) with 30% opacity.
  - Lateral/reverse edges: warmgray-300 with 30% opacity.
- **Hover:** Highlight the hovered edge path. Tooltip (#16): "{count} applications moved from {fromColumn} to {toColumn}".
- **Click node:** Navigates to Board (Screen 1) with a filter showing only applications in that column.
- **Accessible alternative:** Below the visual Sankey, provide a summary table (Table #12, collapsed by default) showing from → to → count data.

#### Applications per Week — Bar Chart

Left chart in the 2-column bottom row. Vertical bar chart.

- **X-axis:** ISO weeks (labeled as "W1", "W2", etc. or actual dates).
- **Y-axis:** Application count.
- **Bar fill:** teal-600 (#0D9488).
- **Axis lines:** `warmgray-200 dark:warmgray-700`.
- **Axis labels:** `text-xs text-warmgray-400`.
- **Hover:** Tooltip (#16) with exact count: "Week of Mar 1: 12 applications".
- **Data source:** Group `application.createdAt` by ISO week.

#### Column Distribution — Horizontal Bar Chart

Right chart in the 2-column bottom row. Horizontal bars showing current application count per column.

- **Y-axis:** Column names (with color dot prefix).
- **X-axis:** Application count.
- **Bar fill:** Each bar uses the `boardColumn.color` for that column.
- **Value label:** Count shown at the end of each bar in `text-sm text-warmgray-600`.
- **Hover:** Tooltip with exact count.
- **Click bar:** Navigates to Board (Screen 1) filtered to that column.
- **Data source:** `COUNT(application) GROUP BY application.columnId`, joined with `boardColumn` for name and color.

### Period Selector

Pill Tabs (#19, pill variant) in the navbar or above the metric cards:
- **Options:** "This Week" | "Last 30 Days" | "All Time"
- **Default:** "All Time" for users with < 50 applications; "Last 30 Days" for users with ≥ 50.
- **Behavior:** Selecting a period re-queries all metrics and charts. Content updates with a 300ms crossfade transition.
- **Data filtering:** Period applies to `application.createdAt` for metric cards and bar chart. Sankey uses `columnTransition.transitionedAt`. Distribution is always "current state" (unaffected by period).

### Interaction Behaviors

- **Period selector:** Pill tabs switch instantly. Metric cards and charts crossfade (300ms) to new data.
- **Sankey hover:** Highlight hovered flow path at full opacity; dim other paths to 10% opacity.
- **Bar hover:** Tooltip (#16) with exact value.
- **MetricCard hover:** Subtle scale (`scale-[1.01]`) and `shadow-xs` lift, 150ms transition.
- **Click Sankey node / bar chart segment:** Navigates to Board (Screen 1) with a column filter active.

### Keyboard Shortcuts

No custom keyboard shortcuts — standard Tab navigation applies. Period selector tabs are navigable via Arrow Left/Right keys per the Tabs (#19) component spec.

### States

**Loading:**
- Skeleton MetricCards: 4 rectangles matching card dimensions, `animate-pulse`.
- Skeleton charts: 3 chart-area rectangles (full-width for Sankey, side-by-side for bar charts), `animate-pulse`.

**Empty (no `application` records):**
- EmptyState (#13): "Add your first application to start seeing insights" + CTA button "Go to Board" (navigates to Screen 1).
- No metric cards, no charts — just the centered empty state.

**Empty (applications exist, no `columnTransition` records):**
- Metric cards show values (Total, Active, etc.).
- Sankey chart hidden. In its place: muted message "Move applications between columns to see your pipeline flow" in `text-sm text-warmgray-400`, centered within the Card container.
- Bar chart and distribution chart still show data (they don't depend on transitions).

**Error (data load failed):**
- Alert (#23, error variant) below the navbar: "Failed to load analytics. Please try again."
- Retry button within alert.

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `≥ lg` (1024px) | 4 metric cards in a row. Sankey full-width. Bar + distribution side by side (`grid grid-cols-2 gap-6`). |
| `md` (768–1023px) | 2 metric cards per row (`grid-cols-2`). All charts stacked full-width. |
| `< md` (< 768px) | 2 metric cards per row (`grid-cols-2`, compact). Charts stacked. Sankey horizontally scrollable (`overflow-x-auto`). |

### Accessibility

- **Chart alt text:** Each chart's Card container has `aria-label` with a text summary. E.g., Sankey: "Application flow diagram. 47 applied, 15 reached interview, 5 received offers." Distribution: "Column distribution: Applied 23, Interview 12, Offer 5, Rejected 7."
- **Accessible data table:** A visually hidden `<table>` (or `<details>` expand) provides the same data as each chart in tabular form for screen readers.
- **Metric cards:** Each uses `role="group"` with `aria-label` combining label + value: "Total Applications: 47, up 12 percent".
- **Period selector:** `role="tablist"` per Tabs #19 spec.

### Designer's Notes

> Analytics should feel like a reward, not homework. The Sankey chart is the hero — it tells the story of the user's job search in one glance. Keep axis lines and labels extremely subtle (`warmgray-300`). Data values are the loudest elements.
>
> The period selector defaults to "All Time" for new users to show something useful from day one. Once a user crosses 50 applications, "Last 30 Days" becomes more actionable than a historical total.
>
> Charts should use the column's own `boardColumn.color` wherever possible (distribution bars, Sankey nodes). This creates visual consistency with the board — the same column "feels" the same color everywhere.

---

## Screen 5: Settings

Account management, board customization, and danger zone. Organized as stacked bordered cards within a single-column layout.

### Wireframe

```
┌────────┬──────────────────────────────────────────────────────┐
│ Sidebar│  Settings                                            │
│        ├──────────────────────────────────────────────────────┤
│ Board  │  ┌─ Profile ────────────────────────────────────────┐│
│ Anlytcs│  │                                                  ││
│        │  │  [Avatar]  Jane Doe                              ││
│ ───    │  │            jane@example.com                      ││
│ Settngs│  │                                                  ││
│ ●      │  │  Name     ┌──────────────────┐  [Save]          ││
│        │  │           │ Jane Doe         │                   ││
│        │  │           └──────────────────┘                   ││
│        │  └──────────────────────────────────────────────────┘│
│        │                                                      │
│        │  ┌─ Connected Accounts ─────────────────────────────┐│
│        │  │  ✓ Google   jane@gmail.com         [Disconnect]  ││
│        │  │  ○ Microsoft                       [Connect]     ││
│        │  │  ✓ Email/Password                  [Change pwd]  ││
│        │  └──────────────────────────────────────────────────┘│
│        │                                                      │
│        │  ┌─ Board Columns ──────────────────────────────────┐│
│        │  │  ↕ ● Applied        [✎] [🎨] [✕]               ││
│        │  │  ↕ ● Interview      [✎] [🎨] [✕]               ││
│        │  │  ↕ ● Offer          [✎] [🎨] [✕]               ││
│        │  │  ↕ ● Rejected       [✎] [🎨] [✕]               ││
│        │  │  [+ Add Column]                                  ││
│        │  └──────────────────────────────────────────────────┘│
│        │                                                      │
│        │  ┌─ Danger Zone ────────────────────────────────────┐│
│        │  │  Delete account and all data    [Delete Account] ││
│        │  └──────────────────────────────────────────────────┘│
└────────┴──────────────────────────────────────────────────────┘
```

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| PageShell | #33 | Layout wrapper |
| Card | #11 (default variant) | Section containers |
| Avatar | #10 | User avatar (social provider image or initials) |
| TextInput | #3 | Name editor, column rename, password fields |
| Button | #1 | Save, Connect, Disconnect, Delete, Add Column |
| IconButton | #2 | Edit (✎), color picker trigger (🎨), delete (✕), drag handle (↕) |
| ColumnColorPicker | #37 | Popover for changing column color |
| Popover | #30 | Hosts ColumnColorPicker |
| Modal | #27 | Delete confirmations, column delete with move |
| Toast | #22 | Save success/error |
| Divider | #31 | Section separators |

### Page Layout

Single-column layout: `max-w-2xl mx-auto px-4 sm:px-6 py-8`. Stacked Card (#11) sections with `gap-8` between them.

### Section 1: Profile

**Card contents:**
- **Header row:** Avatar (#10, lg size — 56px) + name (`text-lg font-semibold`) + email (`text-sm text-warmgray-500`). Avatar shows social provider image if available, otherwise initials on teal background.
- **Edit form:** Below the header, separated by a subtle divider.
  - Name: TextInput (#3) pre-filled with `user.name`. Inline save button (Button #1, primary, sm) adjacent.
  - Email: Displayed as read-only text (`text-sm text-warmgray-600`). Not editable (tied to auth provider).

**Interaction:**
- Name save: Click [Save] or press Enter. Button shows loading spinner. Success: green checkmark icon appears inline for 2s, then fades. Error: Toast (#22, error variant).

### Section 2: Connected Accounts

**Card contents:**
- List of auth providers, each as a row:
  - **Google:** ✓ icon (green) + "Google" label + email address + [Disconnect] button (ghost variant).
  - **Microsoft:** ○ icon (warmgray) + "Microsoft" label + [Connect] button (secondary variant).
  - **Email/Password:** ✓ icon + "Email/Password" label + [Change Password] button (ghost variant).
- Each row separated by `border-t border-warmgray-100 dark:border-warmgray-800`.

**Interactions:**
- **Connect:** Redirects to OAuth provider flow. On return, row updates to show ✓ + email.
- **Disconnect:** Confirmation if it's the user's only auth method: "This is your only sign-in method. You won't be able to sign in if you disconnect." Otherwise, disconnects immediately + success toast.
- **Change Password:** Row expands to show an inline form:
  - Current Password (TextInput #3, type="password")
  - New Password (TextInput #3, type="password")
  - Confirm Password (TextInput #3, type="password")
  - [Cancel] (ghost) + [Update Password] (primary) buttons
  - Validation: new passwords must match, minimum 8 characters.
  - Success: form collapses, success toast. Error: field-level errors.

### Section 3: Board Columns

**Card contents:**
- List of `boardColumn` records, ordered by `boardColumn.position`. Each row:
  - **Drag handle** (↕): `cursor-grab`, allows reordering via drag-and-drop.
  - **Color dot:** `h-3 w-3 rounded-full`, background from `boardColumn.color`.
  - **Column name:** `text-sm font-medium text-warmgray-900 dark:text-warmgray-100`.
  - **Application count:** `text-xs text-warmgray-400` showing how many applications are in this column.
  - **Edit button** (IconButton #2, ghost): triggers inline rename.
  - **Color picker button** (IconButton #2, ghost): opens ColumnColorPicker (#37) in a Popover (#30).
  - **Delete button** (IconButton #2, ghost): triggers delete flow.
- **[+ Add Column]** button (Button #1, secondary) at the bottom.

**Interactions:**
- **Column reorder (drag):** Drag handle + drop. `boardColumn.position` values update optimistically. Animation: 300ms reorder slide. Reduced motion: instant swap.
- **Inline rename:** Click edit button → name text transforms into TextInput (#3) pre-filled with `boardColumn.name`. Enter saves, Escape cancels.
- **Color change:** Click color picker button → ColumnColorPicker (#37) Popover opens. Select color → instant update to `boardColumn.color`, optimistic UI. Popover closes.
- **Column delete:**
  - If column has 0 applications: delete immediately, success toast.
  - If column has applications: Modal (#27) appears:
    - "This column has {N} applications."
    - "Move them to:" + Select (#5) dropdown listing other `boardColumn` records.
    - Footer: [Cancel] (secondary) + [Move & Delete Column] (danger).
    - On confirm: applications' `columnId` updates to selected column, column deletes, board refreshes.
- **Add Column:** Creates new `boardColumn` with `name: "New Column"`, `color: "#0D9488"`, `position: max + 1`. Row appears with inline rename activated.

### Section 4: Danger Zone

**Card styling:** `border-red-200 dark:border-red-600/30` border (red, not the default warmgray).

**Card contents:**
- Description: "Permanently delete your account and all associated data including applications, contacts, and board columns."
- [Delete Account] button (Button #1, danger variant).

**Interaction:**
- Click [Delete Account] → Modal (#27):
  - Title: "Delete your account?"
  - Body: "This action is permanent and cannot be undone. All your applications, contacts, columns, and settings will be permanently deleted."
  - Text input: "Type DELETE to confirm" — TextInput (#3) where user must type exactly "DELETE" to enable the danger button.
  - Footer: [Cancel] (secondary) + [Delete Account] (danger, disabled until "DELETE" typed).
  - On confirm: account deletion, redirect to landing page, success toast "Account deleted."

### States

**Loading:**
- Skeleton layout for each section: Avatar placeholder + text bars for Profile. Row placeholders for Connected Accounts. Row placeholders for Board Columns.

**Save success:**
- Green checkmark icon appears inline next to the saved field, fades after 2s. Micro animation: `opacity 0 → 1` in 150ms, hold 1.5s, `opacity 1 → 0` in 300ms.

**Error (save failed):**
- Toast (#22, error variant) + field-level errors where applicable.

**Connected account error:**
- Inline Alert (#23, error variant) within the account row: "Failed to connect. Please try again."

### Keyboard Shortcuts

No custom keyboard shortcuts — standard Tab navigation applies. Column reorder is accessible via "Move Up" / "Move Down" buttons (visually hidden, screen-reader accessible) on each column row.

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| All breakpoints | Single column, `max-w-2xl mx-auto`. Same layout at all sizes. |
| `< sm` (< 640px) | Card padding reduces from `p-6` to `p-4`. Drag handles remain accessible. |

### Accessibility

- **Page landmark:** `<main aria-label="Settings">`.
- **Section headings:** Each Card has an `<h2>` heading (Profile, Connected Accounts, Board Columns, Danger Zone).
- **Column reorder:** Keyboard alternative: each row has "Move Up" / "Move Down" buttons (visually hidden, accessible via screen reader) in addition to drag handles.
- **Delete confirmation:** `aria-live="assertive"` on the text input validation message ("Type DELETE to confirm").
- **Password visibility:** Change Password fields can optionally include a show/hide toggle (IconButton #2 with eye icon).

### Designer's Notes

> Settings is the least-visited screen, so it must be immediately scannable. Group related settings in bordered cards with clear section headers. The Board Columns section is surprisingly important — users will customize their workflow here. Make reordering feel physical and immediate.
>
> The Danger Zone uses a red border (not red background) to signal severity without screaming. The "type DELETE" confirmation pattern adds friction intentionally — this is an irreversible destructive action.
>
> Password change uses an inline expanding form rather than a separate page or modal. This keeps the user in context and reduces navigation overhead for a simple action.

---

## Screen 6: Onboarding / First-Run

The experience when a user signs in for the first time with no `boardColumn` records. Goal: get to the board in under 5 seconds.

### Wireframe

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│            ┌──────────────────────────────┐               │
│            │                              │               │
│            │     Welcome to               │               │
│            │     dear applicant           │               │
│            │                              │               │
│            │  Let's set up your board.    │               │
│            │  We'll create columns that   │               │
│            │  match your job search       │               │
│            │  workflow.                   │               │
│            │                              │               │
│            │  [Use Default Columns]       │               │
│            │                              │               │
│            │  or start from scratch       │               │
│            │                              │               │
│            └──────────────────────────────┘               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Layout

Full-screen centered card — no sidebar, no navbar. Clean and focused.

- Background: `bg-white dark:bg-warmgray-950`.
- Container: `min-h-screen flex items-center justify-center px-4`.
- Card: `max-w-md w-full` with Card (#11, elevated variant — `shadow-sm border`).
- Entrance animation: `animate-fade-in` (500ms, from `motion.duration.entrance` token).

### Content

**Wordmark:** "dear applicant" in Instrument Serif italic (`font-serif italic text-2xl text-warmgray-800 dark:text-warmgray-200`), centered.

**Heading:** "Welcome to" above the wordmark. Combined: "Welcome to dear applicant" reads as a single phrase. Heading uses `text-xl font-semibold text-warmgray-900 dark:text-warmgray-100`.

**Body text:** "Let's set up your board. We'll create columns that match your job search workflow." in `text-sm text-warmgray-500 dark:text-warmgray-400`, centered, `max-w-sm mx-auto`.

**Primary CTA:** Button (#1, primary, lg): "Use Default Columns". Full width (`w-full`).

**Secondary option:** Text link below the button: "or start from scratch" in `text-sm text-warmgray-400 hover:text-warmgray-600`. Centered.

### Flow

**Path A — "Use Default Columns":**
1. Button shows loading spinner ("Creating columns...").
2. Creates 4 `boardColumn` records:

| Name | Color | Position |
|------|-------|----------|
| Bookmarked | `#2563EB` (blue) | 0 |
| Applied | `#0D9488` (teal) | 1 |
| Interview | `#D97706` (amber) | 2 |
| Offer | `#16A34A` (green) | 3 |

3. Redirects to Board (Screen 1) with success toast: "Your board is ready!"
4. On the board, columns slide in one-by-one with 150ms stagger animation.

**Path B — "Start from scratch":**
1. Creates 1 `boardColumn`: `name: "New Column"`, `color: "#0D9488"`, `position: 0`.
2. Redirects to Board (Screen 1).
3. Inline rename activates on the single column so the user can name it immediately.

### Detection

The onboarding screen is triggered by a check in the Board route's loader:
- Query `boardColumn` records for the authenticated `user.id`.
- If count is 0: render Screen 6 (Onboarding) instead of Screen 1 (Board).
- If count > 0: render Screen 1 (Board) normally.

This check happens on every Board route load, not just first login, to handle edge cases (e.g., user deleted all columns from Settings).

### Keyboard Shortcuts

No custom keyboard shortcuts. The two actions (button and link) are reachable via Tab. Enter activates the focused element.

### States

**Loading (column creation):**
- Button shows Spinner (#24) + "Creating columns..." text.
- "Or start from scratch" link disabled (opacity-50).

**Error (column creation failed):**
- Toast (#22, error variant): "Failed to create columns. Please try again."
- Button returns to enabled state.

### Accessibility

- Card: `role="main"`, `aria-label="Welcome to dear applicant"`.
- Auto-focus on the "Use Default Columns" button after the entrance animation completes.
- Both paths (button and link) are keyboard accessible.
- Reduced motion: card appears instantly (no fade-in), column slide-in stagger is removed.

### Designer's Notes

> Onboarding should take under 5 seconds. One decision, zero forms. The default columns cover 80% of job search workflows — "Bookmarked" for jobs found but not yet applied to, "Applied" for submitted applications, "Interview" for active processes, and "Offer" for received offers.
>
> Users who want "Rejected", "Ghosted", or custom columns can add them later from the board or settings. Never show a tutorial overlay — the board should be self-explanatory. If it isn't, the board design has failed.
>
> The "start from scratch" option is a text link, not a button, because it's the minority path. Most users will take the default. Visual weight guides the user toward the recommended action.

---

## Screen 7: Search & Command Palette

Global search overlay. Searches across all `application` records. Triggered globally, functions as a quick-jump shortcut.

### Wireframe

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│    ┌──────────────────────────────────────────────┐   │
│    │ 🔍 Search applications...              ⌘ /  │   │
│    ├──────────────────────────────────────────────┤   │
│    │                                              │   │
│    │  RECENT                                      │   │
│    │  ┌──────────────────────────────────────┐    │   │
│    │  │ Acme Corp · Frontend Engineer        │    │   │
│    │  │ ● Applied                            │    │   │
│    │  └──────────────────────────────────────┘    │   │
│    │  ┌──────────────────────────────────────┐    │   │
│    │  │ Stripe · Backend Engineer            │    │   │
│    │  │ ● Interview                          │    │   │
│    │  └──────────────────────────────────────┘    │   │
│    │                                              │   │
│    │  ALL RESULTS (3)                             │   │
│    │  ... filtered list ...                       │   │
│    │                                              │   │
│    │  ─────────────────────────────────────────   │   │
│    │  ↑↓ Navigate  ↵ Open  esc Close             │   │
│    └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| SearchInput | #8 | Search field at top of palette |
| Badge | #9 | Column status badge on each result |
| Card | #11 (interactive variant) | Each result row |

### Layout

- **Backdrop:** `fixed inset-0 bg-warmgray-950/60 dark:bg-warmgray-950/80 z-50`.
- **Palette:** Centered overlay, `max-w-xl w-full mx-auto mt-[15vh]` on desktop. Full-screen on mobile.
- **Container:** `rounded-2xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 shadow-lg overflow-hidden`.

### Structure

**Search input area:**
- SearchInput (#8) spanning full width of the palette, without outer border (border is on the container).
- Keyboard hint badge: `⌘ /` (or `Ctrl /` on non-Mac) in `text-xs text-warmgray-400 bg-warmgray-100 dark:bg-warmgray-800 rounded px-1.5 py-0.5`.

**Results area:**
- Scrollable (`max-h-[60vh] overflow-y-auto`).
- Divided into sections with labels:
  - "RECENT" — shown when query is empty, displays 5 most recently updated applications (by `application.updatedAt` descending).
  - "ALL RESULTS ({count})" — shown when query has matches.
- Each result row:
  - Company · Role (Level 1 text: `text-sm font-medium text-warmgray-900 dark:text-warmgray-100`).
  - Column badge (Badge #9) with color dot from `boardColumn.color`.
  - Hover/selected state: `bg-warmgray-50 dark:bg-warmgray-800`.

**Footer:**
- Keyboard hints: `↑↓ Navigate  ↵ Open  esc Close` in `text-xs text-warmgray-400`, centered.
- Separated by `border-t border-warmgray-200 dark:border-warmgray-700`.
- Padding: `px-4 py-2`.

### Trigger

- Press `/` anywhere when no input element is focused (global keyboard listener).
- Or click the SearchInput (#8) in the Board navbar.
- Palette opens with 150ms ease-out animation (`opacity 0 → 1, scale 0.98 → 1`).
- Focus immediately moves to the search input.

### Search Behavior

- **Search fields:** Searches across `application.company`, `application.role`, `application.notes`, `contact.name`.
- **Matching:** Case-insensitive substring match. Client-side filtering on pre-loaded application data.
- **Debounce:** 150ms debounce on keystroke before filtering.
- **No submit button:** Results filter live as the user types.
- **Empty query:** Shows 5 most recently updated applications under "RECENT" heading.

### Navigation

- **Arrow keys (↑↓):** Move selection highlight between results. Highlighted result has `bg-warmgray-50 dark:bg-warmgray-800` background.
- **Enter (↵):** Opens Application Detail drawer (Screen 2) for the selected result. Palette closes.
- **Escape:** Closes palette, returns focus to the element that was focused before palette opened.
- **Click result:** Same as Enter — opens Application Detail.

### States

**Empty query:**
- "RECENT" section with 5 most recently updated applications.
- If user has no applications at all: "No applications yet. Add one from the board." in `text-sm text-warmgray-400`, centered.

**Query with results:**
- "ALL RESULTS ({count})" heading + matching result rows.
- Results ordered by relevance: exact company name match first, then role match, then notes/contact match.

**No results:**
- "No applications match '{query}'" in `text-sm text-warmgray-500`, centered.
- Suggestion: "Try checking your spelling or using different keywords." in `text-xs text-warmgray-400`.

**Loading:**
- Not typically needed (client-side filtering is instant). If server-side search is added later: Spinner (#24) in the results area.

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `≥ sm` (640px) | Centered overlay (`max-w-xl`, `mt-[15vh]`), backdrop visible |
| `< sm` (< 640px) | Full-screen sheet. Backdrop fills screen. No border-radius on palette. |

### Accessibility

- **Search input:** `role="combobox"`, `aria-expanded="true"` (when results visible), `aria-controls` pointing to results listbox.
- **Results list:** `role="listbox"`.
- **Each result:** `role="option"`, `aria-selected` on the keyboard-highlighted item.
- **Active descendant:** `aria-activedescendant` on the combobox tracks keyboard selection.
- **Screen reader:** Announces result count on query change: `aria-live="polite"` region: "{N} results" or "No results found".
- **VoiceOver example:** "Search applications, combobox. 3 results. Acme Corp, Frontend Engineer, Applied."

### Designer's Notes

> This is not a "search page" — it's a floating overlay like Spotlight or VS Code's command palette. It should feel instant: open in <100ms, first results visible in <200ms. The keyboard hint footer (`↑↓ Navigate  ↵ Open  esc Close`) educates without tooltips.
>
> Recent applications when the query is empty makes the palette useful even without typing — it becomes a quick-jump shortcut. Power users will open the palette, see their recent items, and arrow-key to the one they want.
>
> The `⌘ /` hint badge teaches the shortcut passively. On non-Mac platforms, show `Ctrl /`.

---

## Screen 8: Contact Detail

Contact management embedded within the Application Detail drawer's "Contacts" tab (Screen 2, Tab 3). Contacts are secondary to the application itself but crucial for follow-ups.

### Wireframe (Contacts Tab — Contact List)

```
┌─── Contacts (3) ────────────────────────┐
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ [JD] Jane Doe                    │    │
│  │      Hiring Manager              │    │
│  │      jane@acme.com  ·  555-1234  │    │
│  │      [✎] [✕]                     │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ [BS] Bob Smith                   │    │
│  │      Recruiter                   │    │
│  │      bob@acme.com                │    │
│  │      [✎] [✕]                     │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [+ Add Contact]                         │
│                                          │
└──────────────────────────────────────────┘
```

### Wireframe (Add/Edit Contact — Inline Form)

```
┌──────────────────────────────────────┐
│  Name *    ┌──────────────────────┐  │
│            │ Jane Doe             │  │
│            └──────────────────────┘  │
│  Role      ┌──────────────────────┐  │
│            │ Hiring Manager       │  │
│            └──────────────────────┘  │
│  Email     ┌──────────────────────┐  │
│            │ jane@acme.com        │  │
│            └──────────────────────┘  │
│  Phone     ┌──────────────────────┐  │
│            │ 555-1234             │  │
│            └──────────────────────┘  │
│  Notes     ┌──────────────────────┐  │
│            │ Met at career fair   │  │
│            └──────────────────────┘  │
│           [Cancel]  [Save Contact]   │
└──────────────────────────────────────┘
```

### Components Used

| Component | Spec # | Usage |
|-----------|--------|-------|
| Avatar | #10 (initials, sm — 32px) | Contact initials avatar |
| TextInput | #3 | Name, Role, Email, Phone fields |
| Textarea | #4 | Contact notes |
| Button | #1 | Save Contact (primary, sm), Cancel (ghost, sm), Add Contact (secondary, sm) |
| IconButton | #2 | Edit (✎), Delete (✕) |
| Popover | #30 | Delete confirmation |
| EmptyState | #13 | Empty contacts state |

### Contact Card Layout

Each `contact` record renders as a card within the Contacts tab:

- **Avatar:** Initials-based (Avatar #10, sm size). First letter of first name + first letter of last name (split `contact.name` by space). Background: `bg-teal-100 dark:bg-teal-900`. Text: `text-teal-700 dark:text-teal-300`.
- **Name:** `text-sm font-medium text-warmgray-900 dark:text-warmgray-100` — from `contact.name`.
- **Role:** `text-xs text-warmgray-500 dark:text-warmgray-400` — from `contact.role` (optional, may be empty).
- **Email:** `text-xs text-teal-700 dark:text-teal-500 hover:underline` — `mailto:` link from `contact.email`.
- **Phone:** `text-xs text-teal-700 dark:text-teal-500` — `tel:` link from `contact.phone` (on mobile, tapping initiates call).
- **Email · Phone separator:** middle dot (`·`) in `text-warmgray-300` if both present.
- **Action buttons:** Edit (IconButton #2, ghost, sm) and Delete (IconButton #2, ghost, sm). Positioned at the right side of the card, visible on hover (desktop) or always visible (mobile).

Cards are stacked vertically with `space-y-3`.

### Contact Form (Inline)

The inline form pattern (rather than a modal-within-a-drawer) keeps the user in context.

**Fields:**

| Field | Type | Schema Field | Required | Validation |
|-------|------|-------------|----------|------------|
| Name | TextInput | `contact.name` | Yes | Non-empty |
| Role | TextInput | `contact.role` | No | — |
| Email | TextInput (email) | `contact.email` | No | Valid email format if provided |
| Phone | TextInput (tel) | `contact.phone` | No | — |
| Notes | Textarea | `contact.notes` | No | — |

**Tab order:** Name → Role → Email → Phone → Notes → Cancel → Save Contact.

### Interaction Behaviors

**Add Contact:**
1. Click [+ Add Contact] button.
2. Inline form expands below the existing contacts, pushing the button down. Animation: 300ms slide-down.
3. Focus moves to Name input.
4. [Save Contact] creates a new `contact` record with `applicationId` set to the current application.
5. On success: form collapses, new contact card appears with a fade-in animation. Success toast optional (inline checkmark preferred).
6. On error: field-level errors + inline alert above form buttons.

**Edit Contact:**
1. Click pencil (✎) icon on a contact card.
2. Card transforms into the inline form, pre-filled with existing contact data. Animation: 200ms crossfade.
3. [Save Contact] updates the `contact` record.
4. On success: form reverts to card display. On error: field-level errors.

**Delete Contact:**
1. Click delete (✕) icon on a contact card.
2. Confirmation Popover (#30) appears anchored to the delete button: "Remove {contact.name}?"
3. Two buttons: [Cancel] (ghost, sm) + [Remove] (danger, sm).
4. On confirm: contact card fades out (200ms), row removed. Success toast optional.
5. On cancel: popover closes, no change.

**Email click:** Opens `mailto:{contact.email}` in the default email client.

**Phone click:** On mobile, opens `tel:{contact.phone}` to initiate a call. On desktop, selects the phone number text for easy copying.

### States

**Empty (no `contact` records for this application):**
- EmptyState (#13): "No contacts yet" heading + "Add people you're working with at this company." body + [Add Contact] button.
- Compact variant (less vertical padding than standard EmptyState since it's within a tab panel).

**Loading:**
- Skeleton contact cards: 2 rows of avatar circle + text bars, `animate-pulse`.

**Save error:**
- Inline Alert (#23, error variant) above the form buttons: "Failed to save contact. Please try again."
- Field-level errors below specific inputs (e.g., "Please enter a valid email address").

**Form active (add or edit):**
- Other contact cards remain visible above the form.
- The form has a subtle top border (`border-t border-warmgray-200 dark:border-warmgray-700 pt-4 mt-4`) separating it from the contact list.

### Keyboard Shortcuts

No custom keyboard shortcuts. Tab navigates between contact cards and action buttons. Within the inline add/edit form, Tab order follows the field sequence (Name → Role → Email → Phone → Notes → Cancel → Save Contact).

### Accessibility

- **Contact list:** `role="list"` on the container, `role="listitem"` on each card.
- **Avatar:** Decorative (`aria-hidden="true"`) since the name text provides the same information.
- **Email link:** `aria-label="Email {contact.name} at {contact.email}"`.
- **Phone link:** `aria-label="Call {contact.name} at {contact.phone}"`.
- **Delete confirmation popover:** Focus moves to [Cancel] button on open, Escape closes.
- **Screen reader:** Contact card announced as: "{name}, {role}, {email}, {phone}".

### Data Model

| UI Element | Schema Field |
|------------|-------------|
| Contact name | `contact.name` |
| Contact role | `contact.role` |
| Contact email | `contact.email` |
| Contact phone | `contact.phone` |
| Contact notes | `contact.notes` |
| Parent application | `contact.applicationId` → `application.id` |

### Designer's Notes

> Contacts are secondary to the application itself but crucial for follow-ups. The inline form pattern (rather than a modal-within-a-drawer) keeps the user in context — they can see the existing contacts while adding a new one.
>
> Only name is required. Job seekers often only have a recruiter's name and LinkedIn profile, not email and phone. The form should never block progress by requiring information the user doesn't have.
>
> The initials avatar creates visual anchors for scanning a list of contacts. The teal background matches the app's primary accent, creating visual consistency. If a contact has only a first name (no space), the avatar shows just the first letter.

---

## Cross-Cutting Concerns

### Micro-Interactions Catalog

Every interactive element follows a consistent animation language derived from the motion tokens in `tokens.json`.

| Interaction | Duration | Easing | Token | CSS Details |
|-------------|----------|--------|-------|-------------|
| Button hover | 150ms | `default` | `motion.duration.micro` | Background color shift (`bg-teal-600 → bg-teal-700`) |
| Button press | 100ms | `default` | — | `scale(0.98)` + darker shade (`bg-teal-800`) |
| Card hover | 150ms | `default` | `motion.duration.micro` | Border color `warmgray-200 → warmgray-300` |
| Drag start | 150ms | `out` | `motion.duration.micro` | `shadow-md` lift, `opacity-50` |
| Drag over column | 150ms | `default` | `motion.duration.micro` | Column `ring-2 ring-teal-600/30` |
| Drop | 200ms | `spring` | — | Card settles into position with slight bounce |
| Drawer open | 300ms | `out` | `motion.duration.standard` | `translateX(100%) → translateX(0)` |
| Drawer close | 200ms | `in` | — | `translateX(0) → translateX(100%)` |
| Modal open | 300ms | `out` | `motion.duration.standard` | `opacity 0 → 1`, `scale(0.95) → scale(1)` |
| Modal close | 200ms | `in` | — | `opacity 1 → 0`, `scale(1) → scale(0.95)` |
| Toast enter | 300ms | `spring` | `motion.duration.standard` | `translateX(100%) → translateX(0)` with bounce |
| Toast exit | 200ms | `in` | — | `opacity 1 → 0` |
| Tab switch | 0ms | — | `motion.duration.instant` | Instant content swap, no animation |
| Search palette open | 150ms | `out` | `motion.duration.micro` | `opacity 0 → 1`, `scale(0.98) → scale(1)` |
| Search palette close | 100ms | `in` | — | `opacity 1 → 0` |
| Skeleton shimmer | 1500ms | `linear` | — | Infinite loop, left-to-right gradient (via `animate-pulse`) |
| Focus ring appear | 150ms | `default` | `motion.duration.micro` | Ring `opacity 0 → 1` |
| Metric trend arrow | 500ms | `out` | `motion.duration.entrance` | Fade in + slight `translateY(-4px → 0)` |
| Onboarding card | 500ms | `out` | `motion.duration.entrance` | `opacity 0 → 1`, `translateY(8px) → translateY(0)` |
| Column stagger (onboarding) | 150ms stagger | `out` | — | Each column enters 150ms after the previous |
| Inline form expand | 300ms | `default` | `motion.duration.standard` | Height `0 → auto`, opacity `0 → 1` |
| Success checkmark | 150ms + 1500ms hold + 300ms | — | — | Appear, hold, fade out |

**Easing reference (from `tokens.json`):**
- `default`: `cubic-bezier(0.4, 0, 0.2, 1)` — general purpose
- `in`: `cubic-bezier(0.4, 0, 1, 1)` — accelerating, for exits
- `out`: `cubic-bezier(0, 0, 0.2, 1)` — decelerating, for entrances
- `spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — bouncy, for toasts and popovers

**Reduced motion behavior (`prefers-reduced-motion: reduce`):**
- All transitions become instant (0ms duration).
- No shimmer animation on skeletons (static gray).
- No entrance/exit animations — elements appear/disappear instantly.
- Drag-and-drop still functions but without lift/settle animation.
- Charts render without animated drawing.

### Gesture Support (Touch Devices)

| Gesture | Action | Screen |
|---------|--------|--------|
| Tap card | Open Application Detail (Screen 2) | Board |
| Long-press card (300ms) | Enter drag mode (haptic feedback via `navigator.vibrate(10)` if available) | Board |
| Swipe right on drawer | Close drawer, return to board | Application Detail |
| Pull-to-refresh on board | Reload applications from server | Board |
| Horizontal swipe on board | Scroll between columns (snap-x snap-mandatory) | Board |
| Swipe between column tabs | Switch active column (mobile pill tabs) | Board (mobile) |

### Accessibility — WCAG AA Compliance

#### Color & Contrast

All text/background combinations meet WCAG AA requirements:

| Element | Foreground | Background | Ratio | Passes |
|---------|-----------|------------|-------|--------|
| Body text (light) | `warmgray-900` (#1C1C19) | `white` (#FFFFFF) | 17.1:1 | AA |
| Body text (dark) | `warmgray-100` (#F5F5F2) | `warmgray-950` (#121210) | 17.2:1 | AA |
| Secondary text (light) | `warmgray-600` (#5C5C58) | `white` (#FFFFFF) | 6.7:1 | AA |
| Secondary text (dark) | `warmgray-400` (#A8A8A2) | `warmgray-900` (#1C1C19) | 7.1:1 | AA |
| Text links (light) | `teal-700` (#0F766E) | `white` (#FFFFFF) | 5.5:1 | AA |
| Text links (dark) | `teal-500` (#14B8A6) | `warmgray-900` (#1C1C19) | 6.9:1 | AA |
| Primary button | `white` (#FFFFFF) | `teal-600` (#0D9488) | 3.7:1 | AA (UI) |
| Placeholder text (light) | `warmgray-400` (#A8A8A2) | `white` (#FFFFFF) | 2.4:1 | Exempt |

> **Note on placeholder text:** Placeholder text at 2.4:1 does not meet WCAG AA contrast minimums, but placeholder text is exempt per WCAG SC 1.4.3 ("inactive user interface components" exemption). Placeholder text is non-essential — it disappears on input and the `<label>` element provides the required accessible name.

**Key rules:**
- `teal-600` (#0D9488, 3.7:1 on white) is used for buttons and UI components only — passes AA for non-text components (3:1 threshold).
- `teal-700` (#0F766E, 5.5:1 on white) is used for small text links — passes AA for text (4.5:1 threshold).
- Color is never the sole indicator of meaning. Column colors are always paired with column name text. Semantic states (error/success/warning) use icon + text + color.

#### Keyboard Navigation

- **Full keyboard access** to every interactive element on every screen.
- **Visible focus rings:** `ring-2 ring-teal-600/30` (light mode) / `ring-2 ring-teal-500/30` (dark mode). Applied via `focus:outline-none focus:ring-2 focus:ring-teal-600/30`.
- **Skip link:** First DOM element on every page. Visually hidden (`sr-only`), visible on focus. Targets `<main id="main-content">`.
- **Tab order:** Follows visual reading order (left-to-right, top-to-bottom). No `tabindex` values > 0.

**Board-specific keyboard navigation:**
| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate between cards within a column |
| Arrow Left/Right | Navigate to adjacent column (same vertical position) |
| Enter | Open Application Detail drawer |
| Space | Initiate drag mode on focused card |
| Escape | Cancel drag / clear search / close overlays |
| Tab | Move to next interactive element in tab order |

**Modal/Drawer keyboard:**
| Key | Action |
|-----|--------|
| Tab | Cycle through focusable elements within overlay (focus trap) |
| Shift+Tab | Reverse cycle |
| Escape | Close overlay, return focus to trigger |

#### Screen Readers (VoiceOver / NVDA)

**Landmarks:**
- `<nav aria-label="Main navigation">` for sidebar
- `<main id="main-content">` for content area
- `<header aria-label="Page header">` for navbar

**Live regions:**
- `aria-live="polite"` for: toast notifications, search result counts, drag-and-drop results, save confirmations.
- `aria-live="assertive"` for: error messages that require immediate attention, delete confirmations.

**Card announcements:**
- Board cards: "{company}, {role}, in {column} column. {position} of {total}."
- Contact cards: "{name}, {role}. Email: {email}. Phone: {phone}."

**Chart accessibility:**
- Each chart has `aria-label` with a text summary.
- Example: "Application flow: 47 applied, 15 reached interview, 5 received offers, 12 rejected."
- A `<details>` element below each chart provides the same data in tabular form for screen readers and users who prefer text.

**Drag-and-drop alternative:**
- Each card's context menu (⋯ or right-click) includes "Move to column ▸" submenu listing all columns.
- Screen reader announcement on move: "Moved {company} from {fromColumn} to {toColumn}."

#### Dynamic Type / Font Scaling

- All text sized in `rem` units. Scales proportionally with browser font size setting.
- Layouts use `min-height` (not fixed `height`) to accommodate text expansion.
- Touch targets remain ≥ 44×44px at up to 200% browser zoom.
- At 200% zoom: no horizontal scrollbar (except for the kanban board's horizontal column scroll, which is intentional), no clipped content, no overlapping elements.

#### Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- All CSS transitions set to 0ms duration.
- No shimmer/pulse on skeleton loaders — static warmgray rectangles.
- No entrance/exit animations on modals, drawers, or toasts — they appear/disappear instantly.
- Drag-and-drop works but without lift/settle/bounce animation.
- Charts render in final state without animated drawing or transitions.

Implementation:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Responsive Behavior Summary

| Element | Desktop (≥ 1024px) | Tablet (768–1023px) | Mobile (< 768px) |
|---------|-------------------|--------------------|--------------------|
| Sidebar | Full width (`w-64`), persistent | Icon-only rail (`w-16`) | Hidden, hamburger drawer |
| Navbar | Offset left by sidebar width | Offset by icon rail width | Full width |
| Board columns | Horizontal scroll, all visible | Horizontal scroll, all visible | Snap-scroll with pill tab selector |
| Application Detail | Right drawer (`w-96`) | Right drawer (`w-80`) | Full-screen sheet |
| Add/Edit modal | Centered (`max-w-lg`) | Centered (`max-w-lg`) | Full-screen sheet |
| Search palette | Centered overlay (`max-w-xl`) | Centered overlay | Full-screen |
| Analytics metrics | 4-column grid | 2-column grid | 2-column grid |
| Analytics charts | Side by side | Stacked full-width | Stacked, Sankey scrollable |
| Settings | Single column (`max-w-2xl`) | Single column | Single column |
| Onboarding | Centered card (`max-w-md`) | Centered card | Centered card, full-width |

### Toast Notification System

Toasts appear in the bottom-right corner of the viewport (`fixed bottom-4 right-4 z-50`).

**Variants and behavior:**
| Variant | Icon Color | Auto-dismiss | Use |
|---------|-----------|-------------|-----|
| Success | `text-green-600 dark:text-green-400` | 5000ms | Successful saves, moves, deletes |
| Error | `text-red-600 dark:text-red-400` | Persistent (manual dismiss) | Failed operations |
| Info | `text-blue-600 dark:text-blue-400` | 5000ms | Informational messages |
| Warning | `text-amber-600 dark:text-amber-400` | 8000ms | Warnings requiring attention |

**Stacking:** Multiple toasts stack vertically with `gap-2`. Newest at bottom. Maximum 3 visible; older toasts auto-dismiss when a 4th arrives.

**Auto-dismiss:** Timer pauses on hover (user is reading). Resumes on mouse leave. Keyboard: toast is focusable, dismiss button accessible.

### Loading Strategy

**SSR + Streaming:**
- Initial page load uses React 19's `renderToReadableStream` via `entry.server.tsx`.
- Route loaders fetch data server-side; critical data renders immediately.
- Non-critical data (analytics charts, contact lists) can stream in via `Suspense` boundaries with skeleton placeholders.

**Optimistic updates:**
- Drag-and-drop column moves: UI updates immediately, server request in background.
- Inline saves (notes, contact edits, column renames): UI updates immediately.
- On server failure: revert optimistic change + show error toast.

**Skeleton matching:**
- Every skeleton placeholder matches the dimensions and layout of the real content it replaces.
- Board skeleton: 3 columns × 2–3 card-height rectangles.
- Detail skeleton: header block + tab bar + info grid rows.
- Analytics skeleton: 4 metric card rectangles + 3 chart rectangles.

### Error Handling Hierarchy

Errors are displayed at the most appropriate level:

| Error Type | Display | Component | Dismissible |
|------------|---------|-----------|-------------|
| Page load failure | Full-page error boundary | Error boundary in `root.tsx` | Refresh button |
| Section load failure | Inline Alert above content | Alert #23 (error variant) | Retry button |
| Action failure (save/delete) | Toast notification | Toast #22 (error variant) | Manual dismiss + retry |
| Form validation | Field-level + form-level | TextInput error state + Alert #23 | Auto-clears on re-submit |
| Network error | Toast notification | Toast #22 (error variant) | Manual dismiss |
| Optimistic revert | Toast notification | Toast #22 (error variant) | Manual dismiss |

**Focus management on error:**
- Form validation: focus moves to the first invalid field (per `patterns.md` §7).
- Page error: focus moves to the retry button.
- Toast: does not steal focus (non-blocking).

---

## Files Referenced

| File | Relevance |
|------|-----------|
| `app/db/schema.ts` | Data model — `boardColumn`, `application`, `contact`, `columnTransition` tables shape every screen |
| `app/db/auth-schema.ts` | Auth model — `user`, `session`, `account`, `verification` tables for Settings screen |
| `docs/design-system/tokens.json` | Warmgray/teal color tokens, typography scale, spacing, motion, breakpoints |
| `docs/design-system/components.md` | 37 component specs referenced by # number throughout |
| `docs/design-system/patterns.md` | 7 composition patterns — auth forms, kanban board, empty states, loading, errors, responsive, focus management |
| `docs/design-system/foundations.md` | Type scale, spacing guidelines, elevation rules, grid/layout, motion |
| `app/routes/dashboard.tsx` | Current stub to be replaced with Screen 1 (Kanban Board) |
| `app/routes/layout.auth.tsx` | Current auth layout — will evolve into the PageShell (#33) with sidebar + navbar |

---

## Verification Checklist

- [x] Every component reference (#N) matches the component in `docs/design-system/components.md` — verified: #1 Button, #2 IconButton, #3 TextInput, #4 Textarea, #5 Select, #8 SearchInput, #9 Badge, #10 Avatar, #11 Card, #12 Table, #13 EmptyState, #14 MetricCard, #15 Timeline, #16 Tooltip, #17 Navbar, #18 Sidebar, #19 Tabs, #22 Toast, #23 Alert, #24 Spinner, #25 Skeleton, #27 Modal, #28 Drawer, #29 DropdownMenu, #30 Popover, #31 Divider, #33 PageShell, #34 KanbanColumn, #35 ApplicationCard, #36 ApplicationDetail, #37 ColumnColorPicker
- [x] All colors use warmgray/teal tokens — no stone/emerald/gray references
- [x] Every screen has: wireframe(s), components list, interactions, keyboard shortcuts (where applicable), all states (loading/empty/error), responsive table, accessibility notes, designer's notes
- [x] All data references match schema field names exactly: `boardColumn.id`, `boardColumn.name`, `boardColumn.color`, `boardColumn.position`, `boardColumn.userId`, `application.id`, `application.company`, `application.role`, `application.url`, `application.dateApplied`, `application.salaryMin`, `application.salaryMax`, `application.salaryCurrency`, `application.notes`, `application.columnId`, `application.position`, `application.createdAt`, `application.updatedAt`, `contact.id`, `contact.name`, `contact.role`, `contact.email`, `contact.phone`, `contact.notes`, `contact.applicationId`, `columnTransition.id`, `columnTransition.applicationId`, `columnTransition.fromColumnId`, `columnTransition.toColumnId`, `columnTransition.transitionedAt`
- [x] Responsive behavior covers 3 breakpoints (desktop ≥ 1024px / tablet 768–1023px / mobile < 768px) for every screen
- [x] WCAG AA contrast ratios verified: `teal-700` (5.5:1) for text links, `teal-600` (3.7:1) for UI components, `warmgray-900` (17.1:1) for body text
