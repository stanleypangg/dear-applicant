# Components

37 component specifications across 7 categories. Each spec defines purpose, variants, states, key props, accessibility requirements, and a canonical Tailwind implementation.

All examples use the `warmgray` and `teal` custom tokens defined in [tokens.json](./tokens.json). See [dev-guide.md](./dev-guide.md) for TailwindCSS v4 `@theme` setup.

---

## A. Inputs

### 1. Button

Primary interactive element. All clickable actions that aren't links.

**Variants:** `primary` | `secondary` | `ghost` | `danger`
**Sizes:** `sm` | `md` | `lg`
**Shape:** Pill (`rounded-full`) for landing CTAs, rounded (`rounded-lg`) for app UI.
**States:** default, hover, active, focus, disabled, loading

| Variant | Light | Dark |
|---------|-------|------|
| Primary | `bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800` | same |
| Secondary | `bg-warmgray-100 text-warmgray-900 hover:bg-warmgray-200` | `bg-warmgray-800 text-warmgray-100 hover:bg-warmgray-700` |
| Ghost | `text-warmgray-600 hover:bg-warmgray-100` | `text-warmgray-400 hover:bg-warmgray-800` |
| Danger | `bg-red-600 text-white hover:bg-red-700` | same |

```html
<!-- Primary, md size -->
<button class="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:opacity-50 cursor-pointer">
  Save Application
</button>

<!-- Loading state -->
<button disabled class="... disabled:opacity-50">
  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">...</svg>
  Saving...
</button>

<!-- Sizes -->
<!-- sm: px-3 py-1.5 text-xs -->
<!-- md: px-4 py-2.5 text-sm (default) -->
<!-- lg: px-6 py-3 text-base -->
```

**Accessibility:**
- Use `<button>` for actions, `<a>` for navigation — never `<div>`
- Loading state: set `disabled` and swap label text (e.g., "Saving...")
- Focus ring: `focus:ring-2 focus:ring-teal-600/30`

---

### 2. IconButton

Button containing only an icon. Used for toolbars, close buttons, compact actions.

**Variants:** `ghost` | `outlined`
**Sizes:** `sm` (32px) | `md` (40px) | `lg` (48px)

```html
<button
  aria-label="Close dialog"
  class="inline-flex items-center justify-center rounded-lg text-warmgray-500 hover:text-warmgray-700 hover:bg-warmgray-100 dark:text-warmgray-400 dark:hover:text-warmgray-200 dark:hover:bg-warmgray-800 w-10 h-10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer"
>
  <svg class="w-5 h-5" aria-hidden="true">...</svg>
</button>
```

**Accessibility:**
- **Required:** `aria-label` — icon buttons have no visible text
- Minimum touch target: 44x44px on mobile (add padding if icon is smaller)

---

### 3. TextInput

Single-line text field with label. Foundation input used across all forms.

**States:** default, focus, error, disabled
**Features:** leading icon (optional), trailing action (optional, e.g., password toggle)

```html
<div>
  <label for="company" class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5">
    Company
  </label>
  <div class="relative">
    <!-- Optional leading icon -->
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="h-4 w-4 text-warmgray-400" aria-hidden="true">...</svg>
    </div>
    <input
      id="company"
      type="text"
      class="w-full rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 placeholder:text-warmgray-400 dark:placeholder:text-warmgray-500 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors pl-9"
      placeholder="Acme Corp"
    />
  </div>
</div>

<!-- Error state -->
<input class="... border-red-500 focus:ring-red-600/30 focus:border-red-500" aria-describedby="company-error" aria-invalid="true" />
<p id="company-error" class="mt-1.5 text-sm text-red-600 dark:text-red-400">Company name is required</p>
```

**Accessibility:**
- Always pair with `<label>` via `htmlFor`/`id`
- Error state: `aria-invalid="true"` + `aria-describedby` pointing to error message
- Disabled: `disabled` attribute + `opacity-50`

---

### 4. Textarea

Multi-line text input. Used for notes, descriptions.

**Features:** auto-resize variant, character count (optional)

```html
<div>
  <label for="notes" class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5">
    Notes
  </label>
  <textarea
    id="notes"
    rows="4"
    class="w-full rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 placeholder:text-warmgray-400 dark:placeholder:text-warmgray-500 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors resize-y"
    placeholder="Add notes about this application..."
  ></textarea>
  <!-- Optional character count -->
  <p class="mt-1 text-xs text-warmgray-400 text-right">0 / 500</p>
</div>
```

**Auto-resize:** Use a JS handler to set `style.height = 'auto'` then `style.height = scrollHeight + 'px'` on input. Add `resize-none overflow-hidden` to the textarea.

---

### 5. Select

