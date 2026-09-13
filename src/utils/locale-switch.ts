import { getCollection } from 'astro:content'

import { seriesSlug } from './series'
import { LOCALES, LOCALE_META, type Locale } from './i18n'
import { stripBasePath } from './path'

import type { CollectionEntry } from 'astro:content'

/** Collections that have a bilingual counterpart. Pages outside these
 * roots hide the locale switch button. */
const BILINGUAL_COLLECTIONS = new Set(['blog', 'series'])

const COLLECTION_FOR_POST = new Set(['blog', 'changelog', 'shorts'])

export interface LocaleSwitchTarget {
  /** Where the user lands after clicking the switch. */
  href: string
  /** Whether the target entry (post or series slug) actually exists. */
  exists: boolean
}

/* ------------------------------------------------------------------ */
/* Module-level cache: one render pass re-reads collections N times   */
/* unless we cache by collection.                                       */
/* ------------------------------------------------------------------ */

const postIdCache = new Map<string, Set<string>>()
let seriesEntriesCache: CollectionEntry<'series'>[] | null = null

async function getPostIds(collection: 'blog' | 'changelog' | 'shorts') {
  let cached = postIdCache.get(collection)
  if (!cached) {
    const entries = await getCollection(collection)
    cached = new Set(entries.map((entry) => entry.id))
    postIdCache.set(collection, cached)
  }
  return cached
}

async function getSeriesEntries() {
  if (!seriesEntriesCache) {
    seriesEntriesCache = await getCollection('series')
  }
  return seriesEntriesCache
}

/* ------------------------------------------------------------------ */
/* Helpers for swapping locale prefixes inside an entry id.            */
/* ------------------------------------------------------------------ */

function isLocaleDir(segment: string): boolean {
  return LOCALES.some((locale) => LOCALE_META[locale].dir === segment)
}

/** Strip the locale directory prefix from `id` (e.g. `zh/foo` -> `foo`). */
function stripLocalePrefix(id: string, dir: string): string {
  if (!dir) return id
  const prefix = `${dir}/`
  return id.startsWith(prefix) ? id.slice(prefix.length) : id
}

/** Build the equivalent id under another locale's directory. */
function buildOtherId(id: string, fromDir: string, toDir: string): string {
  const stripped = stripLocalePrefix(id, fromDir)
  return toDir ? `${toDir}/${stripped}` : stripped
}

/* ------------------------------------------------------------------ */
/* Main function                                                       */
/* ------------------------------------------------------------------ */

/**
 * Compute the URL the locale-switch button should jump to.
 *
 * Returns `null` when the current page has no bilingual counterpart
 * (e.g. `/projects`, `/highlights`, `/404`) — the caller hides the
 * button in that case.
 */
export async function computeLocaleSwitchTarget(
  pathname: string,
  currentLocale: Locale,
): Promise<LocaleSwitchTarget | null> {
  // `Astro.url.pathname` in production SSG includes the configured base
  // (e.g. `/SunOwen.github.io/blog/zh/`). Strip it before matching so the
  // path segments line up with collection roots like `/blog/zh/`.
  pathname = stripBasePath(pathname)
  const otherLocale = LOCALES.find((locale) => locale !== currentLocale)
  if (!otherLocale) return null

  const otherDir = LOCALE_META[otherLocale].dir
  const currentDir = LOCALE_META[currentLocale].dir
  const segments = pathname.split('/').filter(Boolean)

  // ── Home `/` and per-locale home `/en/`, `/zh/` ────────────
  if (segments.length === 0) {
    // Jump to the other locale's homepage. The default locale's home
    // lives at `/`; prefixed locales live at `/<dir>/`.
    const otherHomeHref = otherDir ? `/${otherDir}/` : '/'
    return { href: otherHomeHref, exists: true }
  }
  if (segments.length === 1 && isLocaleDir(segments[0])) {
    // Same as above, but starting from the prefixed home `/<dir>/` —
    // jump to the default locale's `/`.
    return { href: '/', exists: true }
  }

  const [collection] = segments

  // ── Language entry pages `/blog/`, `/series/` ────────────────
  if (
    segments.length === 1 &&
    BILINGUAL_COLLECTIONS.has(collection)
  ) {
    return {
      href: `/${collection}/${otherDir === '' ? '' : `${otherDir}/`}`,
      exists: true,
    }
  }

  // ── Collection list pages `/blog/zh/`, `/series/en/` ────────
  if (
    segments.length === 2 &&
    BILINGUAL_COLLECTIONS.has(collection) &&
    isLocaleDir(segments[1])
  ) {
    return {
      href: `/${collection}/${otherDir === '' ? '' : `${otherDir}/`}`,
      exists: true,
    }
  }

  // ── Article / series detail ─────────────────────────────────
  if (segments.length >= 2 && BILINGUAL_COLLECTIONS.has(collection)) {
    const currentId = segments.slice(1).join('/')
    const otherId = buildOtherId(currentId, currentDir, otherDir)
    const fallbackHref = `/${collection}/${otherDir === '' ? '' : `${otherDir}/`}`

    if (collection === 'series') {
      const slug = stripLocalePrefix(currentId, currentDir)
      const exists = (await getSeriesEntries()).some(
        (entry) =>
          seriesSlug(entry) === slug && entry.data.lang === otherLocale,
      )
      return {
        href: exists
          ? `/series/${otherId}/`
 : fallbackHref,
        exists,
      }
    }

    if (COLLECTION_FOR_POST.has(collection)) {
      const ids = await getPostIds(
        collection as 'blog' | 'changelog' | 'shorts',
      )
      const exists = ids.has(otherId)
      return {
        href: exists ? `/${collection}/${otherId}/` : fallbackHref,
        exists,
      }
    }
  }

  // ── Non-bilingual pages ────────────────────────────────────────
  return null
}