---
title: 双语写作工作流
subtitle: 一篇文章如何同时拥有中文版和英文版
description: 在 Astro AntfuStyle Theme 上实现文章级中英切换的工作流说明。
pubDate: 2026-09-10
tags: [i18n, 工作流]
bgType: plum
ogImage: true
toc: true
---

这篇文章有对应的英文版。页面标题下方会出现一个语言切换条，点击即可跳到英文版；两个版本的 URL 互相通过 `hreflang` 关联，搜索引擎能正确识别它们是同一篇文章的不同语言版本。

## 目录结构

语言由**文件位置**决定，不需要在每篇文章里手写 frontmatter：

```
src/content/blog/
├── bilingual-workflow.md        # 默认语言（中文）→ /blog/bilingual-workflow/
└── en/
    └── bilingual-workflow.md    # 英文 → /blog/en/bilingual-workflow/
```

配对规则是"去掉语言目录后的相对路径相同"。所以嵌套子目录也照样能配对：

```
src/content/blog/series/one.md       → /blog/series/one/
src/content/blog/en/series/one.md    → /blog/en/series/one/
```

## locale 的单一权威源

本站在 `src/middleware.ts` 里从 URL pathname 推断 locale，写到 `Astro.locals.locale`，所有组件读取这一处。不再需要在每个组件之间传递 `locale` prop，也不需要在 frontmatter 写 `lang` 字段。

```
URL /blog/foo/                → locale=zh-Hans
URL /blog/en/foo/             → locale=en
URL /                         → locale=zh-Hans
URL /blog/en/                 → locale=en
```

## 写作顺序

推荐的做法是先把一种语言写完并定稿，再写另一种语言，两边使用完全相同的文件名。要注意几点：

- **标题不必逐字对应**，两个语言版本各自遵守 60 字符上限即可。
- **`pubDate` 建议保持一致**，这样列表页的排序不会错乱。如果英文版晚发布，也可以给它单独的日期。
- **标签各自维护**。中文标签和英文标签不会混在同一个筛选器里，因为两个列表页是按语言分开渲染的。
- **目录（TOC）自动跟随**。TOC 是从当前这篇文章的标题解析出来的，所以中文版显示中文章节名，英文版显示英文章节名，不需要任何额外配置。

## 只想给部分文章做双语

完全可以。没有对应译文的文章不会显示语言切换条，其余功能不受影响。判断逻辑是：查找配对 id 的条目，存在且不是草稿、不是重定向，才提供链接。

## 迁移期提示

如果是从旧版本迁移过来的文章曾在 frontmatter 写过 `lang`，请把该字段删除，因为新版本完全依靠文件位置判断 locale。文件路径与 `lang` 同时存在时，可能让读者迷惑哪一个才是"真"的语言来源。
