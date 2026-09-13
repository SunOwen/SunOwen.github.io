<!--
This file is intentionally prefixed with `_` so the glob loader pattern
`[^_]*.{md,mdx}` automatically excludes it from the `/prs` page.

The `/prs` page is currently empty because the upstream
`githubPrsLoader` has been replaced with a local glob loader.

To restore upstream GitHub pull-request data:
  1. See `src/content.config.example.ts` for the loader config.
  2. Provide a `GITHUB_TOKEN` (PAT with `repo` scope) via your
     environment — `.env` for local dev, or a GitHub Actions secret
     for CI.
  3. Replace the `glob` block in `src/content.config.ts` with the
     `githubPrsLoader` snippet from the example file.

To use this directory for local-only entries, drop Markdown files
without the `_` prefix into this folder.
-->