Dropdown selection. Native `<select>` with custom styling for simple cases; custom dropdown spec for searchable/multi-select.

```html
<div>
  <label for="currency" class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5">
    Currency
  </label>
  <div class="relative">
    <select
      id="currency"
      class="w-full rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors appearance-none pr-10"
    >
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
    </select>
    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <svg class="h-4 w-4 text-warmgray-400" aria-hidden="true">...</svg>
    </div>
  </div>
</div>
```

**Custom dropdown:** Use a headless UI library (e.g., Headless UI `Listbox`) for searchable or multi-select dropdowns. Apply the same border/focus/padding tokens.

---

### 6. Checkbox

Boolean toggle with label. Uses teal for checked state.

```html
<label class="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    class="h-4 w-4 rounded border-warmgray-300 dark:border-warmgray-600 text-teal-600 focus:ring-2 focus:ring-teal-600/30 dark:bg-warmgray-800 cursor-pointer"
  />
  <span class="text-sm text-warmgray-700 dark:text-warmgray-300">
    Remote only
  </span>
</label>
```

**Indeterminate state:** Set via JavaScript `checkbox.indeterminate = true`. Style with a horizontal dash icon instead of checkmark.

---

### 7. Toggle

On/off switch. Uses `role="switch"` for accessibility.

```html
<button
  role="switch"
  aria-checked="false"
  aria-label="Enable notifications"
  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-warmgray-200 dark:bg-warmgray-700 focus:outline-none focus:ring-2 focus:ring-teal-600/30 cursor-pointer"
>
  <span class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform translate-x-1" />
</button>

<!-- Checked state: bg-teal-600, translate-x-6 on the thumb -->
```

**Accessibility:**
- `role="switch"` + `aria-checked` (not checkbox)
- `aria-label` or adjacent label text
- Toggle on Enter or Space

---

### 8. SearchInput

Text input with search icon and clear button. Compact variant for toolbar use.

```html
<div class="relative">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg class="h-4 w-4 text-warmgray-400" aria-hidden="true">...</svg>
  </div>
  <input
    type="search"
    placeholder="Search applications..."
    class="w-full rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 pl-9 pr-9 py-2 text-sm text-warmgray-900 dark:text-warmgray-100 placeholder:text-warmgray-400 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-colors"
  />
  <!-- Clear button (visible when input has value) -->
  <button
    aria-label="Clear search"
    class="absolute inset-y-0 right-0 pr-3 flex items-center text-warmgray-400 hover:text-warmgray-600 cursor-pointer"
  >
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
  </button>
</div>

<!-- Compact variant: py-1.5 text-xs -->
```

---

## B. Display

### 9. Badge

Small label for status, count, or category indication.

**Variants:** `default` | `primary` | `success` | `warning` | `error` | `info`
**Sizes:** `sm` | `md`

```html
<!-- Default -->
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warmgray-100 text-warmgray-700 dark:bg-warmgray-800 dark:text-warmgray-300">
  Draft
</span>

<!-- Primary -->
<span class="... bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
  Active
</span>

<!-- Success -->
<span class="... bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
  Offer
</span>

<!-- Error -->
<span class="... bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
  Rejected
</span>
```

---

### 10. Avatar

User photo or initials fallback.

**Sizes:** `xs` (24px) | `sm` (32px) | `md` (40px) | `lg` (56px)

```html
<!-- Image -->
<img
  src="/avatar.jpg"
  alt="Jane Doe"
  class="h-10 w-10 rounded-full object-cover"
/>

<!-- Initials fallback -->
<div class="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
  <span class="text-sm font-medium text-teal-700 dark:text-teal-300">JD</span>
</div>

<!-- Generic fallback (icon) -->
<div class="h-10 w-10 rounded-full bg-warmgray-100 dark:bg-warmgray-800 flex items-center justify-center">
  <svg class="h-5 w-5 text-warmgray-400" aria-hidden="true">...</svg>
</div>
```

---

### 11. Card

Container for grouped content. Primary surface element.

**Variants:** `default` (bordered) | `elevated` (shadow-sm) | `interactive` (hover effect)

```html
<!-- Default -->
<div class="rounded-2xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 p-6">
  <h3 class="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">Title</h3>
  <p class="mt-2 text-sm text-warmgray-600 dark:text-warmgray-400">Description</p>
</div>

<!-- Interactive (clickable card) -->
<div class="rounded-2xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 p-6 hover:border-warmgray-300 dark:hover:border-warmgray-600 transition-colors cursor-pointer">
  ...
</div>

<!-- Elevated (overlays, popovers) -->
<div class="rounded-2xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 p-6 shadow-sm">
  ...
</div>
```

**Sub-sections:** Use `border-t border-warmgray-200 dark:border-warmgray-700` between sections. Padding: `pt-6 mt-6` for the subsequent section.

