---
title: Bilingual Writing Workflow
subtitle: How one article can have both a Chinese and an English version
description: A per-article language switch workflow built on the Astro AntfuStyle Theme.
pubDate: 2026-09-10
tags: [i18n, workflow]
bgType: plum
ogImage: true
toc: true
---

This post has a Chinese counterpart. A language switcher appears right below the post metadata; clicking it jumps to the other version. Both URLs are linked with `hreflang`, so search engines understand that they are translations of the same article rather than duplicate content.

## Directory layout

The locale is derived from **where the file lives**, so you do not need extra frontmatter in every post:

```
src/content/blog/
├── bilingual-workflow.md        # default locale (Chinese) → /blog/bilingual-workflow/
└── en/
    └── bilingual-workflow.md    # English → /blog/en/bilingual-workflow/
```

Two posts are paired when their ids match after the locale directory is stripped. Nested directories keep working:

```
src/content/blog/series/one.md       → /blog/series/one/
src/content/blog/en/series/one.md    → /blog/en/series/one/
```

## Single source of truth for locale

This site derives the locale in `src/middleware.ts` from the URL pathname and stores it on `Astro.locals.locale`. Every component reads that one value — no `locale` prop drilling, and no `lang` frontmatter field on individual posts.

```
URL /blog/foo/                → locale=zh-Hans
URL /blog/en/foo/             → locale=en
URL /                         → locale=zh-Hans
URL /blog/en/                 → locale=en
```

## Suggested order of work

Finish one language first, then write the other, keeping the file names identical. A few things worth noting:

- **Titles do not have to be literal translations.** Each version only needs to respect the 60-character limit.
- **Keep `pubDate` aligned** so the two list pages stay in the same order. Use a separate date if the translation really ships later.
- **Tags are maintained per language.** Chinese and English tags never mix in one filter, because each list page renders a single locale.
- **The table of contents follows automatically.** It is parsed from the headings of the post being rendered, so the Chinese version shows Chinese section names and the English version shows English ones, with no extra configuration.

## Bilingual only where it matters

That is fine. A post without a counterpart simply does not render the language switcher, and nothing else changes. The rule is: look up the paired id, and only offer a link when that entry exists and is neither a draft nor a redirect.

## Migrating an existing site

If you used to set `lang:` in post frontmatter, please remove it. Locale is now derived entirely from the file path, and keeping both around is just confusing for whoever reads the markdown later.
