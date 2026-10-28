import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Analytics Dashboard',
  description:
    'A complete analytics screen: sidebar, search header, date range picker and a grid of line, bar, donut and ranked cards.',
  categories: ['analytics', 'layout'],
  dependencies: ['lucide-react'],
  registryDependencies: [
    'sidebar',
    'input',
    'button',
    'date-range-picker',
    'card',
    'line-chart-card',
    'bar-chart-card',
    'donut-chart-card',
  ],
  date: '2026-10-28',
})
