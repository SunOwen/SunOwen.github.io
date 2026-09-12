---
title: Why Reading Time Is Wrong for CJK
description: reading-time is calibrated for English, so Chinese posts come out roughly twice as long as they should.
pubDate: 2026-09-09
tags: [markdown, cjk]
bgType: false
ogImage: true
toc: true
---

The theme estimates reading time with a custom `remarkReadingTime` plugin in `plugins.ts`, built on the `reading-time` package. Its default assumption is 200 words per minute, which is calibrated for English prose.

## Where it goes wrong

Chinese has no spaces between words, so `reading-time` splits contiguous CJK runs at punctuation and ends up counting **roughly one word per character**. A 900-character Chinese article is reported as 900+ words, divided by 200 wpm, which lands at four and a half minutes and renders as "5 min".

A normal Chinese reading speed is 300 to 500 characters per minute, so 900 characters is really a two to three minute read. The estimate is **inflated by about 2x**.

## Three ways to fix it

The cheapest is to hard-code it in frontmatter:

```yaml
minutesRead: 3
```

`postSchema` types `minutesRead` as `number | boolean`, and a positive number overrides the computed value. The plugin short-circuits when the field is already set.

The second is to lower the denominator in one line:

```ts
getReadingTime(textOnPage, { wordsPerMinute: 400 })
```

The downside is that it applies site-wide, so mixed-language posts become inaccurate.

The third picks the speed from the content itself, which is what this site does. Count CJK characters and Latin words separately, then combine:

```ts
export function estimateMinutesRead(text: string): number {
  const { cjkChars, latinWords } = countText(text)
  if (cjkChars === 0) {
    return Math.max(1, Math.round(getReadingTime(text).minutes))
  }
  const minutes =
    cjkChars / 400 + latinWords / 200
  return Math.max(1, Math.round(minutes))
}
```

## Which file it belongs in

The helper lives in `src/utils/reading-time.ts`, and that file deliberately **imports no `astro:*` virtual modules and uses no `~/` alias**. The reason is that `plugins.ts` is imported by `astro.config.ts`, which runs before Vite resolves path aliases. So the import in `plugins.ts` is relative:

```ts
import { estimateMinutesRead } from './src/utils/reading-time'
```

This is the same constraint described in the theme's own `shorts/path-aliases`.
