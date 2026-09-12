import { defineMiddleware } from 'astro:middleware'

import {
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALES,
  prefixedLocales,
  type Locale,
} from '~/utils/i18n'

/**
 * URL prefixes that take a non-default locale segment.
 *
 * When a path matches one of these prefixes, the segment **after** the prefix
 * is the locale. Anything else is the default locale. Centralising the list
 * keeps the rule readable and easy to extend when new collections become
 * bilingual.
 */
const LOCALIZED_PREFIXES = ['/blog', '/shorts', '/changelog', '/series'] as const

const LOCALE_BY_DIR = new Map(
  prefixedLocales().map((locale) => [LOCALE_META[locale].dir, locale]),
)

/**
 * Derives the locale from the URL pathname.
 *
 * The default locale has no URL prefix; non-default locales insert a segment
 * immediately after the collection prefix (e.g. `/blog/en/foo/`). Series
 * pages follow the same rule (`/series/en/<id>/`). Pages outside a localised
 * prefix fall back to the default locale.
 */
function localeFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return DEFAULT_LOCALE

  // Two-segment patterns: /<prefix>/<dir>/...
  for (const prefix of LOCALIZED_PREFIXES) {
    const prefixSegments = prefix.split('/').filter(Boolean)
    if (
      segments.length >= prefixSegments.length + 1 &&
      prefixSegments.every((seg, i) => segments[i] === seg)
    ) {
      const candidate = segments[prefixSegments.length]
      if (candidate && (LOCALES as readonly string[]).includes(candidate)) {
        return candidate as Locale
      }
      return DEFAULT_LOCALE
    }
  }

  // Root-level localised paths, e.g. /en/about/ (none defined today, kept
  // for future expansion).
  const head = segments[0]
  const match = LOCALE_BY_DIR.get(head)
  return match ?? DEFAULT_LOCALE
}

export const onRequest = defineMiddleware((context, next) => {
  context.locals.locale = localeFromPath(context.url.pathname)
  return next()
})
