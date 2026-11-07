declare module '@farm.js/core' {
  import type { UserConfig } from 'vite'

  export type Metadata = {
    metadataBase?: URL
    title?: string | { default: string; template?: string }
    description?: string
    robots?: { index?: boolean; follow?: boolean }
  }

  export function defineConfig(config: { srcDir?: string; vite?: UserConfig }): unknown
}

declare module '@farm.js/core/navigation' {
  export function notFound(): never
}

declare module '*.css'
