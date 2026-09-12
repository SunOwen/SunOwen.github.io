import { getCollection } from 'astro:content'

import { withBasePath } from './path'
import {
  LOCALES,
  LOCALE_META,
  buildIdForLocale,
  getPostLocale,
  stripLocaleFromId,
} from './i18n'

import type { CollectionEntry } from 'astro:content'
import type { Locale } from './i18n'

type TranslatablePost = CollectionEntry<'blog' | 'changelog' | 'shorts'>

export interface TranslationLink {
  locale: Locale
  label: string
  href: string
  title: string
}

/**
 * Per-collection cache for `findTranslations`. Astro's content layer scans the
 * disk and validates the schema on every `getCollection` call; with one call
 * per post page we would re-do that work N times for a blog of N posts.
 */
const entriesByCollection = new Map<
  string,
  CollectionEntry<'blog' | 'changelog' | 'shorts'>[]
>()

async function getPublishedEntries(collection: TranslatablePost['collection']) {
  let entries = entriesByCollection.get(collection)
  if (!entries) {
    entries = await getCollection(collection, (entry) => {
      if (entry.data.redirect) return false
      if (import.meta.env.PROD && entry.data.draft) return false
      return true
    })
    entriesByCollection.set(collection, entries)
  }
  return entries
}

/** Builds the public URL of a post entry from its collection and id. */
export function getPostHref(collection: string, id: string): string {
  return withBasePath(`/${collection}/${id}/`)
}

/**
 * Finds the sibling translations of a post.
 *
 * Posts are paired by **base id**: `getting-started` (default locale) pairs
 * with `en/getting-started`. A translation is only offered when the counterpart
 * entry exists and is not a draft (in production) or a redirect.
 */
export async function findTranslations(
  post: TranslatablePost,
): Promise<TranslationLink[]> {
  const current = getPostLocale(post)
  const baseId = stripLocaleFromId(post.id, current)

  const others = LOCALES.filter((locale) => locale !== current)
  if (others.length === 0) return []

  const all = await getPublishedEntries(post.collection)
  const translations: TranslationLink[] = []

  for (const locale of others) {
    const wanted = buildIdForLocale(baseId, locale)
    const entry = all.find((e) => e.id === wanted)
    if (!entry) continue
    translations.push({
      locale,
      label: LOCALE_META[locale].label,
      href: getPostHref(post.collection, entry.id),
      title: entry.data.title,
    })
  }

  return translations.sort(
    (a, b) => LOCALES.indexOf(a.locale) - LOCALES.indexOf(b.locale),
  )
}
