import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

import { LOCALES, LOCALE_META, type Locale } from '~/utils/i18n'

const seriesDir = new URL('../content/series/', import.meta.url)

/**
 * Reverse-lookup: which locale's `dir` matches this file name?
 * E.g. `zh.json` -> `zh-Hans`, `en.json` -> `en`.
 */
function localeFromFileName(fileName: string): Locale | undefined {
  const dir = fileName.replace(/\.json$/, '')
  return (Object.keys(LOCALE_META) as Locale[]).find(
    (locale) => LOCALE_META[locale].dir === dir,
  )
}

/**
 * Astro's data store requires entry ids to be unique. Two entries with the
 * same slug (e.g. `astro-in-action` for both `en.json` and `zh.json`) would
 * otherwise collide. We work around this by giving the *entry id* a
 * locale-prefix matching the source file (`en/astro-in-action`,
 * `zh/astro-in-action`), then stripping the prefix back off when callers
 * want the bare slug for URLs.
 */
export function stripLocalePrefixFromEntryId(id: string): string {
  for (const locale of LOCALES) {
    const dir = LOCALE_META[locale].dir
    if (!dir) continue
    const prefix = `${dir}/`
    if (id.startsWith(prefix)) return id.slice(prefix.length)
  }
  return id
}

async function loadSeries() {
  const entries: { id: string }[] = []
  const files = await readdir(fileURLToPath(seriesDir)).catch(() => [])

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const fileLocale = localeFromFileName(file)
    if (!fileLocale) {
      throw new Error(
        `Series file "${file}" does not match any configured locale directory (${Object.values(
          LOCALE_META,
        )
          .map((m) => m.dir)
          .filter(Boolean)
          .join(', ')})`,
      )
    }
    const fileDir = LOCALE_META[fileLocale].dir
    const contents = await readFile(new URL(file, seriesDir), 'utf-8')
    const data = JSON.parse(contents)
    if (!Array.isArray(data)) {
      throw new Error(
        `Series file ${file} must contain an array, got ${typeof data}`,
      )
    }
    for (const item of data) {
      if (!item.id || typeof item.id !== 'string') {
        throw new Error(`Series entry in ${file} is missing an "id" field`)
      }
      // The function loader must spread the entry's fields with an `id`
      // property as the unique data-store key. We strip `item.id` (the bare
      // slug) from the spread so the prefixed `entryId` is the only `id` in
      // the persisted object — keeping the schema clean of the locale prefix.
      const entryId = `${fileDir}/${item.id}`
      const { id: _slug, ...rest } = item
      entries.push({ ...rest, id: entryId })
    }
  }

  return entries
}

export const seriesSchema = z.object({
  lang: z
    .enum([...LOCALES] as [Locale, ...Locale[]])
    .default('zh-Hans')
    .describe(
      '**Required**. Language of this series entry. Pairs entries across JSON files by `entry.id` slug + `data.lang` to assemble a localised series.',
    ),
  title: z.string().min(1).describe('**Required**. Display title of the series.'),
  desc: z
    .string()
    .default('')
    .describe('Short description shown on the series overview and pages.'),
  icon: z
    .string()
    .regex(
      /^i-[\w-]+(:[\w-]+)?$/,
      'Icon must be in the format `i-<collection>-<icon>` or `i-<collection>:<icon>` as per UnoCSS specs.',
    )
    .describe('**Required**. Icon representing the series.'),
  order: z
    .number()
    .int()
    .default(0)
    .describe('Sorts the series on the overview page. Smaller comes first.'),
  bgType: z
    .enum(['plum', 'dot', 'rose', 'particle'])
    .default('plum')
    .describe('Background applied to the series page and its generated OG image.'),
  ogImage: z
    .boolean()
    .default(true)
    .describe('Controls OG image metadata for the series page.'),
})

export const series = defineCollection({
  loader: loadSeries,
  schema: seriesSchema,
})