import { glob, file } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import { feedLoader } from '@ascorbic/feed-loader'
import { githubReleasesLoader } from 'astro-loader-github-releases'
import { githubPrsLoader } from 'astro-loader-github-prs'
import { blueskyPostsLoader } from 'astro-loader-bluesky-posts'

import {
  pageSchema,
  postSchema,
  projectSchema,
  streamSchema,
  photoSchema,
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

const releases = defineCollection({
  loader: githubReleasesLoader({
    mode: 'repoList',
    repos: [
      'withastro/astro',
      'withastro/starlight',
      'lin-stephanie/astro-loaders',
      'lin-stephanie/astro-antfustyle-theme',
    ],
    monthsBack: 2,
    entryReturnType: 'byRelease',
    clearStore: true,
  }),
})

const prs = defineCollection({
  loader: githubPrsLoader({
    search:
      'repo:withastro/astro repo:withastro/starlight repo:lin-stephanie/astro-antfustyle-theme',
    monthsBack: 1,
    clearStore: true,
  }),
})

const highlights = defineCollection({
  loader: blueskyPostsLoader({
    uris: [
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lifesehhok27',
      'at://did:plc:iwhvwluesbbqtslwwdzgiize/app.bsky.feed.post/3lh3aonbqes2y',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lfwu3pka2c2j',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lfsayyhu4c2j',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lf3iyptedc2e',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lcv2yftszs2z',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lcl5ndm52c2s',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lcdimk36e226',
      'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lbkb6hizhk2f',
      'at://did:plc:oky5czdrnfjpqslww2a5iclo/app.bsky.feed.post/3lbayyemhzs2v',
      'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3larljiyi7s2v',
    ],
    newlineHandling: 'paragraph',
    fetchThread: true,
    threadDepth: 4,
    fetchOnlyAuthorReplies: true,
  }),
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
  loader: feedLoader({
    url: 'https://astro.build/rss.xml',
  }),
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
