export const scenarios = {
  landing: {
    title: 'Landing',
    description: 'Marketing sites with motion, type and character.',
    kinds: ['components', 'sections', 'pages'],
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Product UI for data-dense apps.',
    kinds: ['components', 'blocks', 'pages'],
  },
} as const

export type Scenario = keyof typeof scenarios
export type Kind = (typeof scenarios)[Scenario]['kinds'][number]

export const kindTitles: Record<Kind, string> = {
  components: 'Components',
  sections: 'Sections',
  blocks: 'Blocks',
  pages: 'Pages',
}

export const kindTypes = {
  components: 'registry:component',
  sections: 'registry:block',
  blocks: 'registry:block',
  pages: 'registry:block',
} as const satisfies Record<Kind, string>
