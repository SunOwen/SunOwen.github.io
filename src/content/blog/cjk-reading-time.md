---
title: 中文阅读时长为什么算不准
description: reading-time 按英文词速估算，中文文章会虚高约两倍，以及三种修法。
pubDate: 2026-09-09
tags: [markdown, 中文]
bgType: false
ogImage: true
toc: true
---

主题用 `plugins.ts` 里的自定义插件 `remarkReadingTime` 计算阅读时长，底层是 `reading-time` 这个包。它默认按每分钟 200 个"词"来估算，这个速度是按英文校准的。

## 问题出在哪

中文没有空格分词，`reading-time` 会把连续的汉字串按标点切开计数，结果**每个汉字大致被当成一个英文单词**。一篇九百字左右的中文文章会被算成九百多个词，除以每分钟两百词，得到四分半，页面上显示"5 分钟"。

而中文的正常阅读速度是每分钟三百到五百字，九百字实际只需要两到三分钟。也就是说，**估算值虚高了大约两倍**。

## 三种修法

第一种最省事：在 frontmatter 里直接写死。

```yaml
minutesRead: 3
```

`postSchema` 的 `minutesRead` 类型是 `number | boolean`，正数会直接覆盖自动计算值，而且插件开头有短路判断，写了就不会再算。

第二种是调低分母，一行改动：

```ts
getReadingTime(textOnPage, { wordsPerMinute: 400 })
```

缺点是全站统一，中英混排的文章会不准。

第三种是按内容自动选择，也是本站采用的方案。先统计中日韩字符占非空白字符的比例，再据此加权：

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

## 放在哪个文件里

这个函数放在 `src/utils/reading-time.ts`，而且这个文件**刻意不引入任何 `astro:*` 虚拟模块、也不使用 `~/` 别名**。原因是 `plugins.ts` 会被 `astro.config.ts` 引入，运行在 Vite 解析路径别名之前，用了别名就会解析失败。所以 `plugins.ts` 里写的是相对路径：

```ts
import { estimateMinutesRead } from './src/utils/reading-time'
```

这和主题自己的 `shorts/path-aliases` 里提到的限制是同一条。
