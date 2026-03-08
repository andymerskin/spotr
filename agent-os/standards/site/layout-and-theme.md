# Site Layout and Theme

## Content Width

Main content uses `max-w-6xl mx-auto` with full-width wrappers (`w-full px-6` or `px-8`).

## Section Backgrounds

- Header: `bg-neutral-900`
- Main: `bg-neutral-950` (or inherited)
- Footer: `bg-black`

## Color System (Dark Theme)

- **Primary CTA:** `cyan-600` / `hover:bg-cyan-700`
- **Secondary buttons:** `bg-neutral-800 border-neutral-700`
- **Accent highlights:** `amber-300` (list carets, search match highlighting)
- **Footer branding:** `emerald-500` with `font-jersey`

## List Carets

For feature lists, use `.list-carets` (defined in global.css): bullets replaced with amber `›` chevrons.

```html
<ul class="list-carets">
  <li><strong>Feature</strong> - description</li>
</ul>
```
