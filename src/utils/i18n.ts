/**
 * Locale registry for the bilingual blog.
 *
 * ⚠️ This module must stay **dependency-free** (no `astro:*` virtual modules,
 * no `~/` path alias) because it is also imported from `plugins.ts`, which runs
 * before Vite resolves aliases. See `shorts/path-aliases`.
 */

/** All locales supported by the site. */
export const LOCALES = ['zh-Hans', 'en'] as const

export type Locale = (typeof LOCALES)[number]

/**
 * The locale whose posts live at the **root** of each content collection and
 * whose URLs carry **no** language segment.
 *
 * Change this to `'en'` if you want English to be the prefix-free default.
 */
export const DEFAULT_LOCALE: Locale = 'zh-Hans'

export interface LocaleMeta {
  /** BCP 47 tag for `<html lang>`, `toLocaleDateString()` and `localeCompare()`. */
  lang: string
  /** Native label rendered in the language switcher. */
  label: string
  /** Short label for compact UI (nav chips, `<html lang>` of list pages). */
  shortLabel: string
  /** `language_TERRITORY` for `og:locale`. */
  ogLocale: string
  /**
   * Sub-directory inside a content collection that holds this locale's posts,
   * and therefore the leading URL segment of those posts.
   * Empty string for the default locale.
   *
   * @example 'en' -> `src/content/blog/en/hello.md` -> `/blog/en/hello/`
   */
  dir: string
  /** Words-per-minute used to estimate reading time (CJK reads faster per "word"). */
  wordsPerMinute: number
  /** Path of this locale's RSS feed. */
  rssPath: string
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  'zh-Hans': {
    lang: 'zh-Hans',
    label: '中文',
    shortLabel: '中',
    ogLocale: 'zh_CN',
    dir: '',
    wordsPerMinute: 400,
    rssPath: '/rss.xml',
  },
  en: {
    lang: 'en',
    label: 'English',
    shortLabel: 'EN',
    ogLocale: 'en_US',
    dir: 'en',
    wordsPerMinute: 200,
    rssPath: '/rss-en.xml',
  },
}

/** UI strings that live on the article/list pages and follow the post locale. */
export const UI_STRINGS = {
  'zh-Hans': {
    min: '分钟',
    updated: '更新于',
    toc: '目录',
    skipToc: '跳到目录',
    tags: '标签',
    skipTags: '跳到标签',
    chooseTags: '选择标签',
    shareOn: '分享到',
    empty: '暂无内容',
    alsoAvailableIn: '本文其他语言版本',
    language: '语言',
    postList: '文章列表',
    series: {
      positionInSeries: '第 {i} / {n} 篇',
      viewAll: '查看全系列 {n} 篇 →',
      isFirst: '已是第一篇',
      isLast: '已是最后一篇',
      countPosts: '共 {n} 篇',
      backToAllSeries: '← 全部专栏',
      latestUpdate: '最近更新 {date}',
    },
  },
  en: {
    min: 'min',
    updated: 'Updated',
    toc: 'Table of Contents',
    skipToc: 'Skip toc',
    tags: 'Tags',
    skipTags: 'Skip tags',
    chooseTags: 'Choose Tags',
    shareOn: 'share on',
    empty: 'nothing here yet',
    alsoAvailableIn: 'Also available in',
    language: 'Language',
    postList: 'Post list',
    series: {
      positionInSeries: 'Part {i} / {n}',
      viewAll: 'View all {n} posts →',
      isFirst: 'Already the first post',
      isLast: 'Already the last post',
      countPosts: '{n} posts',
      backToAllSeries: '← All series',
      latestUpdate: 'Latest update {date}',
    },
  },
} as const

export type UiStringKey = keyof (typeof UI_STRINGS)[typeof DEFAULT_LOCALE]

export type UiStringNestedKey = {
  [K in UiStringKey]: (typeof UI_STRINGS)[typeof DEFAULT_LOCALE][K] extends Record<
    string,
    string
  >
    ? `${K}.${keyof (typeof UI_STRINGS)[typeof DEFAULT_LOCALE][K] & string}`
    : never
}[UiStringKey]
export type UiStringAnyKey = UiStringKey | UiStringNestedKey

/** Looks up a UI string for a locale, falling back to the default locale. */
export function t(
  locale: Locale | undefined,
  key: UiStringAnyKey,
  params?: Record<string, string | number>,
): string {
  const dict = (locale ? UI_STRINGS[locale] : UI_STRINGS[DEFAULT_LOCALE]) as Record<
    string,
    unknown
  >
  let raw: unknown
  if (typeof key === 'string' && key.includes('.')) {
    const [group, sub] = key.split('.', 2)
    raw = (dict[group] as Record<string, unknown> | undefined)?.[sub]
    if (typeof raw !== 'string') {
      const fallbackGroup = (UI_STRINGS[DEFAULT_LOCALE] as Record<string, unknown>)[
        group
      ] as Record<string, unknown> | undefined
      raw = fallbackGroup?.[sub]
    }
  } else {
    raw = dict[key as string]
    if (typeof raw !== 'string') {
      raw = (UI_STRINGS[DEFAULT_LOCALE] as Record<string, unknown>)[
        key as string
      ]
    }
  }
  if (typeof raw !== 'string') return ''
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  )
}

/** Type guard for `Locale`. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Non-default locales, i.e. the ones that own a content sub-directory. */
export function prefixedLocales(): Locale[] {
  return LOCALES.filter((locale) => LOCALE_META[locale].dir !== '')
}

/**
 * Derives the locale of a content entry from its id (relative path).
 *
 * @example 'hello'          -> 'zh-Hans' (default, no prefix)
 * @example 'en/hello'       -> 'en'
 * @example 'en/series/one'  -> 'en'
 */
export function localeFromId(id: string): Locale {
  const first = id.split('/')[0]
  const match = prefixedLocales().find(
    (locale) => LOCALE_META[locale].dir === first,
  )
  return match ?? DEFAULT_LOCALE
}

/** Removes the locale directory prefix from an entry id. */
export function stripLocaleFromId(id: string, locale: Locale): string {
  const dir = LOCALE_META[locale].dir
  return dir && id.startsWith(`${dir}/`) ? id.slice(dir.length + 1) : id
}

/** Builds the entry id a post would have in another locale. */
export function buildIdForLocale(baseId: string, locale: Locale): string {
  const dir = LOCALE_META[locale].dir
  return dir ? `${dir}/${baseId}` : baseId
}

/**
 * Resolves the locale of a post from the entry id. Locale is always derived
 * from file location; an explicit `lang` field in frontmatter is intentionally
 * not honoured (use the file path instead).
 */
export function getPostLocale(post: { id: string }): Locale {
  return localeFromId(post.id)
}

/** `<html lang>` / `toLocaleDateString()` tag for a locale. */
export function langTag(locale: Locale | undefined): string {
  return LOCALE_META[locale ?? DEFAULT_LOCALE].lang
}

/** `og:locale` value for a locale. */
export function ogLocale(locale: Locale | undefined): string {
  return LOCALE_META[locale ?? DEFAULT_LOCALE].ogLocale
}

/** CJK characters as a ratio of all non-whitespace characters. */
export function cjkRatio(text: string): number {
  const chars = Array.from(text.replace(/\s/g, ''))
  if (chars.length === 0) return 0
  const cjk = chars.filter(
    (c) =>
      /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(c) ||
      /[\u3040-\u30FF]/.test(c) ||
      /[\uAC00-\uD7AF]/.test(c),
  ).length
  return cjk / chars.length
}