---

### 12. Table

Data table with minimal styling. Used for settings, contact lists, analytics.

```html
<div class="overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-warmgray-200 dark:border-warmgray-700">
        <th class="py-3 px-4 text-left text-xs font-medium text-warmgray-500 dark:text-warmgray-400 uppercase tracking-wider">
          Company
        </th>
        <th class="py-3 px-4 text-left text-xs font-medium text-warmgray-500 dark:text-warmgray-400 uppercase tracking-wider">
          Role
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-warmgray-100 dark:divide-warmgray-800">
      <tr class="hover:bg-warmgray-50 dark:hover:bg-warmgray-800/50 transition-colors">
        <td class="py-3 px-4 text-warmgray-900 dark:text-warmgray-100">Acme Corp</td>
        <td class="py-3 px-4 text-warmgray-600 dark:text-warmgray-400">Frontend Engineer</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Sticky header:** Add `sticky top-0 bg-white dark:bg-warmgray-900 z-10` to `<thead>`.

---

### 13. EmptyState

Placeholder shown when a list or section has no data. Guides the user to take action.

```html
<div class="flex flex-col items-center justify-center py-16 px-6 text-center">
  <div class="h-12 w-12 rounded-full bg-warmgray-100 dark:bg-warmgray-800 flex items-center justify-center mb-4">
    <svg class="h-6 w-6 text-warmgray-400" aria-hidden="true">...</svg>
  </div>
  <h3 class="text-base font-semibold text-warmgray-900 dark:text-warmgray-100 mb-1">
    No applications yet
  </h3>
  <p class="text-sm text-warmgray-500 dark:text-warmgray-400 max-w-sm mb-6">
    Start tracking your job search by adding your first application.
  </p>
  <button class="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-medium transition-colors">
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
    Add Application
  </button>
</div>
```

---

### 14. MetricCard

Stat display with label, value, and optional trend indicator. Used in dashboard analytics.

```html
<div class="rounded-2xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 p-6">
  <p class="text-sm text-warmgray-500 dark:text-warmgray-400">Total Applications</p>
  <div class="mt-2 flex items-baseline gap-2">
    <span class="text-2xl font-bold text-warmgray-900 dark:text-warmgray-100">47</span>
    <!-- Trend indicator -->
    <span class="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400">
      <svg class="h-3 w-3 mr-0.5" aria-hidden="true">...</svg>
      +12%
    </span>
  </div>
</div>
```

---

### 15. Timeline

Vertical timeline for showing application history (column transitions).

```html
<div class="relative pl-6">
  <!-- Timeline line -->
  <div class="absolute left-2 top-2 bottom-2 w-px bg-warmgray-200 dark:bg-warmgray-700"></div>

  <!-- Timeline item -->
  <div class="relative pb-6">
    <div class="absolute left-[-16px] top-1.5 h-3 w-3 rounded-full border-2 border-teal-600 bg-white dark:bg-warmgray-900"></div>
    <div class="ml-2">
      <p class="text-sm font-medium text-warmgray-900 dark:text-warmgray-100">
        Moved to <span class="text-teal-700 dark:text-teal-500">Interview</span>
      </p>
      <p class="text-xs text-warmgray-400 mt-0.5">2 days ago</p>
    </div>
  </div>

  <!-- Older item (muted dot) -->
  <div class="relative pb-6">
    <div class="absolute left-[-16px] top-1.5 h-3 w-3 rounded-full border-2 border-warmgray-300 dark:border-warmgray-600 bg-white dark:bg-warmgray-900"></div>
    <div class="ml-2">
      <p class="text-sm text-warmgray-600 dark:text-warmgray-400">
        Moved to <span>Applied</span>
      </p>
      <p class="text-xs text-warmgray-400 mt-0.5">1 week ago</p>
    </div>
  </div>
</div>
```

The most recent transition uses a teal dot; older transitions use warmgray dots.

---

### 16. Tooltip

Small informational popup on hover/focus. Dark background for contrast.

```html
<!-- Wrapper (position: relative) -->
<div class="relative group">
  <button aria-describedby="tooltip-1">Hover me</button>

  <!-- Tooltip -->
  <div
    id="tooltip-1"
    role="tooltip"
    class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-warmgray-900 dark:bg-warmgray-100 dark:text-warmgray-900 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
  >
    More information
    <!-- Arrow -->
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-warmgray-900 dark:border-t-warmgray-100"></div>
  </div>
