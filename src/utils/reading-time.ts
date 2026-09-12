/**
 * Reading-time estimator that handles CJK text correctly.
 *
 * The `reading-time` package splits contiguous CJK runs at punctuation, counts
 * each fragment as an English "word", and divides by 200 wpm. For Chinese that
 * inflates the estimate by roughly 2x, because Chinese is read at 300-500
 * *characters* per minute rather than 200 words.
 *
 * Behaviour is deliberately conservative:
 * - text with **no** CJK characters goes through `reading-time` untouched, so
 *   English posts keep exactly the numbers the stock theme produced;
 * - text with CJK characters counts CJK characters and Latin words separately
 *   and applies a speed to each, so mixed-language posts come out right too.
 *
 * ⚠️ Dependency-free of `astro:*` on purpose: `plugins.ts` imports this file,
 * and `plugins.ts` runs before Vite resolves the `~/` alias.
 * See `shorts/path-aliases`.
 */
import getReadingTime from 'reading-time'

/** Characters per minute for CJK text. Chinese is usually read at 300-500. */
export const CJK_CHARS_PER_MINUTE = 400

/** Words per minute for Latin text — the `reading-time` default. */
export const LATIN_WORDS_PER_MINUTE = 200

const CJK_RE =
  /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/g

const LATIN_WORD_RE = /[\p{L}\p{N}'’@_-]+/gu

/** Splits text into its CJK character count and non-CJK word count. */
export function countText(text: string): {
  cjkChars: number
  latinWords: number
} {
  const cjkChars = (text.match(CJK_RE) ?? []).length
  const withoutCjk = text.replace(CJK_RE, ' ')
  const latinWords = (withoutCjk.match(LATIN_WORD_RE) ?? []).length
  return { cjkChars, latinWords }
}

/**
 * Estimates reading time in whole minutes (minimum 1).
 *
 * @example pure English post   -> identical to `reading-time` at 200 wpm
 * @example 400 CJK characters  -> 1
 * @example 300 CJK + 100 words -> 1
 */
export function estimateMinutesRead(text: string): number {
  const { cjkChars, latinWords } = countText(text)

  if (cjkChars === 0) {
    return Math.max(1, Math.round(getReadingTime(text).minutes))
  }

  const minutes =
    cjkChars / CJK_CHARS_PER_MINUTE + latinWords / LATIN_WORDS_PER_MINUTE
  return Math.max(1, Math.round(minutes))
}
