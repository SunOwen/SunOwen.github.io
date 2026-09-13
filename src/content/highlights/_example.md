<!--
This file is intentionally prefixed with `_` so that the glob loader pattern
`[^_]*.{md,mdx}` automatically excludes it from the `/highlights` page.

It serves as in-repo documentation: how to add your own highlight entries.

To add a real highlight:
  1. Create a new `.md` file in this directory (without the `_` prefix).
  2. Add frontmatter with at least `date`. Other fields are optional and are
     passed through to `CardItem.astro` for rendering:
       - `images`: array of { src, alt } (local paths under src/assets or URLs)
       - `video`:  { src, alt, poster }
       - `external`: { uri, title, description, thumb }
       - `link`: makes the whole card clickable
       - `tags`: array of tag strings
  3. Write the body in Markdown — it will be rendered inside the card.
-->
---
date: 2025-09-13
---

Create your first highlight by adding a `.md` file (without the `_` prefix)
to this directory. See the comment above for the available frontmatter fields.
