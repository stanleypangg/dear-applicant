# Patterns

7 composition patterns that combine components from [components.md](./components.md) into complete, reusable page sections. Each pattern includes Tailwind code examples using the `warmgray`/`teal` token system.

---

## 1. Auth Forms

Centered card layout for login, signup, forgot-password, and reset-password pages.

### Layout Structure

```html
<div class="min-h-screen flex flex-col items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
  <div class="w-full max-w-sm animate-fade-in">
    <!-- Wordmark -->
    <h1 class="font-serif italic text-4xl text-center text-warmgray-800 dark:text-warmgray-200 mb-10">
      dear applicant
    </h1>

    <!-- Card -->
    <div class="bg-white dark:bg-warmgray-900 rounded-2xl p-8 shadow-xs border border-warmgray-200 dark:border-warmgray-700">
      <h2 class="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-6">
        Sign in
      </h2>

      <!-- Error state (conditional) -->
      <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-600/15 text-red-600 dark:text-red-400 text-sm" role="alert">
        Invalid email or password
      </div>

      <!-- Form -->
      <form class="space-y-4">
        <!-- TextInput fields -->
        <div>
          <label for="email" class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            class="w-full rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 placeholder:text-warmgray-400 dark:placeholder:text-warmgray-500 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5">
            Password
          </label>
          <input id="password" type="password" required class="..." />
          <div class="mt-1.5 text-right">
            <a href="/forgot-password" class="text-sm text-warmgray-500 dark:text-warmgray-400 hover:text-teal-700 dark:hover:text-teal-500 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <!-- Primary button -->
        <button type="submit" class="w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer mt-2">
          Sign in
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-warmgray-200 dark:border-warmgray-700"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase tracking-wide">
          <span class="bg-white dark:bg-warmgray-900 px-3 text-warmgray-400">or</span>
        </div>
      </div>

      <!-- Social login buttons -->
      <div class="grid grid-cols-2 gap-3">
        <button class="flex items-center justify-center gap-2 rounded-lg border border-warmgray-300 dark:border-warmgray-700 bg-white dark:bg-warmgray-800 px-4 py-2.5 text-sm font-medium text-warmgray-700 dark:text-warmgray-300 hover:bg-warmgray-50 dark:hover:bg-warmgray-700 transition-colors cursor-pointer disabled:opacity-50">
          <svg aria-hidden="true">...</svg>
          Google
        </button>
        <button class="...">
          <svg aria-hidden="true">...</svg>
          Microsoft
        </button>
      </div>
    </div>

    <!-- Footer link -->
    <p class="text-center text-sm text-warmgray-500 dark:text-warmgray-400 mt-6">
      Don't have an account?
      <a href="/signup" class="text-teal-700 dark:text-teal-500 hover:underline font-medium">Sign up</a>
    </p>
  </div>
</div>
```

### States

- **Loading:** Submit button shows spinner + "Signing in..." text, all inputs disabled
- **Error:** Red alert banner above form, field-level errors below specific inputs
- **Email unverified:** Amber alert with resend button, countdown timer
- **Success (signup):** Green alert "Check your inbox for a verification link"

---

## 2. Kanban Board

Horizontal-scrolling board of columns, each containing draggable application cards.

### Layout

```html
<div class="min-h-screen bg-white dark:bg-warmgray-950">
  <!-- PageShell: sidebar + navbar -->

  <main class="pt-16 lg:pl-64">
    <!-- Board toolbar -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-warmgray-200 dark:border-warmgray-700">
      <h1 class="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">Board</h1>
      <div class="flex items-center gap-3">
        <!-- SearchInput (compact) -->
        <!-- Add Column button -->
        <button class="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
          <svg class="h-4 w-4" aria-hidden="true">...</svg>
          Add Column
        </button>
      </div>
    </div>

    <!-- Board columns (horizontal scroll) -->
    <div class="flex gap-4 p-6 overflow-x-auto min-h-[calc(100vh-8rem)]">
      <!-- KanbanColumn components (w-72, shrink-0) -->

      <!-- Column 1 -->
      <div class="w-72 shrink-0 flex flex-col bg-warmgray-50 dark:bg-warmgray-900 rounded-xl border border-warmgray-200 dark:border-warmgray-700 max-h-[calc(100vh-10rem)]">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-warmgray-200 dark:border-warmgray-700">
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-teal-600"></div>
            <h3 class="text-sm font-semibold text-warmgray-900 dark:text-warmgray-100">Applied</h3>
            <span class="text-xs text-warmgray-400">5</span>
          </div>
        </div>
        <!-- Cards -->
        <div class="flex-1 overflow-y-auto p-2 space-y-2">
          <!-- ApplicationCard components -->
        </div>
      </div>

      <!-- Column 2, 3, ... -->
    </div>
  </main>
</div>
```

