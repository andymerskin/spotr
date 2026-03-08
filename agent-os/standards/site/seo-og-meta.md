# SEO and Open Graph Meta

**Purpose:** Correct canonical URLs for GH Pages + consistent social previews.

## URL Construction

```js
const siteUrl = 'https://andymerskin.github.io';
const baseUrl = import.meta.env.BASE_URL;
const canonicalUrl = `${siteUrl}${Astro.url.pathname}`;
const ogImageUrl = `${siteUrl}${baseUrl}open-graph/spotr.png`;
```

- `canonicalUrl`: siteUrl + pathname (pathname includes base)
- `ogImageUrl`: siteUrl + baseUrl + route path (OG images need base for subpath)

## Meta Tags (Layout.astro)

- og:title, og:description, og:image, og:url, og:type
- twitter:card, twitter:title, twitter:description, twitter:image
- description, author

## OG Image Route (astro-og-canvas)

- Use Work Sans (400, 600) for title and description
- Gradient: black → cyan-950; border: cyan-400, left side
- Logo from public/spotr.png
- Add pages to the `pages` object for dynamic OG images
