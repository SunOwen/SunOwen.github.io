/**
 * Reference configuration for re-enabling external data sources.
 *
 * The current `src/content.config.ts` uses empty `glob` loaders so that
 * `pnpm check` / `pnpm build` work without outbound network access —
 * CI runners occasionally fail DNS resolution or TCP handshakes to
 * GitHub / astro.build, which surfaced as `fetch failed` during
 * `pnpm check` and aborted the job.
 *
 * To wire `/releases`, `/prs` or `/feeds` back to upstream data:
 *
 *   1. Provide a `GITHUB_TOKEN` (PAT with `repo` scope) via your
 *      environment — `.env` for local dev, or a GitHub Actions
 *      secret for CI.
 *
 *   2. Copy the relevant block(s) below into `src/content.config.ts`
 *      and remove the matching empty `glob` collection.
 *
 *   3. Note that Vite only exposes env vars prefixed with `VITE_` via
 *      `import.meta.env`. The loaders' `githubToken` option is set
 *      explicitly here from `process.env.GITHUB_TOKEN` to bypass that
 *      restriction.
 *
 * This file is documentation-only. The snippet below is wrapped so it
 * is never executed; copy the inner block into `src/content.config.ts`
 * instead. The wrappers keep `pnpm check` happy while leaving the
 * sample valid and readable.
 */

import { defineCollection } from 'astro:content'

import { feedLoader } from '@ascorbic/feed-loader'
import { githubReleasesLoader } from 'astro-loader-github-releases'
import { githubPrsLoader } from 'astro-loader-github-prs'

// eslint-disable-next-line no-constant-condition
if (false) {
  /* /releases — fetch releases from your own GitHub repos */
  const releases = defineCollection({
    loader: githubReleasesLoader({
      githubToken: process.env.GITHUB_TOKEN,
      mode: 'repoList',
      repos: [
        // 'withastro/astro',
        // 'withastro/starlight',
        'SunOwen/SunOwen.github.io',
      ],
      monthsBack: 12,
      entryReturnType: 'byRelease',
      clearStore: true,
    }),
  })

  /* /prs — search pull requests across your repos */
  const prs = defineCollection({
    loader: githubPrsLoader({
      githubToken: process.env.GITHUB_TOKEN,
      search: 'repo:SunOwen/SunOwen.github.io',
      monthsBack: 12,
      clearStore: true,
    }),
  })

  /* /feeds — fetch an RSS / Atom feed (e.g. the Astro blog) */
  const feeds = defineCollection({
    loader: feedLoader({
      url: 'https://astro.build/rss.xml',
    }),
  })

  // Make TypeScript treat these as intentionally unused.
  void releases
  void prs
  void feeds
}

export {}
