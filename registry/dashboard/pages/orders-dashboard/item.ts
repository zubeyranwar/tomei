import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Orders Dashboard',
  description:
    'An orders screen: sidebar with nested links, page actions, stat cards and an index table with views, search, filter chips, sorting and bulk selection.',
  categories: ['tables', 'layout'],
  dependencies: ['lucide-react'],
  registryDependencies: [
    'sidebar',
    'button',
    'badge',
    'data-table',
    'stat-card',
    'date-range-picker',
  ],
  date: '2026-10-28',
})
