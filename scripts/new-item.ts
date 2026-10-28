import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { scenarios, type Scenario } from '../registry/config'

const [scenario, kind, name] = process.argv.slice(2) as [Scenario, string, string]
const usage =
  'Usage: pnpm new <scenario> <kind> <name>   e.g. pnpm new landing components magnetic-button'

if (!scenario || !kind || !name) {
  console.error(usage)
  process.exit(1)
}
if (!(scenario in scenarios)) {
  console.error(`Unknown scenario "${scenario}". One of: ${Object.keys(scenarios).join(', ')}`)
  process.exit(1)
}
const kinds = scenarios[scenario].kinds as readonly string[]
if (!kinds.includes(kind)) {
  console.error(`"${kind}" is not a kind of ${scenario}. One of: ${kinds.join(', ')}`)
  process.exit(1)
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  console.error('Name must be kebab-case')
  process.exit(1)
}

const dir = join('registry', scenario, kind, name)
if (existsSync(dir)) {
  console.error(`${dir} already exists`)
  process.exit(1)
}

const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())
const title = name.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
const today = new Date().toISOString().slice(0, 10)

mkdirSync(dir, { recursive: true })

writeFileSync(
  join(dir, 'item.ts'),
  `import { defineItem } from '@/registry/define'

export default defineItem({
  title: '${title}',
  description: '',
  categories: [],
  dependencies: [],
  date: '${today}',
})
`,
)

writeFileSync(
  join(dir, `${name}.tsx`),
  `import { cn } from '@/lib/utils'

export function ${pascal}({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn(className)} {...props} />
}
`,
)

writeFileSync(
  join(dir, 'demo.tsx'),
  `import { ${pascal} } from './${name}'

export default function Demo() {
  return <${pascal}>${title}</${pascal}>
}
`,
)

console.log(`Created ${dir}`)
