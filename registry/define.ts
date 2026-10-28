import type { Kind, Scenario } from './config'

export type ItemMeta = {
  title: string
  description: string
  categories?: string[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  cssVars?: {
    theme?: Record<string, string>
    light?: Record<string, string>
    dark?: Record<string, string>
  }
  css?: Record<string, unknown>
  docs?: string
  date?: string
}

export const defineItem = (meta: ItemMeta) => meta

export type IndexedItem = ItemMeta & {
  name: string
  scenario: Scenario
  kind: Kind
  dir: string
  files: string[]
  hasPrompt: boolean
}