### Drag-and-Drop Notes

- Card being dragged: `opacity-50 ring-2 ring-teal-600/30`
- Drop target column: `ring-2 ring-teal-600/30 bg-teal-50/50 dark:bg-teal-950/20`
- Drop placeholder: `h-1 rounded-full bg-teal-600/30 mx-2` between cards
- Use `cursor-grab` on cards, `cursor-grabbing` while dragging
- On drop, create a `columnTransition` record if the column changed

---

## 3. Empty States

Three tiers depending on context.

### First-time User (Board Empty)

```html
<div class="flex flex-col items-center justify-center py-24 px-6 text-center">
  <div class="h-16 w-16 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center mb-6">
    <svg class="h-8 w-8 text-teal-600 dark:text-teal-400" aria-hidden="true">...</svg>
  </div>
  <h2 class="text-xl font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">
    Welcome to your board
  </h2>
  <p class="text-sm text-warmgray-500 dark:text-warmgray-400 max-w-md mb-8">
    Start tracking your job search by creating your first column. We recommend starting with
    "Bookmarked", "Applied", "Interview", and "Offer".
  </p>
  <button class="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 text-sm font-medium transition-colors cursor-pointer">
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
    Create Default Columns
  </button>
</div>
```

### Column Empty

```html
<div class="flex flex-col items-center justify-center py-8 px-4 text-center">
  <p class="text-xs text-warmgray-400">No applications</p>
  <button class="mt-2 text-xs text-teal-700 dark:text-teal-500 hover:underline cursor-pointer">
    Add one
  </button>
</div>
```

### Search No Results

```html
<div class="flex flex-col items-center justify-center py-16 px-6 text-center">
  <div class="h-12 w-12 rounded-full bg-warmgray-100 dark:bg-warmgray-800 flex items-center justify-center mb-4">
    <svg class="h-6 w-6 text-warmgray-400" aria-hidden="true">...</svg>
  </div>
  <h3 class="text-base font-semibold text-warmgray-900 dark:text-warmgray-100 mb-1">
    No results found
  </h3>
  <p class="text-sm text-warmgray-500 dark:text-warmgray-400">
    Try adjusting your search or filter criteria.
  </p>
</div>
```

---

## 4. Loading

### Page-Level Skeleton

Used during SSR streaming or route transitions.

```html
<div class="animate-pulse space-y-6 p-6">
  <!-- Toolbar skeleton -->
  <div class="flex items-center justify-between">
    <div class="h-6 bg-warmgray-200 dark:bg-warmgray-700 rounded w-32"></div>
    <div class="h-9 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg w-28"></div>
  </div>

  <!-- Kanban skeleton -->
  <div class="flex gap-4">
    <div class="w-72 shrink-0 space-y-2">
      <div class="h-10 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg"></div>
      <div class="h-20 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg"></div>
      <div class="h-20 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg"></div>
    </div>
    <div class="w-72 shrink-0 space-y-2">
      <div class="h-10 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg"></div>
      <div class="h-20 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg"></div>
    </div>
    <div class="w-72 shrink-0 space-y-2">
      <div class="h-10 bg-warmgray-200 dark:bg-warmgray-700 rounded-lg"></div>
    </div>
  </div>
</div>
```

### Button Loading

```html
<button disabled class="... disabled:opacity-50">
  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
  Saving...
</button>
```

### Optimistic Updates

For drag-and-drop column moves, update the UI immediately on drop. If the server request fails, revert the card to its original position and show an error toast.

---

## 5. Error Handling

### Field-Level Validation

```html
<div>
  <label for="email" class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
    class="w-full rounded-lg border border-red-500 dark:border-red-500 bg-white dark:bg-warmgray-800 px-3.5 py-2.5 text-sm text-warmgray-900 dark:text-warmgray-100 outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-500 transition-colors"
  />
  <p id="email-error" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
    Please enter a valid email address.
  </p>
</div>
```

### API Error (Inline Banner)

```html
<div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-600/15 text-red-600 dark:text-red-400 text-sm" role="alert">
  Something went wrong. Please try again.
</div>
```

### Page-Level Error (Error Boundary)

