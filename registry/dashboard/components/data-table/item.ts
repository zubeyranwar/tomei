import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Data Table',
  description:
    'An index table with view tabs, search, filter chips, a sort menu, sortable headers, row selection with bulk actions, loading rows and an empty state.',
  categories: ['tables', 'filters'],
  cssVars: {
    light: {
      'shadow-button':
        '0 1px 2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.8)',
      'shadow-card': '0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.07)',
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.08)',
    },
    dark: {
      'shadow-button':
        '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
      'shadow-card':
        '0 4px 4px rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, inset 0 1px 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.5), 0 0 0 1px #0e0e0e',
    },
  },
  date: '2026-10-28',
})
