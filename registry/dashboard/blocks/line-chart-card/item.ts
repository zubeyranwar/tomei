import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Line Chart Card',
  description:
    'Smooth area chart comparing this period against the last, with a dotted comparison line, trend and legend.',
  categories: ['charts'],
  dependencies: ['recharts'],
  registryDependencies: ['card'],
  date: '2026-10-28',
})
