import rss from '@astrojs/rss'

import { SITE } from '../config'
import { getFilteredPosts, getSortedPosts } from './data'
import { LOCALE_META } from './i18n'
import { withBasePath } from './path'

import type { Locale } from './i18n'

/**
 * Builds a locale-scoped RSS feed.
 *
 * Each locale gets its own feed so subscribers only receive the language they
 * asked for. Kept outside `src/pages/` because every `.js`/`.ts` file in
 * `src/pages/` is treated as a route endpoint.
 */
export async function buildLocaleRss(locale: Locale) {
  const meta = LOCALE_META[locale]
  const posts = getSortedPosts(await getFilteredPosts('blog', locale))

  return rss({
    title: meta.dir ? `${SITE.title} (${meta.label})` : SITE.title,
    description: SITE.description,
    site: SITE.website,
    customData: `
      <language>${meta.lang}</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <image>
        <title>${SITE.title}</title>
        <url>${SITE.website}/icon-512.png</url>
        <link>${SITE.website}</link>
      </image>`,

    items: posts.map((item) => ({
      title: `${item.data.title}`,
      link: withBasePath(`/blog/${item.id}/`),
      pubDate: item.data.pubDate,
      description: item.data.description,
      author: SITE.author,
    })),

    stylesheet: withBasePath('/rss-styles.xsl'),
  })
}