</div>
```

**Positions:** `bottom-full mb-2` (top) | `top-full mt-2` (bottom) | `right-full mr-2` (left) | `left-full ml-2` (right)

**Accessibility:**
- `role="tooltip"` on the tooltip element
- Trigger element uses `aria-describedby` pointing to tooltip `id`
- Show on hover AND focus (keyboard accessible)
- Dismiss on Escape

---

## C. Navigation

### 17. Navbar

Top navigation bar. Two variants: landing (floating, transparent) and app (fixed, solid).

```html
<!-- Landing navbar -->
<nav class="fixed top-0 inset-x-0 z-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <a href="/" class="font-serif italic text-xl text-warmgray-800 dark:text-warmgray-200">
        dear applicant
      </a>
      <div class="flex items-center gap-4">
        <a href="/login" class="text-sm text-warmgray-600 dark:text-warmgray-400 hover:text-warmgray-900 dark:hover:text-warmgray-100 transition-colors">
          Sign in
        </a>
        <a href="/signup" class="rounded-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium transition-colors">
          Get Started
        </a>
      </div>
    </div>
  </div>
</nav>

<!-- App navbar -->
<header class="fixed top-0 right-0 left-64 z-40 h-16 border-b border-warmgray-200 dark:border-warmgray-700 bg-white/80 dark:bg-warmgray-900/80 backdrop-blur-sm">
  <div class="flex h-full items-center justify-between px-6">
    <h1 class="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">Dashboard</h1>
    <div class="flex items-center gap-3">
      <!-- Avatar, settings, etc. -->
    </div>
  </div>
</header>
```

---

### 18. Sidebar

App navigation sidebar. Fixed left, collapsible on mobile (becomes a drawer).

```html
<aside class="fixed inset-y-0 left-0 w-64 bg-warmgray-100 dark:bg-warmgray-900 border-r border-warmgray-200 dark:border-warmgray-700 flex flex-col z-50">
  <!-- Logo -->
  <div class="h-16 flex items-center px-6">
    <a href="/" class="font-serif italic text-xl text-warmgray-800 dark:text-warmgray-200">
      dear applicant
    </a>
  </div>

  <!-- Nav items -->
  <nav class="flex-1 px-3 py-4 space-y-1">
    <!-- Active item -->
    <a href="/dashboard" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
      <svg class="h-5 w-5" aria-hidden="true">...</svg>
      Board
    </a>
    <!-- Inactive item -->
    <a href="/analytics" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-warmgray-600 dark:text-warmgray-400 hover:bg-warmgray-200 dark:hover:bg-warmgray-800 transition-colors">
      <svg class="h-5 w-5" aria-hidden="true">...</svg>
      Analytics
    </a>
  </nav>

  <!-- Footer (settings, user) -->
  <div class="border-t border-warmgray-200 dark:border-warmgray-700 p-4">
    ...
  </div>
</aside>
```

**Mobile:** Sidebar becomes a drawer overlay (see Drawer component). Toggle with hamburger menu in navbar.

---

### 19. Tabs

Content section switcher. Two variants: underline (default) and pill.

```html
<!-- Underline tabs -->
<div role="tablist" class="flex border-b border-warmgray-200 dark:border-warmgray-700">
  <button
    role="tab"
    aria-selected="true"
    class="px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-500 border-b-2 border-teal-600 dark:border-teal-500 -mb-px"
  >
    Details
  </button>
  <button
    role="tab"
    aria-selected="false"
    class="px-4 py-2.5 text-sm font-medium text-warmgray-500 dark:text-warmgray-400 hover:text-warmgray-700 dark:hover:text-warmgray-300 border-b-2 border-transparent hover:border-warmgray-300 dark:hover:border-warmgray-600 -mb-px transition-colors"
  >
    Contacts
  </button>
</div>

<!-- Pill tabs -->
<div role="tablist" class="inline-flex bg-warmgray-100 dark:bg-warmgray-800 rounded-lg p-1">
  <button role="tab" aria-selected="true" class="rounded-md px-3 py-1.5 text-sm font-medium bg-white dark:bg-warmgray-700 text-warmgray-900 dark:text-warmgray-100 shadow-xs">
    Week
  </button>
  <button role="tab" aria-selected="false" class="rounded-md px-3 py-1.5 text-sm font-medium text-warmgray-500 dark:text-warmgray-400 hover:text-warmgray-700 dark:hover:text-warmgray-200">
    Month
  </button>
</div>
```

**Accessibility:**
- Container: `role="tablist"`
- Each tab: `role="tab"` + `aria-selected`
- Tab panel: `role="tabpanel"` + `aria-labelledby`
- Arrow keys navigate between tabs, Enter/Space activates

---

### 20. Breadcrumb

Navigation path indicator. Shows hierarchy.

```html
<nav aria-label="Breadcrumb">
  <ol class="flex items-center gap-1.5 text-sm">
    <li>
      <a href="/dashboard" class="text-warmgray-500 dark:text-warmgray-400 hover:text-warmgray-700 dark:hover:text-warmgray-200 transition-colors">
        Dashboard
      </a>
    </li>
    <li class="text-warmgray-300 dark:text-warmgray-600">/</li>
    <li>
      <span class="text-warmgray-900 dark:text-warmgray-100 font-medium" aria-current="page">
        Application Details
      </span>
    </li>
  </ol>
