# Tailwind CSS Conventions

## Interactive Elements

Add `cursor-pointer` to all interactive elements:

```html
<!-- Buttons -->
<button class="cursor-pointer">Click me</button>

<!-- Links without href (used as buttons) -->
<a class="cursor-pointer" onclick="...">Action</a>

<!-- Links with href don't need it (browser default) -->
<a href="/page">Link</a>
```

## Vertical Spacing

Prefer `mt-*` (margin-top) or `space-y-*` (gap) for vertical spacing. Avoid `mb-*` (margin-bottom).

```html
<!-- Good: margin-top -->
<div class="mt-4">Content</div>

<!-- Good: space-y for lists -->
<div class="space-y-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Avoid: margin-bottom -->
<div class="mb-4">Content</div>
```

**Why:** Consistent spacing direction makes layouts easier to reason about and maintain. It also prevents the last element in lists from extending parent height unnecessarily.
