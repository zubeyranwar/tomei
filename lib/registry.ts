import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { items } from '@/registry/__index__'
import type { Scenario } from '@/registry/config'
import type { IndexedItem } from '@/registry/define'

const listed = items.filter((i) => !i.hidden)

export const getItems = (scenario?: Scenario) =>
  scenario ? listed.filter((i) => i.scenario === scenario) : listed

export const getItem = (name: string) => listed.find((i) => i.name === name)

const read = (path: string) => readFile(join(process.cwd(), path), 'utf8')

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