</nav>
```

**Accessibility:** `aria-label="Breadcrumb"` on `<nav>`, `aria-current="page"` on current item.

---

### 21. Pagination

Page navigation for lists. Previous/next arrows with page numbers.

```html
<nav aria-label="Pagination" class="flex items-center justify-center gap-1">
  <button
    aria-label="Previous page"
    class="inline-flex items-center justify-center h-9 w-9 rounded-lg text-warmgray-500 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 transition-colors disabled:opacity-50 cursor-pointer"
    disabled
  >
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
  </button>
  <button aria-current="page" class="h-9 w-9 rounded-lg bg-teal-600 text-white text-sm font-medium">1</button>
  <button class="h-9 w-9 rounded-lg text-warmgray-600 dark:text-warmgray-400 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 text-sm transition-colors cursor-pointer">2</button>
  <button class="h-9 w-9 rounded-lg text-warmgray-600 dark:text-warmgray-400 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 text-sm transition-colors cursor-pointer">3</button>
  <button
    aria-label="Next page"
    class="inline-flex items-center justify-center h-9 w-9 rounded-lg text-warmgray-500 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 transition-colors cursor-pointer"
  >
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
  </button>
</nav>
```

---

## D. Feedback

### 22. Toast

Non-blocking notification. Appears in bottom-right, auto-dismisses.

**Variants:** `default` | `success` | `warning` | `error` | `info`
**Duration:** 5000ms default, persistent for errors

```html
<div
  role="alert"
  class="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 shadow-md px-4 py-3 text-sm animate-slide-in-right"
>
  <svg class="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" aria-hidden="true">...</svg>
  <p class="text-warmgray-900 dark:text-warmgray-100">Application saved successfully</p>
  <button aria-label="Dismiss" class="text-warmgray-400 hover:text-warmgray-600 cursor-pointer ml-2">
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
  </button>
</div>
```

**Animation:** Slide in from right with `translateX(100%)` to `translateX(0)`, 300ms ease-out.

**Accessibility:** `role="alert"` for important messages, `role="status"` for informational. Auto-dismiss pauses on hover.

---

### 23. Alert

Inline banner for contextual messages within a page section.

**Variants:** `success` | `warning` | `error` | `info`

```html
<!-- Error alert -->
<div class="rounded-lg bg-red-50 dark:bg-red-600/15 border border-red-200 dark:border-red-600/30 p-4" role="alert">
  <div class="flex gap-3">
    <svg class="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true">...</svg>
    <div>
      <p class="text-sm font-medium text-red-800 dark:text-red-300">Sign in failed</p>
      <p class="text-sm text-red-700 dark:text-red-400 mt-1">Please check your email and password.</p>
    </div>
    <!-- Optional dismiss -->
    <button aria-label="Dismiss" class="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
      <svg class="h-4 w-4" aria-hidden="true">...</svg>
    </button>
  </div>
</div>
```

---

### 24. Spinner

Loading indicator. Inherits text color from parent for flexibility.

**Sizes:** `sm` (16px) | `md` (24px) | `lg` (32px)

```html
<!-- Inherits color from parent -->
<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-label="Loading">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
</svg>

<!-- In a button -->
<button disabled class="... text-white">
  <svg class="animate-spin h-4 w-4" ...>...</svg>
  Loading...
</button>
```

**Accessibility:** `aria-label="Loading"` on the SVG. If used as page-level loader, wrap in a container with `role="status"` and `aria-live="polite"`.

---

### 25. Skeleton

Content placeholder during loading. Shimmer animation.

**Variants:** `text` (rounded bar) | `circle` (avatar) | `rectangle` (card/image)

```html
<!-- Text skeleton -->
<div class="animate-pulse space-y-3">
  <div class="h-4 bg-warmgray-200 dark:bg-warmgray-700 rounded w-3/4"></div>
  <div class="h-4 bg-warmgray-200 dark:bg-warmgray-700 rounded w-1/2"></div>
</div>

<!-- Circle skeleton (avatar) -->
<div class="h-10 w-10 bg-warmgray-200 dark:bg-warmgray-700 rounded-full animate-pulse"></div>

<!-- Card skeleton -->
<div class="rounded-2xl border border-warmgray-200 dark:border-warmgray-700 p-6 animate-pulse">
  <div class="h-4 bg-warmgray-200 dark:bg-warmgray-700 rounded w-1/3 mb-4"></div>
  <div class="h-3 bg-warmgray-200 dark:bg-warmgray-700 rounded w-full mb-2"></div>
  <div class="h-3 bg-warmgray-200 dark:bg-warmgray-700 rounded w-2/3"></div>
