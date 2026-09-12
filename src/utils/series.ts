import { getCollection } from 'astro:content'

import { getFilteredPosts } from './data'
import { stripLocalePrefixFromEntryId } from '~/content/series'
import { getPostLocale } from './i18n'

import type { CollectionEntry } from 'astro:content'
import type { Locale } from './i18n'

/**
 * Slug of a series entry — the unique id with the locale prefix stripped
 * back off. This is what URLs use (`/series/<slug>/`).
 */
export function seriesSlug(entry: CollectionEntry<'series'>): string {
  return stripLocalePrefixFromEntryId(entry.id)
}

/**
 * Returns all series entries for a locale, sorted by their `order` field.
 * When called without arguments, returns entries for the default locale.
 */
export async function getSeriesEntries(locale?: Locale) {
  const all = await getCollection('series')
  const filtered = locale ? all.filter((entry) => entry.data.lang === locale) : all
  return filtered.sort((a, b) => a.data.order - b.data.order)
}

/**
 * Returns every series entry that shares the same slug (across locales).
 */
export async function getSeriesTranslations(
  slug: string,
): Promise<CollectionEntry<'series'>[]> {
  const all = await getCollection('series')
  return all.filter((entry) => seriesSlug(entry) === slug)
}

/**
 * Returns published posts belonging to a series, sorted by `seriesOrder`.
 */
export async function getSeriesPosts(slug: string) {
  const posts = await getFilteredPosts('blog')
  const inSeries = posts.filter((post) => post.data.series === slug)
  const orderCounts = new Map<number, number>()
  for (const post of inSeries) {
    const n = (orderCounts.get(post.data.seriesOrder) ?? 0) + 1
    orderCounts.set(post.data.seriesOrder, n)
  }
  for (const [order, count] of orderCounts) {
    if (count > 1) {
      console.warn(
        `[series] duplicate \`seriesOrder=${order}\` in series "${slug}" (${count} posts)`,
      )
    }
  }
  return inSeries.sort(
    (a, b) => a.data.seriesOrder - b.data.seriesOrder,
  )
}

/**
 * Returns the neighbours of a post inside its series.
 */
export async function getSeriesNeighbours(
  post: CollectionEntry<'blog' | 'changelog' | 'shorts'>,
) {
  const seriesId = post.data.series
  if (!seriesId) return undefined

  const posts = await getSeriesPosts(seriesId)
  const index = posts.findIndex((item) => item.id === post.id)
  if (index === -1) return undefined

  const translations = await getSeriesTranslations(seriesId)
  // Pick the entry whose locale matches the post's locale first; fall back to
  // any entry so we always have a title/icon to display.
  const postLocale = getPostLocale(post)
  const entry =
    translations.find((item) => item.data.lang === postLocale) ??
    translations[0]

  return {
    meta: entry,
    total: posts.length,
    index,
    prev: index > 0 ? posts[index - 1] : undefined,
    next: index < posts.length - 1 ? posts[index + 1] : undefined,
  }
}
