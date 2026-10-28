import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Bar Chart Card',
  description: 'Grouped bars comparing two periods side by side, with rounded caps and a legend.',
  categories: ['charts'],
  dependencies: ['recharts'],
  registryDependencies: ['card'],
  date: '2026-10-28',
})