</div>
```

---

### 26. ProgressBar

Horizontal progress indicator. Teal fill.

**Sizes:** `sm` (4px) | `md` (8px) | `lg` (12px)

```html
<div role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" aria-label="Profile completion">
  <div class="h-2 w-full rounded-full bg-warmgray-100 dark:bg-warmgray-800 overflow-hidden">
    <div class="h-full rounded-full bg-teal-600 transition-all duration-300" style="width: 65%"></div>
  </div>
</div>
```

**Accessibility:** `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`.

---

## E. Overlays

### 27. Modal

Centered dialog overlay. Used for forms, confirmations, detail views.

**Sizes:** `sm` (max-w-sm) | `md` (max-w-lg) | `lg` (max-w-2xl) | `full` (max-w-4xl)

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="fixed inset-0 bg-warmgray-950/60 dark:bg-warmgray-950/80" aria-hidden="true"></div>

  <!-- Modal panel -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    class="relative z-10 w-full max-w-lg rounded-2xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 shadow-lg"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-warmgray-200 dark:border-warmgray-700">
      <h2 id="modal-title" class="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">
        Add Application
      </h2>
      <button aria-label="Close" class="text-warmgray-400 hover:text-warmgray-600 dark:hover:text-warmgray-300 cursor-pointer">
        <svg class="h-5 w-5" aria-hidden="true">...</svg>
      </button>
    </div>

    <!-- Body -->
    <div class="px-6 py-6">
      ...
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-3 px-6 py-4 border-t border-warmgray-200 dark:border-warmgray-700">
      <button class="rounded-lg px-4 py-2.5 text-sm font-medium text-warmgray-700 dark:text-warmgray-300 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 transition-colors cursor-pointer">
        Cancel
      </button>
      <button class="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer">
        Save
      </button>
    </div>
  </div>
</div>
```

**Accessibility:**
- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` pointing to the title
- Focus trap: Tab cycles within modal, Shift+Tab reverses
- Escape closes the modal
- Return focus to trigger element on close

---

### 28. Drawer

Slide-in panel from the right. Full-screen on mobile.

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50">
  <div class="fixed inset-0 bg-warmgray-950/60 dark:bg-warmgray-950/80" aria-hidden="true"></div>

  <!-- Drawer panel -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="drawer-title"
    class="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-warmgray-900 border-l border-warmgray-200 dark:border-warmgray-700 shadow-lg transform transition-transform duration-300"
  >
    <div class="flex items-center justify-between px-6 py-4 border-b border-warmgray-200 dark:border-warmgray-700">
      <h2 id="drawer-title" class="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">
        Application Details
      </h2>
      <button aria-label="Close" class="text-warmgray-400 hover:text-warmgray-600 cursor-pointer">
        <svg class="h-5 w-5" aria-hidden="true">...</svg>
      </button>
    </div>
    <div class="overflow-y-auto h-full px-6 py-6">
      ...
    </div>
  </div>
</div>
```

**Animation:** `translateX(100%)` to `translateX(0)`, 300ms ease-out.
**Mobile:** Full width (`w-full`), no `sm:w-96` constraint.

---

### 29. DropdownMenu

Action menu triggered by a button. Used for "more actions" patterns.

```html
<div class="relative">
  <button
    aria-haspopup="true"
    aria-expanded="false"
    class="..."
  >
    Options
  </button>

  <!-- Menu -->
  <div
    role="menu"
    class="absolute right-0 mt-2 w-48 rounded-xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 shadow-sm py-1 z-50"
  >
    <button role="menuitem" class="flex w-full items-center gap-2 px-3 py-2 text-sm text-warmgray-700 dark:text-warmgray-300 hover:bg-warmgray-50 dark:hover:bg-warmgray-800 transition-colors">
      <svg class="h-4 w-4 text-warmgray-400" aria-hidden="true">...</svg>
      Edit
    </button>
    <!-- Separator -->
    <div class="my-1 border-t border-warmgray-100 dark:border-warmgray-800"></div>
    <button role="menuitem" class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
      <svg class="h-4 w-4" aria-hidden="true">...</svg>
      Delete
    </button>
  </div>
</div>
```

**Accessibility:**
- Trigger: `aria-haspopup="true"` + `aria-expanded`
- Menu: `role="menu"`, items: `role="menuitem"`
- Arrow keys navigate items, Enter activates, Escape closes
- Focus moves to first item on open

---

### 30. Popover

Floating panel with arbitrary content. Auto-flips positioning when near viewport edges.