```html
<div class="min-h-screen flex items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
  <div class="text-center max-w-md">
    <div class="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-6">
      <svg class="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true">...</svg>
    </div>
    <h1 class="text-xl font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">Something went wrong</h1>
    <p class="text-sm text-warmgray-500 dark:text-warmgray-400 mb-6">
      We encountered an unexpected error. Please try refreshing the page.
    </p>
    <button onclick="window.location.reload()" class="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 text-sm font-medium transition-colors cursor-pointer">
      Refresh Page
    </button>
  </div>
</div>
```

### 404 Not Found

```html
<div class="min-h-screen flex items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
  <div class="text-center max-w-md">
    <p class="text-6xl font-bold text-warmgray-200 dark:text-warmgray-700 mb-4">404</p>
    <h1 class="text-xl font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">Page not found</h1>
    <p class="text-sm text-warmgray-500 dark:text-warmgray-400 mb-6">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <a href="/dashboard" class="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 text-sm font-medium transition-colors inline-block">
      Back to Dashboard
    </a>
  </div>
</div>
```

### Network Error (Toast)

```html
<div role="alert" class="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-600/30 bg-white dark:bg-warmgray-900 shadow-md px-4 py-3 text-sm">
  <svg class="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true">...</svg>
  <p class="text-warmgray-900 dark:text-warmgray-100">Network error. Check your connection and try again.</p>
  <button aria-label="Dismiss" class="text-warmgray-400 hover:text-warmgray-600 cursor-pointer ml-2">
    <svg class="h-4 w-4" aria-hidden="true">...</svg>
  </button>
</div>
```

---

## 6. Responsive

### Mobile Navigation

On screens below `lg`, the sidebar collapses and a hamburger menu appears in the navbar.

```html
<!-- Mobile navbar with hamburger -->
<header class="fixed top-0 inset-x-0 z-40 h-16 border-b border-warmgray-200 dark:border-warmgray-700 bg-white dark:bg-warmgray-900 lg:hidden">
  <div class="flex h-full items-center justify-between px-4">
    <button aria-label="Open menu" class="text-warmgray-600 dark:text-warmgray-400 cursor-pointer">
      <svg class="h-6 w-6" aria-hidden="true">...</svg>
    </button>
    <span class="font-serif italic text-lg text-warmgray-800 dark:text-warmgray-200">dear applicant</span>
    <div class="w-6"></div> <!-- Spacer for centering -->
  </div>
</header>

<!-- Sidebar becomes a drawer on mobile -->
<!-- See Drawer component (#28) -->
```

### Kanban Board — Mobile

On mobile, the kanban board can switch between horizontal scroll (default) and a vertical list view.

```html
<!-- Horizontal scroll (default, works on all sizes) -->
<div class="flex gap-4 p-4 overflow-x-auto snap-x snap-mandatory">
  <div class="w-72 shrink-0 snap-start">...</div>
</div>

<!-- Vertical list view (mobile alternative) -->
<div class="space-y-4 p-4 md:hidden">
  <!-- Each column as a collapsible section -->
  <details open>
    <summary class="flex items-center gap-2 py-2 text-sm font-semibold text-warmgray-900 dark:text-warmgray-100 cursor-pointer">
      <div class="h-3 w-3 rounded-full bg-teal-600"></div>
      Applied <span class="text-warmgray-400 font-normal">5</span>
    </summary>
    <div class="space-y-2 mt-2">
      <!-- ApplicationCard components -->
    </div>
  </details>
</div>
```

### Modals to Full-Screen

On mobile, modals expand to full viewport.

```html
<!-- Modal responsive sizing -->
<div class="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:rounded-2xl bg-white dark:bg-warmgray-900 ...">
  ...
</div>
```

---

## 7. Focus Management

### Post-Error Focus

When a form submission fails, move focus to the first error or the error summary.

```tsx
// After failed submission:
const firstError = document.querySelector('[aria-invalid="true"]');
if (firstError instanceof HTMLElement) {
  firstError.focus();
}
```

### Modal Open/Close

```tsx
// On open: store trigger, focus first focusable in modal
const trigger = document.activeElement;
modal.querySelector('input, button')?.focus();

// On close: restore focus to trigger
trigger?.focus();
```

### Skip Link

First element in the DOM, visible on focus.

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium">
  Skip to main content
</a>

<!-- Later in the page -->
<main id="main-content" tabindex="-1">...</main>
```

### Tab Trapping in Modals

When a modal is open, Tab and Shift+Tab cycle only through focusable elements within the modal. Use a headless UI library or implement manually:

```tsx
function trapFocus(modal: HTMLElement) {
  const focusable = modal.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0] as HTMLElement;
  const last = focusable[focusable.length - 1] as HTMLElement;

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```
