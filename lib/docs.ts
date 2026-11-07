import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { slugify } from '@/lib/slug'

export type Heading = { id: string; label: string; depth: 2 | 3 }

export type DocPage = { slug: string; title: string; description?: string; order: number }

const DIR = join(/* turbopackIgnore: true */ process.cwd(), 'content/docs')

function frontmatter(source: string) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  return Object.fromEntries(
    block
      .split('\n')
      .map((line) => line.match(/^(\w+):\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, '')]),
  ) as Record<string, string>
}

export function getHeadings(source: string): Heading[] {
  let fenced = false
  return source.split('\n').flatMap((line) => {
    if (line.startsWith('```')) fenced = !fenced
    const match = !fenced && line.match(/^(##|###)\s+(.+)$/)
    if (!match) return []
    const label = match[2].replace(/[`*_]/g, '').trim()
    return [{ id: slugify(label), label, depth: match[1].length as 2 | 3 }]
  })
}

export function getDocs(): DocPage[] {
  if (!existsSync(DIR)) return []
  return readdirSync(DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const meta = frontmatter(readFileSync(join(DIR, file), 'utf8'))
      return {
        slug,
        title: meta.title ?? slug,
        description: meta.description,
        order: Number(meta.order ?? 99),
      }
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export const getDocSource = (slug: string) => readFileSync(join(DIR, `${slug}.mdx`), 'utf8')

export const docHref = (slug: string) => (slug === 'index' ? '/docs' : `/docs/${slug}`)