```html
<div class="relative">
  <button aria-expanded="false">Trigger</button>

  <!-- Popover -->
  <div class="absolute top-full left-0 mt-2 w-72 rounded-xl border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 shadow-sm p-4 z-50">
    <!-- Arbitrary content -->
    <h3 class="text-sm font-medium text-warmgray-900 dark:text-warmgray-100 mb-2">Filter</h3>
    <div>...</div>
  </div>
</div>
```

**Positioning:** Use a positioning library (Floating UI) for auto-flip when near edges. Fallback positions: bottom-start, top-start, bottom-end, top-end.

---

## F. Layout

### 31. Divider

Visual separator between sections. Horizontal or vertical.

```html
<!-- Horizontal (default) -->
<hr class="border-warmgray-200 dark:border-warmgray-700" />

<!-- With label -->
<div class="relative my-6">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-warmgray-200 dark:border-warmgray-700"></div>
  </div>
  <div class="relative flex justify-center text-xs uppercase tracking-wide">
    <span class="bg-white dark:bg-warmgray-900 px-3 text-warmgray-400">or</span>
  </div>
</div>

<!-- Vertical -->
<div class="w-px h-6 bg-warmgray-200 dark:bg-warmgray-700"></div>
```

---

### 32. Stack

Flex layout helper pattern. Not a component per se — a documented pattern for consistent spacing.

