import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { items } from '@/registry/__index__'
import type { Scenario } from '@/registry/config'
import type { IndexedItem } from '@/registry/define'
import { registryUrl } from '@/lib/site'

export const getItems = (scenario?: Scenario) =>
  scenario ? items.filter((i) => i.scenario === scenario) : items

export const getItem = (name: string) => items.find((i) => i.name === name)

const read = (path: string) =>
  readFile(join(/* turbopackIgnore: true */ process.cwd(), path), 'utf8')

export const getSource = (item: IndexedItem) =>
  Promise.all(
    item.files.map(async (path) => ({
      path: relative(item.dir, path),
      code: await read(path),
    })),
  )

export const installDir = (item: IndexedItem) =>
  `components/${item.scenario}${item.files.length > 1 ? `/${item.name}` : ''}`

export const getDemo = async (item: IndexedItem) =>
  (await read(`${item.dir}/demo.tsx`)).replace(
    /from '\.\/([^']+)'/g,
    (_, file: string) => `from '@/${installDir(item)}/${file}'`,
  )

export function getSiblings(item: IndexedItem) {
  const list = getItems(item.scenario)
  const i = list.findIndex((x) => x.name === item.name)
  return { prev: list[i - 1], next: list[i + 1] }
}

export async function getPrompt(item: IndexedItem) {
  const intro = item.hasPrompt
    ? (await read(`${item.dir}/prompt.md`)).trim()
    : `Add the "${item.title}" ${item.kind.replace(/s$/, '')} to my React + Tailwind CSS v4 project. ${item.description}`

  const files = await getSource(item)
  const deps = item.dependencies?.length ? `\n\nInstall: ${item.dependencies.join(' ')}` : ''

  return [
    intro,
    `\n\nThe fastest way is the shadcn CLI:\nnpx shadcn@latest add ${registryUrl(item.name)}`,
    deps,
    '\n\nOtherwise create these files:',
    ...files.map((f) => `\n\n${f.path}\n\`\`\`tsx\n${f.code.trim()}\n\`\`\``),
  ].join('')
}
