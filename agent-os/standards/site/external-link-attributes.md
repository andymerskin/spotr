# External Link Attributes

When opening external links in a new tab, always add `rel="noopener noreferrer"`.

**Why:** Security (prevents tab-nabbing) and UX (keeps user on your site).

```html
<a href="https://github.com/..." target="_blank" rel="noopener noreferrer">
  GitHub
</a>
```

- Never use `target="_blank"` without `rel="noopener noreferrer"`
- Exception: docs/learning links may open in same tab if user might want to replace current page (omit target and rel)
