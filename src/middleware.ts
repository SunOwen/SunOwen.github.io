import { defineMiddleware } from 'astro:middleware'

import {
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALES,
  prefixedLocales,
  type Locale,
} from '~/utils/i18n'
import { stripBasePath } from '~/utils/path'

const LOCALE_BY_DIR = new Map(
  prefixedLocales().map((locale) => [LOCALE_META[locale].dir, locale]),
)

/**
 * URL prefixes whose second segment is a locale directory.
 *
 * For each collection (blog, series, shorts, changelog) the URL
 * `/<prefix>/<dir>/...` selects a locale; the bare `/<prefix>/` page
 * is the language entry and renders in the default locale.
 *
 * Centralising the list keeps the rule readable and easy to extend
 * when new collections become bilingual.
 */
const LOCALIZED_PREFIXES = ['/blog', '/series', '/shorts', '/changelog'] as const

function isLocaleDir(segment: string): segment is Locale {
  return (LOCALES as readonly string[]).includes(segment)
}

/**
 * Derives the locale from the URL pathname.
 *
 * Pattern:
 * - `/`                                  -> default locale
 * - `/<prefix>/<dir>/...`                -> locale matching `<dir>`
 * - `/<prefix>/...` (bare, no dir)       -> default locale
 *
 * `<dir>` is matched against the configured locale directories
 * (`zh/`, `en/`). All non-default locales are reached through a
 * directory prefix; nothing sits at the collection root.
 */
function localeFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return DEFAULT_LOCALE

  for (const prefix of LOCALIZED_PREFIXES) {
    const prefixSegments = prefix.split('/').filter(Boolean)
    if (
      segments.length >= prefixSegments.length + 1 &&
      prefixSegments.every((seg, i) => segments[i] === seg)
    ) {
      const candidate = segments[prefixSegments.length]
      if (isLocaleDir(candidate)) {
        return LOCALE_BY_DIR.get(candidate) ?? DEFAULT_LOCALE
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
  // Production SSG renders each page with `Astro.url.pathname` set to the
  // route path *without* the configured base, but at runtime the incoming
  // request URL includes the base prefix. Strip it before deriving the
  // locale so both code paths agree.
  context.locals.locale = localeFromPath(stripBasePath(context.url.pathname))
  return next()
})