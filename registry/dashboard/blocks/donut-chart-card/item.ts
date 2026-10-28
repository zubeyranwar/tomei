import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Donut Chart Card',
  description:
    'A donut breakdown with the total and trend in the centre and a legend listing each slice with its change.',
  categories: ['charts'],
  dependencies: ['recharts'],
  registryDependencies: ['card'],
  date: '2026-10-28',
})