```html
<!-- Vertical stack (default) -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Horizontal stack -->
<div class="flex items-center gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Responsive: vertical on mobile, horizontal on desktop -->
<div class="flex flex-col sm:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

Use `gap-*` for spacing (not margin on children). Use `items-center` for vertical centering in horizontal stacks.

---

### 33. PageShell

Top-level layout composition: sidebar + navbar + main content area.

```html
<div class="min-h-screen bg-white dark:bg-warmgray-950">
  <!-- Sidebar (see component #18) -->
  <aside class="fixed inset-y-0 left-0 w-64 ...">...</aside>

  <!-- Main area -->
  <div class="lg:pl-64">
    <!-- Navbar (see component #17, app variant) -->
    <header class="fixed top-0 right-0 left-0 lg:left-64 z-40 h-16 ...">...</header>

    <!-- Content -->
    <main class="pt-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <!-- Page content -->
      </div>
    </main>
  </div>
</div>
```

**Mobile:** Sidebar hidden by default, triggered as a drawer overlay. Navbar spans full width with hamburger toggle.

---

## G. Application-Specific

### 34. KanbanColumn

Single column in the kanban board. Fixed width, scrollable, accepts drops.

The color indicator at the top corresponds to `boardColumn.color` from the database — it's user-customizable and independent of the design system's primary teal.

```html
<div class="w-72 shrink-0 flex flex-col bg-warmgray-50 dark:bg-warmgray-900 rounded-xl border border-warmgray-200 dark:border-warmgray-700 max-h-[calc(100vh-8rem)]">
  <!-- Column header -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-warmgray-200 dark:border-warmgray-700">
    <div class="flex items-center gap-2">
      <!-- Color indicator from boardColumn.color -->
      <div class="h-3 w-3 rounded-full" style="background-color: var(--column-color)"></div>
      <h3 class="text-sm font-semibold text-warmgray-900 dark:text-warmgray-100">Applied</h3>
      <span class="text-xs text-warmgray-400">12</span>
    </div>
    <button aria-label="Column options" class="text-warmgray-400 hover:text-warmgray-600 cursor-pointer">
      <svg class="h-4 w-4" aria-hidden="true">...</svg>
    </button>
  </div>

  <!-- Scrollable card area -->
  <div class="flex-1 overflow-y-auto p-2 space-y-2">
    <!-- ApplicationCard components -->
  </div>

  <!-- Add button -->
  <div class="p-2 border-t border-warmgray-200 dark:border-warmgray-700">
    <button class="w-full flex items-center justify-center gap-1 rounded-lg py-2 text-sm text-warmgray-400 hover:text-warmgray-600 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 transition-colors cursor-pointer">
      <svg class="h-4 w-4" aria-hidden="true">...</svg>
      Add
    </button>
  </div>
</div>
```

**Drop target state:** On drag-over, add `ring-2 ring-teal-600/30` to the column.

---

### 35. ApplicationCard

Individual job application in the kanban board. Displays company, role, date, salary range.

The left border accent uses the parent column's color (from `boardColumn.color`).

```html
<div
  draggable="true"
  class="group rounded-lg border border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 p-3 cursor-grab active:cursor-grabbing hover:border-warmgray-300 dark:hover:border-warmgray-600 transition-colors"
  style="border-left: 3px solid var(--column-color)"
>
  <div class="flex items-start justify-between">
    <div class="min-w-0">
      <p class="text-sm font-medium text-warmgray-900 dark:text-warmgray-100 truncate">Acme Corp</p>
      <p class="text-xs text-warmgray-500 dark:text-warmgray-400 truncate mt-0.5">Frontend Engineer</p>
    </div>
    <!-- Drag handle (visible on hover) -->
    <div class="opacity-0 group-hover:opacity-100 transition-opacity text-warmgray-300 dark:text-warmgray-600">
      <svg class="h-4 w-4" aria-hidden="true">...</svg>
    </div>
  </div>

  <!-- Metadata row -->
  <div class="flex items-center gap-3 mt-2 text-xs text-warmgray-400">
    <span>Mar 1</span>
    <span>$120k–$160k</span>
  </div>
</div>
```

**Dragging state:** Add `opacity-50 ring-2 ring-teal-600/30` while dragging.

---

### 36. ApplicationDetail

Expanded view of a single application. Can be rendered as a modal or full page. Contains info grid, notes, contacts list, and timeline.

```html
<div class="space-y-6">
  <!-- Header -->
  <div>
    <h2 class="text-xl font-semibold text-warmgray-900 dark:text-warmgray-100">Frontend Engineer</h2>
    <p class="text-sm text-warmgray-500 dark:text-warmgray-400 mt-1">Acme Corp</p>
  </div>

  <!-- Info grid -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <p class="text-xs font-medium text-warmgray-400 uppercase tracking-wider">Status</p>
      <p class="mt-1 text-sm text-warmgray-900 dark:text-warmgray-100">Interview</p>
    </div>
    <div>
      <p class="text-xs font-medium text-warmgray-400 uppercase tracking-wider">Applied</p>
      <p class="mt-1 text-sm text-warmgray-900 dark:text-warmgray-100">Mar 1, 2026</p>
    </div>
    <div>
      <p class="text-xs font-medium text-warmgray-400 uppercase tracking-wider">Salary Range</p>
      <p class="mt-1 text-sm text-warmgray-900 dark:text-warmgray-100">$120,000 – $160,000 USD</p>
    </div>
    <div>
      <p class="text-xs font-medium text-warmgray-400 uppercase tracking-wider">URL</p>
      <a href="#" class="mt-1 text-sm text-teal-700 dark:text-teal-500 hover:underline truncate block">
        acmecorp.com/careers/frontend
      </a>
    </div>
  </div>

  <!-- Notes -->
  <div>
    <h3 class="text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-2">Notes</h3>
    <div class="rounded-lg bg-warmgray-50 dark:bg-warmgray-800 p-4 text-sm text-warmgray-700 dark:text-warmgray-300 whitespace-pre-wrap">
      Great culture, remote-first. Tech stack: React, TypeScript, Node.
    </div>
  </div>

  <!-- Contacts (uses Table component pattern) -->
  <div>
    <h3 class="text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-2">Contacts</h3>
    <!-- See Table component (#12) -->
  </div>

  <!-- Timeline (uses Timeline component pattern) -->
  <div>
    <h3 class="text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-2">History</h3>
    <!-- See Timeline component (#15) -->
  </div>
</div>
```

---

### 37. ColumnColorPicker

Popover for selecting a column's display color. Shows a preset palette with checkmark on the selected color.

```html
<div class="w-56 p-3">
  <p class="text-xs font-medium text-warmgray-500 dark:text-warmgray-400 mb-3">Column Color</p>
  <div class="grid grid-cols-6 gap-2">
    <!-- Color swatch (selected) -->
    <button
      aria-label="Teal"
      aria-pressed="true"
      class="h-7 w-7 rounded-full flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-warmgray-900 dark:ring-warmgray-100 dark:ring-offset-warmgray-900"
      style="background-color: #0D9488"
    >
      <svg class="h-3 w-3 text-white" aria-hidden="true">
        <path fill="currentColor" d="M5 10l-3-3 1.5-1.5L5 7l4.5-4.5L11 4z"/>
      </svg>
    </button>

    <!-- Color swatch (unselected) -->
    <button
      aria-label="Blue"
      aria-pressed="false"
      class="h-7 w-7 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-warmgray-300 dark:hover:ring-warmgray-600 dark:ring-offset-warmgray-900 transition-shadow"
      style="background-color: #2563EB"
    ></button>

    <!-- Additional colors: purple, pink, orange, red, yellow, green, warmgray-400, warmgray-600 -->
  </div>
</div>
```

**Preset palette:** teal, blue, purple, pink, orange, red, yellow, green, warmgray-400, warmgray-600 (10 colors, 2 rows).

**Accessibility:**
- Each swatch: `aria-label` with color name + `aria-pressed`
- Keyboard: arrow keys navigate grid, Enter/Space selects
- Selected swatch shows checkmark icon and `ring-2` highlight
