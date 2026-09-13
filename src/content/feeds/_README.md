<!--
This file is intentionally prefixed with `_` so the glob loader pattern
`[^_]*.{md,mdx}` automatically excludes it from the `/feeds` page.

The `/feeds` page is currently empty because the upstream `feedLoader`
has been replaced with a local glob loader.

To restore an RSS / Atom feed (e.g. `https://astro.build/rss.xml`):
  1. See `src/content.config.example.ts` for the loader config.
  2. Replace the `glob` block in `src/content.config.ts` with the
     `feedLoader` snippet from the example file, pointing `url` at the
     feed you want to consume.

To use this directory for local-only entries, drop Markdown files
without the `_` prefix into this folder.
-->
