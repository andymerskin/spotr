# CodeMirror SSR Defer Pattern

CodeMirror (and libraries that use `useLayoutEffect`) must not render during SSR. Defer until client mount.

**Why:** CodeMirror uses `useLayoutEffect` internally. React's useLayoutEffect doesn't run on the server, causing SSR warnings and hydration mismatch.

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

return (
  <div>
    {mounted ? (
      <CodeMirror {...props} />
    ) : (
      <div
        style={{ height: '640px' }}
        className="text-sm font-mono text-neutral-300 whitespace-pre"
      >
        {fallbackContent}
      </div>
    )}
  </div>
);
```

- Use `useEffect` (not useLayoutEffect) to set mounted—effect runs after paint, safe for SSR
- Provide a same-dimension placeholder during SSR to avoid layout shift
- Apply the same pattern to any client-only library that uses useLayoutEffect
