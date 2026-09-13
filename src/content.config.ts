import { glob, file } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import {
  pageSchema,
  postSchema,
  projectSchema,
  streamSchema,
  photoSchema,
  highlightSchema,
} from '~/schema'
import { series } from '~/content/series'

const pages = defineCollection({
  loader: glob({ base: './src/pages', pattern: '**/*.mdx' }),
  schema: pageSchema,
})

const home = defineCollection({
  // Load every `index*.md` / `index*.mdx` under `src/content/home/`.
  // The default entry id is `index` (matches `pages/index.mdx`); locale
  // variants live alongside it as `index.en.md`, `index.zh.md`, etc.
  // `generateId` strips the file extension so each entry id equals its
  // file stem, letting `pages/index.mdx` look up the right variant via
  // `getEntry('home', 'index.<dir>')`.
  loader: glob({
    base: './src/content/home',
    pattern: 'index*.{md,mdx}',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
  }),
})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

const projects = defineCollection({
  loader: file('./src/content/projects/data.json'),
  schema: projectSchema,
})

// External data sources (`githubReleasesLoader`, `githubPrsLoader`,
// `feedLoader`) have been replaced with empty glob loaders so CI no
// longer depends on outbound network access — runners occasionally
// fail DNS or TCP handshakes to GitHub / astro.build, which surfaced
// as `fetch failed` during `pnpm check` and aborted the job.
//
// The corresponding npm packages and view code are intentionally kept
// in place; see `src/content.config.example.ts` for the restored
// configuration when you want to wire `/releases`, `/prs` or
// `/feeds` back to upstream data.
const releases = defineCollection({
  loader: glob({ base: './src/content/releases', pattern: '**/[^_]*.{md,mdx}' }),
})

const prs = defineCollection({
  loader: glob({ base: './src/content/prs', pattern: '**/[^_]*.{md,mdx}' }),
})

const highlights = defineCollection({
  loader: glob({
    base: './src/content/highlights',
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: highlightSchema,
})

const photos = defineCollection({
  loader: file('src/content/photos/data.json'),
  schema: photoSchema,
})

const shorts = defineCollection({
  loader: glob({ base: './src/content/shorts', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

const changelog = defineCollection({
  loader: glob({
    base: './src/content/changelog',
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: postSchema,
})

const streams = defineCollection({
  loader: file('./src/content/streams/data.json'),
  schema: streamSchema,
})

const feeds = defineCollection({
  loader: glob({ base: './src/content/feeds', pattern: '**/[^_]*.{md,mdx}' }),
})

export const collections = {
  pages,
  home,
  blog,
  series,
  projects,
  releases,
  prs,
  highlights,
  photos,
  shorts,
  changelog,
  streams,
  feeds,
}
