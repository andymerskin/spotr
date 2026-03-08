# BASE_URL for Site Paths

All internal asset URLs and links must use `${import.meta.env.BASE_URL}` prefix.

**Required for:** GitHub Pages deployment when site lives at a subpath (e.g. `/spotr/`).

```html
<!-- Correct -->
<img src="{`${import.meta.env.BASE_URL}spotr.svg`}" />
<a href="{`${import.meta.env.BASE_URL}examples`}">Examples</a>
<link rel="icon" href="{`${import.meta.env.BASE_URL}spotr.svg`}" />
```

- Apply to: favicon, images, internal navigation links, redirect URLs
- External URLs (e.g. github.com, npmjs.com) do NOT use BASE_URL
- Never hardcode `/` for assets—they will break when `base` is set in Astro config
