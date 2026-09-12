// https://unocss.dev/presets/attributify#typescript-support-jsx-tsx
import type {
  AttributifyAttributes,
  AttributifyNames,
} from 'unocss/preset-attributify'

import type { Locale } from './utils/i18n'

type Prefix = 'u-' // change it to your prefix

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes
      extends
        AttributifyAttributes,
        Partial<Record<AttributifyNames<Prefix>, string>> {}
  }

  namespace App {
    interface Locals {
      locale: Locale
    }
  }
}

export {}
