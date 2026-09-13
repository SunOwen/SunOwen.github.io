<!--
This file is intentionally prefixed with `_` so the glob loader pattern
`[^_]*.{md,mdx}` automatically excludes it from the `/releases` page.

The `/releases` page is currently empty because the upstream
`githubReleasesLoader` has been replaced with a local glob loader.

To restore upstream GitHub release data:
  1. See `src/content.config.example.ts` for the loader config.
  2. Provide a `GITHUB_TOKEN` (PAT with `repo` scope) via your
     environment — `.env` for local dev, or a GitHub Actions secret
     for CI.
  3. Replace the `glob` block in `src/content.config.ts` with the
     `githubReleasesLoader` snippet from the example file.

To use this directory for local-only entries, drop Markdown files
without the `_` prefix into this folder. The file's frontmatter
fields are not currently constrained (no schema), so anything you
write is passed through to the view as-is.
-->
